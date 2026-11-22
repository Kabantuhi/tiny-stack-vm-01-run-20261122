// Tiny stack VM: faithful interpreter of make.fun's tiny stack ISA v1
// (ISA.md + reference vm.mjs in the kit). /input/<id>/{program,input}.bin
// -> /output/<id>/{stdout.bin,exit.txt}. No clock, no randomness, no network.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
// Opcode table, one char per opcode 0..83: 1 + imm*16 + pops*4 + pushes;
// 0 means no such opcode (trap 5). Opcodes above 83 are all invalid.
const S = '\x01\x12\x42\x05\x07\x0b\x0c\x10\x00\x00\x00\x00\x00\x00\x00\x00\x0a\x0a\x0a\x0a\x0a\x0a\x0a\x06\x0a\x0a\x0a\x06\x0a\x0a\x0a\x00\x0a\x0a\x0a\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x21\x25\x25\x21\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x06\x09\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x05\x05\x02\x05';
// Binary ops 16..34 (0 at 23 NEG, 27 NOT, 31 invalid: never called).
// The four division ops throw on b = 0; the caller turns that into trap 4.
const B = [
  (a, b) => (a + b) | 0, (a, b) => (a - b) | 0, Math.imul,
  (a, b) => { if (!b) throw 0; return a === -2147483648 && b === -1 ? a : (a / b) | 0; },
  (a, b) => { if (!b) throw 0; return b === -1 ? 0 : (a % b) | 0; },
  (a, b) => { if (!b) throw 0; return Math.floor((a >>> 0) / (b >>> 0)) | 0; },
  (a, b) => { if (!b) throw 0; return (a >>> 0) % (b >>> 0) | 0; },
  0, (a, b) => a & b, (a, b) => a | b, (a, b) => a ^ b, 0,
  (a, b) => a << (b & 31), (a, b) => a >> (b & 31), (a, b) => (a >>> (b & 31)) | 0, 0,
  (a, b) => a === b ? 1 : 0, (a, b) => a < b ? 1 : 0, (a, b) => (a >>> 0) < (b >>> 0) ? 1 : 0,
];
function run(p, inp) {
  const n = p.length, D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256);
  const out = new Uint8Array(65536);
  let sp = 0, cp = 0, ol = 0, ip = 0, pc = 0, st = 0;
  const done = (c) => ({ out: out.slice(0, ol), code: c });
  for (;;) {
    if (st === 1e6) return done(10);
    if (pc < 0 || pc >= n) return done(9);
    const op = p[pc], q = S.charCodeAt(op);
    if (!q) return done(5);
    const im = (q - 1) >> 4, po = ((q - 1) >> 2) & 3, pu = (q - 1) & 3;
    if (pc + im >= n) return done(9);
    st++;
    const nx = pc + 1 + im;
    if (sp < po) return done(2);
    if (sp - po + pu > 256) return done(3);
    const a1 = p[pc + 1], a2 = p[pc + 2], a3 = p[pc + 3], a4 = p[pc + 4];
    pc = nx;
    if (op >= 16 && op <= 34 && op !== 23 && op !== 27) {
      let r;
      try { r = B[op - 16](D[sp - 2], D[sp - 1]); } catch { return done(4); }
      sp -= 2;
      D[sp++] = r;
      continue;
    }
    switch (op) {
      case 0: return done(0);
      case 1: D[sp++] = (a1 << 24) >> 24; break;
      case 2: D[sp++] = a1 | (a2 << 8) | (a3 << 16) | (a4 << 24); break;
      case 3: sp--; break;
      case 4: D[sp] = D[sp - 1]; sp++; break;
      case 5: { const x = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = x; break; }
      case 6: D[sp] = D[sp - 2]; sp++; break;
      case 7: { const x = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = x; break; }
      case 23: D[sp - 1] = -D[sp - 1] | 0; break;
      case 27: D[sp - 1] = ~D[sp - 1]; break;
      case 48:
      case 49:
      case 50: {
        const rel = ((a1 | (a2 << 8)) << 16) >> 16;
        let take = true;
        if (op !== 48) { const v = D[--sp]; take = op === 49 ? v === 0 : v !== 0; }
        if (take) pc = nx + rel;
        break;
      }
      case 51:
        if (cp === 64) return done(7);
        C[cp++] = nx;
        pc = a1 | (a2 << 8);
        break;
      case 52:
        if (cp === 0) return done(8);
        pc = C[--cp];
        break;
      case 64: {
        const ad = D[sp - 1];
        if (ad < 0 || ad >= 256) return done(6);
        D[sp - 1] = M[ad];
        break;
      }
      case 65: {
        const ad = D[sp - 1], v = D[sp - 2];
        if (ad < 0 || ad >= 256) return done(6);
        sp -= 2;
        M[ad] = v;
        break;
      }
      case 80: {
        const s = String(D[sp - 1]);
        if (ol + s.length > 65536) return done(11);
        sp--;
        for (let i = 0; i < s.length; i++) out[ol++] = s.charCodeAt(i);
        break;
      }
      case 81:
        if (ol + 1 > 65536) return done(11);
        out[ol++] = D[--sp] & 255;
        break;
      case 82: D[sp++] = ip < inp.length ? inp[ip++] : -1; break;
      case 83: return done(D[--sp] & 255);
    }
  }
}
for (const id of readdirSync(I).sort()) {
  const r = run(new Uint8Array(readFileSync(join(I, id, 'program.bin'))), new Uint8Array(readFileSync(join(I, id, 'input.bin'))));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), r.out);
  writeFileSync(join(O, id, 'exit.txt'), `${r.code}\n`);
}
