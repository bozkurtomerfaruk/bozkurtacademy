// Shared setup for the exam browser tests. Run from the repo root with a static
// server on port 8765 (python3 -m http.server 8765), e.g. node tests/exams/player.mjs.
// PW may point to a Playwright install; otherwise the playwright package is used.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
export const { chromium } = require(process.env.PW || 'playwright');
export const B = process.env.BASE || 'http://localhost:8765/index.html';

// Screenshots go to $S when it is set, otherwise to a fresh temp folder outside the repo.
export const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'exam-shots-'));
export const shot = name => path.join(shotDir, name);

export const FOLDER = { a1: 'goethe/a1', b1: 'goethe/b1', a2: 'goethe/a2', b2: 'goethe/b2', c1: 'goethe/c1', dtz: 'dtz/a2-b1', tdp: 'testdaf/papier', tdd: 'testdaf/digital' };
export const ROUTE = { a1: 'goethe/a1', b1: 'goethe/b1', a2: 'goethe/a2', b2: 'goethe/b2', c1: 'goethe/c1', dtz: 'dtz', tdp: 'testdaf/papier', tdd: 'testdaf/digital' };
const dir = (level, t) => `data/exams/${FOLDER[level]}/lesen/teil-${t}`;
export const teileOf = level => fs.readdirSync(`data/exams/${FOLDER[level]}/lesen`).filter(n => /^teil-\d+$/.test(n)).length;
export const setsOf = (level, t) => fs.readdirSync(dir(level, t)).filter(n => /^set-\d+\.json$/.test(n)).length;
export const readSet = (level, t, s) => JSON.parse(fs.readFileSync(`${dir(level, t)}/set-${s}.json`, 'utf8'));

export function checker() {
  const fails = [];
  const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
  const done = errors => {
    console.log('errors', errors);
    if (errors.length) fails.push('page errors');
    console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
    if (fails.length) process.exitCode = 1;
  };
  return { ok, done };
}
