---
Skill: /documentation-cleanup
Description: Checks code comments and project docs against docs/DOCUMENTATION-STANDARDS.md. Use proactively, at your own discretion, after writing or editing non-trivial code, comments, or docs under src/ or docs/ — before considering that work done. Also runnable manually with the `full` argument for a full repository sweep.
---

`docs/DOCUMENTATION-STANDARDS.md` is the source of truth for *what* the standard says — read it fresh each run rather than relying on a remembered copy, and don't restate its criteria here. This file governs *when and how* that standard gets applied. If this file and the doc ever seem to disagree, follow this file — it's the operative instruction for the run in progress.

## Modes

**`check` (default, discretion-based).** Nothing forces this to run — judge for yourself, after touching `src/` or `docs/`, whether it's worth doing. Run it when you added or changed comments, doc content, or non-trivial code. Skip it for trivial or mechanical edits (renames, formatting, a one-line fix) — running a full check for those is overhead nobody asked for. When you do run it, scope the review to what changed this session: new/edited comments, new doc sections, files you touched — don't sweep a whole file's pre-existing content just because one line in it changed. Fix straightforward violations inline as part of finishing the task — wording, moving a stray comment into the doc it belongs in — without stopping to ask. If a fix implies a structural change (creating a new domain doc, splitting an existing one), flag it and confirm before doing it.

**`full` (manual — `/documentation-cleanup full [path]`).** Apply the same standard across the requested scope regardless of what changed this session — the deliberate cleanup pass for pre-existing debt. If no path is given, ask whether to scope to a domain or the whole repo before starting.

## Applying the standard

1. Read `docs/DOCUMENTATION-STANDARDS.md`.
2. For each comment or doc in scope, check it against every rule there.
3. Fix comments that fail "why not what," "present tense, no history," or "properly scoped" in place.
4. Content the standard says belongs in `docs/` (bug write-ups, cross-cutting rationale, multi-class interaction) — move it there instead of leaving or adding it as a comment.
5. Only create a new doc where the standard actually calls for one (a domain doc, or an existing doc overflowing a page); otherwise extend the doc it belongs to.
