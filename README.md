# festivall-website

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Shout-out badges

The badge sync combines `src/data/badge_history.csv` (2021–2024 aggregate counts)
with all records in `orders_2025`, `applications_2025`, and `participants_2026`.
Emails are trimmed and case-normalized, and each later year counts once per email.
Document IDs are SHA-256 hashes of the normalized emails; plaintext emails are not
stored in the badge collection. The hashes and ticket IDs are still sensitive data.
Ticket IDs from the source records are associated with their email's badge. The
bridge looks up the ID sent with the shout-out to find that badge; it does not
send the participant's email to TouchDesigner. Historical entries without a ticket
ID are retained, but cannot be matched to a shout-out until a later sync finds an
associated source record. A changed email or ticket ID also requires another sync.
2021–2022 history is incomplete and included where manually known.
The CSV count must not include 2025 or 2026, which are added from Firestore.
Records without a valid email are skipped and reported.

With the reunion admin credential in the local `.env`, preview and then update
the `participant_badges` collection:

```sh
npm run sync-badges
npm run sync-badges -- --write
```

Re-run after source records change. The sync marks no-longer-present badge records
inactive without deleting them. Protect this collection and the participant data
with Firestore security rules; email matching and ticket ID codes are not authentication.
The shout-out panel reads the badge associated with the ticket ID. The live bridge
sends `badgeNumber` with each shout-out, or `null` when no badge is matched; it
does not send a duration. TouchDesigner should multiply a matched badge by 10
seconds and use 5 seconds for an unmatched shout-out. The bridge does not hide
text on its own. Badge reads in the browser require appropriate Firestore rules.

The bridge marks its backlog messages with `replay: true`; live messages do not
have that flag. Copy `scripts/touchdesigner-websocket-callbacks.py` into the
WebSocket callbacks DAT and restart the bridge after updating either side.
On connection, the callback clears `latest_text` and resets `shoutout_timer`.
The replay fills `messages` without showing or timing historical shout-outs.
Live messages update `latest_text` and the timer, then clear the text after
badge × 10 seconds (or five seconds for an unmatched badge). A newer live
message replaces the previous one. The `messages` table retains the history,
so visual output should use `latest_text` or be gated by the timer rather than
displaying the last table row directly.

To clear saved output when a TouchDesigner project starts even before its
WebSocket connects, add an Execute DAT with Start enabled and use its `onStart`
callback to clear `latest_text` and initialize `shoutout_timer`.

### Off-season livestream schedule

Update `REUNION_FESTIVAL.nextStream` in `src/config/festivalConfig.js` for each
stream. Set `startsAt` with the correct UTC offset, `durationMinutes`, `timeZone`
(an IANA time zone such as `America/Regina`), and the title. The displayed date
and downloadable calendar event use this schedule and the configured Twitch
channel. The event includes display reminders one day and four hours before the
start; calendar apps may handle imported reminders differently.
