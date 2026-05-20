(function () {
  "use strict";

  const dateEl = document.getElementById("date");
  const categoryEl = document.getElementById("category");
  const questionEl = document.getElementById("question");
  const boardEl = document.getElementById("board");
  const form = document.getElementById("answer-form");
  const answerEl = document.getElementById("answer");
  const resultEl = document.getElementById("result");
  const yourAnswerEl = document.getElementById("your-answer");
  const solutionEl = document.getElementById("solution");
  const revealBtn = document.getElementById("reveal-btn");
  const resetBtn = document.getElementById("reset-btn");

  const today = new Date();
  const params = new URLSearchParams(window.location.search);
  const dayOverride = params.get("day");
  const indexOverride = params.get("i");
  const dayOfWeek = dayOverride !== null && /^[0-6]$/.test(dayOverride)
    ? Number(dayOverride)
    : today.getDay();
  const category = CATEGORIES[dayOfWeek];
  const pool = QUESTIONS[category.key];
  const weekIndex = getWeekOfYear(today);
  const naturalIndex = weekIndex % pool.length;
  const questionIndex = indexOverride !== null && /^\d+$/.test(indexOverride)
    ? Number(indexOverride) % pool.length
    : naturalIndex;
  const current = pool[questionIndex];

  const dateKey = isoDate(today);
  const storageKey = "qotd:" + dateKey;

  renderHeader();
  renderBoard(current.pieces);
  renderQuestion();
  restoreSubmission();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const value = answerEl.value.trim();
    if (!value) return;
    saveSubmission(value);
    showResult(value);
  });

  revealBtn.addEventListener("click", function () {
    const value = answerEl.value.trim();
    saveSubmission(value || "(no answer submitted)");
    showResult(value || "(no answer submitted)");
  });

  resetBtn.addEventListener("click", function () {
    try { localStorage.removeItem(storageKey); } catch (err) { /* ignore */ }
    answerEl.value = "";
    resultEl.classList.add("hidden");
    form.classList.remove("hidden");
    answerEl.focus();
  });

  function renderHeader() {
    dateEl.textContent = today.toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    categoryEl.textContent = category.name;
  }

  function renderQuestion() {
    questionEl.textContent = current.q;
  }

  function renderBoard(pieces) {
    if (!pieces) {
      boardEl.classList.add("hidden");
      boardEl.innerHTML = "";
      return;
    }
    const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const RANKS_TOP_DOWN = [8, 7, 6, 5, 4, 3, 2, 1];
    const SYMBOLS = {
      wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
      bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
    };

    const parts = [];
    for (let r = 0; r < 8; r++) {
      const rank = RANKS_TOP_DOWN[r];
      parts.push('<div class="rank-label">' + rank + "</div>");
      for (let f = 0; f < 8; f++) {
        const file = FILES[f];
        const sqName = file + rank;
        const dark = (r + f) % 2 === 1;
        const piece = pieces[sqName];
        let inner = "";
        if (piece && SYMBOLS[piece]) {
          const side = piece[0] === "w" ? "white" : "black";
          inner = '<span class="piece ' + side + '">' + SYMBOLS[piece] + "</span>";
        }
        parts.push('<div class="sq ' + (dark ? "dark" : "light") + '">' + inner + "</div>");
      }
    }
    parts.push('<div class="corner"></div>');
    for (let f = 0; f < 8; f++) {
      parts.push('<div class="file-label">' + FILES[f] + "</div>");
    }
    boardEl.innerHTML = parts.join("");
    boardEl.classList.remove("hidden");
  }

  function showResult(userAnswer) {
    yourAnswerEl.textContent = userAnswer;
    solutionEl.textContent = current.a;
    resultEl.classList.remove("hidden");
    form.classList.add("hidden");
  }

  function saveSubmission(value) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answer: value, ts: Date.now() }));
    } catch (err) { /* localStorage unavailable; non-fatal */ }
  }

  function restoreSubmission() {
    let raw = null;
    try { raw = localStorage.getItem(storageKey); } catch (err) { return; }
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data && typeof data.answer === "string") {
        showResult(data.answer);
      }
    } catch (err) { /* ignore malformed entries */ }
  }

  function isoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function getWeekOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 1);
    const diffMs = d - start;
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    return Math.floor(days / 7);
  }
})();
