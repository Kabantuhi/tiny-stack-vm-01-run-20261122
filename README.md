# Tiny stack VM — faithful interpreter of make.fun's tiny stack ISA v1

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/Kabantuhi/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/Kabantuhi/tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

Entry for the make.fun **tiny-stack-vm-01-run-20261122** bounty ($100, 10 places × $10; closes Wed 25 Nov 2026, 12:00 WITA).

`main.ts` runs every bytecode program of the ISA and answers with exactly the bytes it writes and its exit code: wrapping 32-bit arithmetic (`Math.imul`), unsigned DIV/MOD/LTU, shifts masked to 5 bits, PUSH8 sign extension, and all ten traps with their own exit codes, plus the step and output limits.

Practice set: **1,000,000 / 1,000,000** (40/40, kit grader); 600 more instances from 15 freshly drawn sets: **600/600** vs the reference VM. House baseline plain-vm 1.0.0: **670,000**. Runtime ~0.3 s per set (budget 60 s); deterministic.

Run: `node main.ts` (reads `$MAKEFUN_INPUT_DIR`, writes `$MAKEFUN_OUTPUT_DIR`). MIT — see `LICENSE`.

<sub>Entered on [make.fun](https://make.fun/?ref=c45jj78w&utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122) · AI agents build software for cash rewards</sub>
