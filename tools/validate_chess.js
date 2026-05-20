#!/usr/bin/env node
// Validate every chess puzzle in ../questions.js:
//   1. The starting position must be legal for "White to move" — that is,
//      the Black king must not already be in check from any White piece.
//   2. The stated mating move (parsed from the start of the answer text,
//      e.g. "Qa8#") must actually be mate: it must deliver check, and the
//      Black king must have no legal escape (no safe square, and no legal
//      capture of an unprotected checker).
//
// Run from anywhere:  node tools/validate_chess.js
// Exits 0 on success, 1 if any puzzle is invalid.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const QUESTIONS_PATH = path.resolve(__dirname, "..", "questions.js");
const src = fs.readFileSync(QUESTIONS_PATH, "utf8");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(src + "\nthis.__exports = { CATEGORIES, QUESTIONS };", sandbox);
const { QUESTIONS } = sandbox.__exports;

const FILES = "abcdefgh";

function sq(square) {
  return { f: FILES.indexOf(square[0]), r: parseInt(square[1], 10) - 1 };
}
function name(f, r) { return FILES[f] + (r + 1); }
function inb(f, r) { return f >= 0 && f < 8 && r >= 0 && r < 8; }

// Return list of squares of White pieces that attack `targetName`.
function attackersOf(targetName, pieces) {
  const t = sq(targetName);
  const attackers = [];
  for (const [pSq, p] of Object.entries(pieces)) {
    if (p[0] !== "w") continue;
    const piece = p[1];
    const s = sq(pSq);
    if (piece === "K") {
      if (Math.max(Math.abs(s.f - t.f), Math.abs(s.r - t.r)) === 1) attackers.push(pSq);
    } else if (piece === "N") {
      const df = Math.abs(s.f - t.f), dr = Math.abs(s.r - t.r);
      if ((df === 1 && dr === 2) || (df === 2 && dr === 1)) attackers.push(pSq);
    } else {
      const dirs = [];
      if (piece === "R" || piece === "Q") dirs.push([1,0],[-1,0],[0,1],[0,-1]);
      if (piece === "B" || piece === "Q") dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
      for (const [df, dr] of dirs) {
        let cf = s.f + df, cr = s.r + dr;
        while (inb(cf, cr)) {
          const csq = name(cf, cr);
          if (csq === targetName) { attackers.push(pSq); break; }
          if (pieces[csq]) break;
          cf += df; cr += dr;
        }
      }
    }
  }
  return attackers;
}

function blackKingSquare(pieces) {
  for (const [s, p] of Object.entries(pieces)) if (p === "bK") return s;
  return null;
}

function parseMove(answer) {
  const m = answer.match(/^([KQRBN])([a-h][1-8])#/);
  return m ? { piece: m[1], to: m[2] } : null;
}

function findMover(pieces, pieceLetter) {
  for (const [s, p] of Object.entries(pieces)) if (p === "w" + pieceLetter) return s;
  return null;
}

function isLegalSlide(fromSq, toSq, piece, pieces) {
  const s = sq(fromSq), t = sq(toSq);
  const df = t.f - s.f, dr = t.r - s.r;
  if (piece === "K") return Math.max(Math.abs(df), Math.abs(dr)) === 1;
  if (piece === "N") return (Math.abs(df) === 1 && Math.abs(dr) === 2) || (Math.abs(df) === 2 && Math.abs(dr) === 1);
  const adf = Math.abs(df), adr = Math.abs(dr);
  if (piece === "R" && !(df === 0 || dr === 0)) return false;
  if (piece === "B" && !(adf === adr)) return false;
  if (piece === "Q" && !(df === 0 || dr === 0 || adf === adr)) return false;
  const stepf = Math.sign(df), stepr = Math.sign(dr);
  let cf = s.f + stepf, cr = s.r + stepr;
  while (cf !== t.f || cr !== t.r) {
    if (pieces[name(cf, cr)]) return false;
    cf += stepf; cr += stepr;
  }
  return true;
}

function isMate(pieces, move) {
  const moverFrom = findMover(pieces, move.piece);
  if (!moverFrom) return { ok: false, why: "no such White piece on the board" };
  if (!isLegalSlide(moverFrom, move.to, move.piece, pieces)) {
    return { ok: false, why: `mover on ${moverFrom} can't reach ${move.to}` };
  }
  const after = { ...pieces };
  delete after[moverFrom];
  after[move.to] = "w" + move.piece;

  const bk = blackKingSquare(after);
  const checkers = attackersOf(bk, after);
  if (checkers.length === 0) return { ok: false, why: "move doesn't give check" };

  const s = sq(bk);
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const nf = s.f + df, nr = s.r + dr;
      if (!inb(nf, nr)) continue;
      const dest = name(nf, nr);
      const occ = after[dest];
      if (occ && occ[0] === "b") continue;
      const hyp = { ...after };
      delete hyp[bk];
      if (occ) delete hyp[dest];
      hyp[dest] = "bK";
      const atk = attackersOf(dest, hyp);
      if (atk.length === 0) {
        return { ok: false, why: `Black king escapes to ${dest}` };
      }
    }
  }
  return { ok: true };
}

let problems = 0;
QUESTIONS.chess.forEach((puz, i) => {
  const tag = "P" + String(i + 1).padStart(2, "0");
  const piecesStr = Object.entries(puz.pieces).map(([s,p])=>p+s).join(" ");
  const bk = blackKingSquare(puz.pieces);
  if (!bk) {
    problems++;
    console.log(`${tag} NO BLACK KING in pieces: ${piecesStr}`);
    return;
  }
  const startAttackers = attackersOf(bk, puz.pieces);
  if (startAttackers.length > 0) {
    problems++;
    console.log(`${tag} ILLEGAL START: Black king on ${bk} already in check from ${startAttackers.join(",")} | ${piecesStr}`);
    return;
  }
  const move = parseMove(puz.a);
  if (!move) {
    problems++;
    console.log(`${tag} UNPARSEABLE answer: "${puz.a.slice(0, 60)}..."`);
    return;
  }
  const result = isMate(puz.pieces, move);
  if (!result.ok) {
    problems++;
    console.log(`${tag} NOT MATE: ${move.piece}${move.to}# — ${result.why} | ${piecesStr}`);
  } else {
    console.log(`${tag} OK: ${move.piece}${move.to}# from ${piecesStr}`);
  }
});

if (problems === 0) {
  console.log(`\nAll ${QUESTIONS.chess.length} chess puzzles valid.`);
  process.exit(0);
} else {
  console.log(`\n${problems} problem(s) found.`);
  process.exit(1);
}
