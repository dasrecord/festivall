import json
import runpy
import unittest
from pathlib import Path
from types import SimpleNamespace


class Table:
    def __init__(self):
        self.rows = []

    @property
    def numRows(self):
        return len(self.rows)

    @property
    def numCols(self):
        return len(self.rows[0]) if self.rows else 0

    def __getitem__(self, index):
        return SimpleNamespace(val=self.rows[index[0]][index[1]])

    def appendRow(self, values):
        self.rows.append([str(value) for value in values])

    def appendCol(self, values):
        for index, row in enumerate(self.rows):
            row.append(values[index] if index < len(values) else '')

    def clear(self, keepFirstRow=False):
        self.rows = self.rows[:1] if keepFirstRow else []

    def deleteRow(self, index):
        self.rows.pop(index)


class Pulse:
    def __init__(self):
        self.count = 0

    def pulse(self):
        self.count += 1


class Callback:
    path = '/callback'

    def __init__(self, parent):
        self.network = parent
        self.storage = {}

    def parent(self):
        return self.network

    def fetch(self, key, default):
        return self.storage.get(key, default)

    def store(self, key, value):
        self.storage[key] = value


class Network:
    def __init__(self):
        self.table = Table()
        self.created = {}
        self.output = SimpleNamespace(path='/output', par=SimpleNamespace(text='saved text'))
        self.timer = SimpleNamespace(par=SimpleNamespace(
            initialize=Pulse(), start=Pulse(), length=0
        ))
        self.flags = SimpleNamespace(par=SimpleNamespace())

    def op(self, name):
        return {
            'messages': self.table, 'latest_text': self.output,
            'shoutout_timer': self.timer, 'latest_fx': self.flags
        }.get(name, self.created.get(name))

    def parent(self):
        return self

    def create(self, operator_type, name):
        table = Table()
        self.created[name] = table
        return table


class CallbackTests(unittest.TestCase):
    def setUp(self):
        self.network = Network()
        self.me = Callback(self.network)
        self.scheduled = []
        globals_ = {
            'me': self.me, 'websocketDAT': object, 'tableDAT': object,
            'constantCHOP': object, 'run': self.schedule,
            'absTime': SimpleNamespace(seconds=12.5)
        }
        path = Path(__file__).with_name('touchdesigner-websocket-callbacks.py')
        self.callback = runpy.run_path(str(path), init_globals=globals_)

    def schedule(self, code, *args, **kwargs):
        self.scheduled.append((code, args, kwargs))

    def execute_scheduled(self, index):
        code, args, _ = self.scheduled[index]
        operators = {'/callback': self.me, '/output': self.network.output}
        exec(code, {'op': operators.get, 'args': args})

    def send(self, **data):
        self.callback['onReceiveText'](None, 0, json.dumps(data))

    def test_connect_creates_paint_table_and_reconnect_preserves_points(self):
        self.callback['onConnect'](None)
        paint = self.network.op('paint_points')
        self.assertIsNotNone(paint)
        self.assertEqual(paint.rows, [['user', 'name', 'color', 'x', 'y', 'end', 'time']])
        self.send(type='paint', user='123', name='A', color='#123456',
                  points=[[0.2, 0.3], [0.4, 0.5]], end=True)
        self.assertEqual(paint.rows[-1], ['123', 'A', '#123456', '0.4', '0.5', '1', '12.5'])
        self.callback['onConnect'](None)
        self.assertIs(self.network.op('paint_points'), paint)
        self.assertEqual(len(paint.rows), 3)

    def test_replay_populates_history_without_showing_or_starting_timer(self):
        self.callback['onConnect'](None)
        self.assertEqual(self.network.output.par.text, '')
        self.send(type='reset')
        self.send(type='text', text='old', badgeNumber=3, replay=True)
        self.assertEqual(self.network.table.rows[-1][1], 'old')
        self.assertEqual(self.network.output.par.text, '')
        self.assertEqual(self.network.timer.par.start.count, 0)
        self.assertEqual(self.scheduled, [])

    def test_live_messages_expire_without_clearing_newer_messages(self):
        self.send(type='text', text='first', badgeNumber=4)
        self.assertEqual(self.network.timer.par.length, 40)
        self.assertEqual(self.scheduled[0][2]['delayMilliSeconds'], 40000)
        self.send(type='text', text='second', badgeNumber=None)
        self.assertEqual(self.network.timer.par.length, 5)
        self.execute_scheduled(0)
        self.assertEqual(self.network.output.par.text, 'second')
        self.execute_scheduled(1)
        self.assertEqual(self.network.output.par.text, '')
        self.assertEqual(len(self.network.table.rows), 3)

    def test_reconnect_invalidates_old_expiration(self):
        self.send(type='text', text='first', badgeNumber=1)
        self.callback['onConnect'](None)
        self.send(type='text', text='second', badgeNumber=6)
        self.execute_scheduled(0)
        self.assertEqual(self.network.output.par.text, 'second')
        self.assertEqual(self.network.timer.par.length, 60)


if __name__ == '__main__':
    unittest.main()
