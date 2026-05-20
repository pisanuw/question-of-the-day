# Changes

Format: `YYYY-MM-DD [type] description` (max 200 chars). Types: decision, plan, doc, scope, code, note.

2026-05-19 [note] Initialized.

2026-05-19 [decision] Tech: static HTML/CSS/JS (no server). Rotation: week-of-year mod 20. Reveal-only (no auto-grading). Persistence: localStorage per date.

2026-05-19 [code] Built question-of-the-day site: index.html, styles.css, app.js, questions.js with 20 Qs × 7 categories (140 total). Today's question selected by JS Date.getDay() + week-of-year mod 20.

2026-05-19 [code] Added chess board renderer: each chess puzzle now has a `pieces` object (square→side+piece), rendered as a CSS-grid 8x8 board with Unicode glyphs and file/rank labels. Added `?day=N&i=K` URL overrides for previewing other days/puzzles.

2026-05-19 [code] Wrote chess validator (/tmp/chess_validator.js) that checks each puzzle's start position is legal (Black not in check on White's move) and that the stated mate move actually mates. Caught 4 issues in initial set: P1 Qa1, P6 Qh1, P7 Qg2 all on long diagonals giving illegal starting check; P4 Qd8# escaped to h7. Fixed all 4; all 20 puzzles now pass.

2026-05-19 [code] Moved validator into repo at tools/validate_chess.js (uses path-relative load via vm sandbox; no /tmp scratch file). Run with `node tools/validate_chess.js`; exits 1 if any puzzle is invalid.
