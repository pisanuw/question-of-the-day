# Briefing

- Purpose: Static web app that shows one question per day, lets the user submit a written answer, then reveals the official solution.
- Current scope: Single-page site (index.html + styles.css + app.js + questions.js). 20 questions per category × 7 categories (Mon Math, Tue Geography, Wed History, Thu Physics, Fri Chemistry, Sat Chess, Sun Biology/Evolution). Question is selected by week-of-year mod 20. Submission persisted in localStorage per date.
- Key decisions:
  - Tech: static HTML/CSS/JS (no server, hostable on GitHub Pages).
  - Rotation: week-of-year mod 20 → deterministic, same question for everyone on the same date, repeats every 20 weeks.
  - Answer flow: reveal-only (no automatic grading); user types answer, submits, sees their answer plus the official solution.
  - Persistence: localStorage key `qotd:YYYY-MM-DD` storing the submitted answer so revisiting the same day shows the prior submission instead of the input box.
- Non-goals: User accounts, scoring, leaderboards, server backend, automated answer grading, mobile app.
