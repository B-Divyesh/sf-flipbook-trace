# Verification 14 handoff — FAIL

Candidate `0b38b51ff3ec514b6973806c40e6805e4d89af2c` was independently tested locally from an isolated clean clone and at <https://flipbook-trace.sociobot.in>. The live site byte-matches all 24 public artifacts from the candidate.

Do not release. `npm test` fails 56/58:

1. The 390×844, DPR 1.75, 4×-CPU demo startup gate recorded 337/351/362/301/341 ms, above the strict 200 ms maximum. Fresh live loads recorded 321/227/203/142/229 ms; four of five failed.
2. Axe catches a serious transient frame-number contrast violation during demo entry animation (1.19:1; focused repeat failed 3/5).
3. Paid purchase copy omits the required merchant-of-record and refund handling disclosure. The current checkout test explicitly asserts that the missing disclosure stays absent.

Positive evidence: all 19 exact claim commands pass individually; typecheck, lint, 3/3 unit tests, build, and production audit pass; live 60-frame PNG/PDF exports work with zero workflow requests; offline reload and update testing pass; response headers and rate limiting pass; Lighthouse is 97/100/100/100; and settled live axe scans are clean.

Full evidence and reproduction commands are in [`.factory/verification-14.md`](verification-14.md). Browser/Lighthouse artifacts are in [`.factory/verification-artifacts-14/`](verification-artifacts-14/).

The pre-existing modified/untracked `graphify-out` files were preserved and excluded from this QA commit. No product code was changed.
