# Question of the Day

A single-page static web app that shows one question per day. The user types an answer, submits, and sees the official solution.

- **Live site:** <https://troll-under-bridge.netlify.app/>
- **Source:** <https://github.com/pisanuw/question-of-the-day>

## How it works

Each day of the week has its own category:

| Day       | Category                  |
|-----------|---------------------------|
| Monday    | Math word problems        |
| Tuesday   | Geography                 |
| Wednesday | History                   |
| Thursday  | Physics                   |
| Friday    | Chemistry                 |
| Saturday  | Chess puzzle (mate in 1)  |
| Sunday    | Biology (evolution focus) |

There are 20 questions in each category (140 total). The question shown is picked from the current day's category by `(week-of-year) mod 20`, so:

- Everyone visiting on the same date sees the same question.
- The cycle repeats every 20 weeks.

Once the user submits an answer, both the answer and the official solution are shown. The submission is stored in `localStorage` under the key `qotd:YYYY-MM-DD`, so revisiting the page on the same day shows the prior submission instead of the input box. A "Clear today's answer" button wipes that entry.

## Running it

The app is pure static HTML/CSS/JS — no build step, no server.

Open `index.html` directly in a browser:

```
open index.html
```

Or serve the directory locally if you prefer (helpful for testing on other devices):

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Previewing other days / puzzles

For development and previewing, two URL query parameters override the natural selection:

- `?day=N` — force the day-of-week category. `0`=Sun, `1`=Mon, ..., `6`=Sat.
- `?i=K` — force the question index within that category (0–19).

Example: open `index.html?day=6&i=4` to see chess puzzle #5 regardless of today's date.

## File layout

```
question-of-the-day/
├── index.html              # Page layout
├── styles.css              # All styling, including the chessboard grid
├── app.js                  # Day picking, week rotation, localStorage, board renderer
├── questions.js            # All 140 questions, by category
├── tools/
│   └── validate_chess.js   # Validates that every chess puzzle is legal and mates
├── BRIEFING.md             # Project scope / decisions / non-goals
├── CHANGES.md              # Append-only project journal
└── README.md
```

## Chess puzzles

Saturday's questions are mate-in-1 positions. Each is stored as a piece map plus a question and answer:

```js
{
  pieces: { g6: "wK", a2: "wQ", h8: "bK" },
  q: "White to move. Find the mate in one.",
  a: "Qa8#. The queen slides up the a-file..."
}
```

The renderer (in `app.js`) builds an 8×8 CSS-grid board with file/rank labels and Unicode piece glyphs. Squares are the standard `f0d9b5` / `b58863` palette; piece glyphs use a side-aware shadow so they read clearly on either square color.

### Validating chess positions

Whenever you edit chess puzzles, run the validator:

```
node tools/validate_chess.js
```

It checks two things for every puzzle:

1. **Starting position is legal** — the Black king is not already in check from any White piece (otherwise it could not be White to move).
2. **The stated move is actually mate** — it delivers check, and the Black king has no legal escape square (and cannot capture an unprotected checker).

Exit code is `0` if all puzzles pass, `1` if any fail. The mate move is parsed from the start of the answer text (e.g. `Qa8#` → queen to a8).

## Adding questions

Open [questions.js](questions.js) and add entries to the relevant category array. Keep each category at exactly 20 entries so the week-of-year rotation stays aligned.

Non-chess entries are just `{ q, a }`. Chess entries additionally need a `pieces` object mapping square → side+piece (`w`/`b` followed by `K`/`Q`/`R`/`B`/`N`/`P`). After adding chess puzzles, re-run the validator.

## Non-goals

- No user accounts, no scoring, no leaderboards.
- No automatic answer grading — answers are revealed alongside the user's input, but not compared.
- No backend or database. localStorage is the only persistence.
