import json
import re

COLUMNS = ['name', 'message', 'font', 'color', 'fx', 'badgeNumber']
MAX_MESSAGES = 20
PAINT_COLUMNS = ['user', 'name', 'color', 'x', 'y', 'end', 'time', 'r', 'g', 'b']
MAX_PAINT_ROWS = 2000
PULSE_EXPR = "1 - 0.55 * (0.5 + 0.5 * math.sin(absTime.seconds * 2 * math.pi / 1.6))"


def find_operator(name, create_type=None):
    parent = me.parent()
    result = parent.op(name)
    if result is None:
        result = parent.parent().op(name)
    if result is None and create_type is not None:
        result = parent.create(create_type, name)
    return result


def messages_table():
    table = find_operator('messages', tableDAT)
    if table.numRows == 0:
        table.appendRow(COLUMNS)
    elif table.numRows == 1 and all(
        not table[0, col].val for col in range(table.numCols)
    ):
        table.clear()
        table.appendRow(COLUMNS)
    else:
        headers = [table[0, col].val for col in range(table.numCols)]
        for column in COLUMNS:
            if column not in headers:
                table.appendCol([column])
                headers.append(column)
    return table


def paint_table():
    table = find_operator('paint_points', tableDAT)
    headers = [table[0, col].val for col in range(table.numCols)] if table.numRows else []
    if headers != PAINT_COLUMNS:
        table.clear()
        table.appendRow(PAINT_COLUMNS)
    return table


def handle_paint(data):
    color = str(data.get('color', '#ffffff'))
    if not re.fullmatch(r'#[0-9a-fA-F]{6}', color):
        color = '#ffffff'
    r, g, b = (int(color[i:i + 2], 16) / 255 for i in (1, 3, 5))
    points = data.get('points')
    if not isinstance(points, list):
        return
    table = paint_table()
    now = absTime.seconds
    last = len(points) - 1
    for i, point in enumerate(points):
        if not (isinstance(point, list) and len(point) == 2):
            continue
        table.appendRow([
            str(data.get('user', '')), str(data.get('name', '')), color,
            point[0], point[1], 1 if (data.get('end') is True and i == last) else 0, now,
            r, g, b
        ])
    while table.numRows > MAX_PAINT_ROWS + 1:
        table.deleteRow(1)


def clear_display():
    me.store('shoutout_generation', me.fetch('shoutout_generation', 0) + 1)
    out = find_operator('latest_text')
    if out is not None:
        out.par.text = ''
    timer = find_operator('shoutout_timer')
    if timer is not None:
        timer.par.initialize.pulse()


def onConnect(dat: websocketDAT):
    clear_display()
    paint_table()
    return


def onDisconnect(dat: websocketDAT):
    return


def onReceiveText(dat: websocketDAT, rowIndex: int, message: str):
    try:
        data = json.loads(message)
    except ValueError as error:
        print('Invalid WebSocket JSON:', error)
        return
    if not isinstance(data, dict):
        print('Invalid WebSocket message: expected a JSON object')
        return
    if data.get('type') == 'reset':
        messages_table().clear(keepFirstRow=True)
        return
    if data.get('type') == 'paint':
        handle_paint(data)
        return
    if data.get('type') not in (None, 'text'):
        return

    name = str(data.get('name', ''))
    text = str(data.get('text', ''))
    font = str(data.get('font', 'Arial'))
    color = str(data.get('color', '#ffffff'))
    fx = data.get('fx', 'none')
    badge = data.get('badgeNumber')
    if not re.fullmatch(r'#[0-9a-fA-F]{6}', color):
        color = '#ffffff'

    table = messages_table()
    values = {
        'name': name,
        'message': text,
        'font': font,
        'color': color,
        'fx': fx,
        'badgeNumber': '' if badge is None else badge,
    }
    table.appendRow([
        values.get(table[0, col].val, '') for col in range(table.numCols)
    ])
    while table.numRows > MAX_MESSAGES + 1:
        table.deleteRow(1)

    if data.get('replay') is True:
        return

    seconds = badge * 10 if (
        isinstance(badge, int) and not isinstance(badge, bool) and 1 <= badge <= 6
    ) else 5
    generation = me.fetch('shoutout_generation', 0) + 1
    me.store('shoutout_generation', generation)
    out = find_operator('latest_text')
    if out is not None:
        out.par.text = text
        out.par.font = font
        out.par.fontcolorr = int(color[1:3], 16) / 255
        out.par.fontcolorg = int(color[3:5], 16) / 255
        out.par.fontcolorb = int(color[5:7], 16) / 255
        run(
            "callback = op(args[0])\n"
            "output = op(args[1])\n"
            "if callback is not None and output is not None and callback.fetch('shoutout_generation', 0) == args[2]:\n"
            "    output.par.text = ''",
            me.path, out.path, generation, delayMilliSeconds=seconds * 1000
        )
    else:
        print('Missing latest_text TOP; shout-out saved to messages only')

    timer = find_operator('shoutout_timer')
    if timer is not None:
        timer.par.length = seconds
        timer.par.initialize.pulse()
        timer.par.start.pulse()
    else:
        print('Missing shoutout_timer CHOP; text will still clear after its duration')

    glow = 1 if fx == 'glow' else 0
    pulse = 1 if fx == 'pulse' else 0
    flags = find_operator('latest_fx', constantCHOP)
    flags.par.name0 = 'glow'
    flags.par.value0 = glow
    flags.par.name1 = 'pulse'
    flags.par.value1 = pulse

    glow_level = find_operator('glow_level')
    if glow_level is not None:
        glow_level.par.opacity.mode = ParMode.CONSTANT
        glow_level.par.opacity = glow

    pulse_level = find_operator('pulse_level')
    if pulse_level is not None:
        if pulse:
            pulse_level.par.opacity.expr = PULSE_EXPR
            pulse_level.par.opacity.mode = ParMode.EXPRESSION
        else:
            pulse_level.par.opacity.mode = ParMode.CONSTANT
            pulse_level.par.opacity = 1
    return


def onReceiveBinary(dat: websocketDAT, contents: bytes):
    return


def onReceivePing(dat: websocketDAT, contents: bytes):
    dat.sendPong(contents)
    return


def onReceivePong(dat: websocketDAT, contents: bytes):
    return


def onMonitorMessage(dat: websocketDAT, message: str):
    return
