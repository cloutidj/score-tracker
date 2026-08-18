---
Skill: /convention-review
Description: Checks per-file coding conventions (naming, exports-per-file, component patterns, path aliases) against docs/CONVENTIONS.md, leaning on grep-based scripts where a rule is mechanical. `check` (discretion-based, default) forks in the background to review a just-made set of code changes without blocking the conversation, and can move straight into applying an approved fix. `full [path]` (manual) runs a broader background sweep of existing code.
---

`docs/CONVENTIONS.md` is the source of truth for *what* each rule says — read it fresh each run rather than relying on a remembered copy, and don't restate its criteria here. This file governs *when to run a review, how to use the scripts, what still needs judgment, and how to deliver the result*.

Scope: this skill covers *how an individual file is shaped* — naming, one-exported-type-per-file, static-helper-class pattern, signals/zoneless usage, path aliases. It does not cover domain placement or folder organization — that's `docs/ARCHITECTURE.md`'s concern, checked by the `architecture-review` skill instead. A finding about *where* a file lives rather than its internal shape belongs to that skill, not this one.

## Run `npm run lint` and the script first

Two of `CONVENTIONS.md`'s rules are already lint-enforced, not just review-enforced: `max-classes-per-file` (one-exported-type-per-file's mechanical backstop) and `@angular-eslint/component-selector` / `directive-selector` (the `st-` prefix on selectors). A violation there fails `npm run lint`, so if lint is passing, don't re-flag those as findings — a review adds value on what lint can't see.

`scripts/check-conventions.sh` (run from the repo root, e.g. `bash .claude/skills/convention-review/scripts/check-conventions.sh`) covers the rest: legacy `@Input`/`@Output`/`@ViewChild` decorators, CSS custom properties missing the `st-` prefix (Sass, so lint can't reach it), relative imports crossing two or more directory levels, and files exporting more than one top-level member (a superset of what `max-classes-per-file` alone catches, since that rule only counts classes — not interfaces/types/consts/functions). It also re-checks component/directive selectors as a convenience for a pre-lint look, but treat that section as redundant once lint is clean. Always run this before reasoning about conventions by hand — it's faster and more complete than an agent re-deriving the same greps, and it's the reusable artifact this skill exists to provide. Extend the script (add a section, tighten a pattern) when a rule needs a new mechanical check rather than reinventing the check inline in a review.

Its output is **candidates, not verdicts** — say so in the report. Two rules specifically still need a reader:

- **One-exported-type-per-file hits** — check each flagged file against `CONVENTIONS.md`'s named exception list (discriminated union variants, DI-token pairs, dialog-data pairs, DTO-mapper pairs) before calling it a violation.
- **Selector/custom-property hits** — the script can't distinguish a component's element selector from a directive's attribute selector (`[stColor]`, `button[stButton]` are directives/host bindings using `st`-prefixed camelCase by convention, not the kebab-case `st-` element-selector rule — and lint already enforces both), nor tell a project token from a third-party one. Read the surrounding code before flagging.

The decorator and relative-import checks are close to unambiguous — a hit there is almost always worth reporting as-is.

## `check` mode — after a set of changes

Discretion-based, same judgment call as `documentation-cleanup check`: after making a set of code changes, decide for yourself whether it's worth a look. Skip it for small or purely mechanical changes.

Deliver it as a **fork**, not a blocking call:

```
Agent({
  subagent_type: "fork",
  description: "Convention check",
  prompt: "Run scripts/check-conventions.sh under .claude/skills/convention-review/ against the files changed this session, then review the hits against docs/CONVENTIONS.md's exceptions (see this skill's guidance on which checks still need judgment). Report findings only for now — don't make any edit yet."
})
```

The fork already has the diff in its inherited context. Don't wait on it or predict its result; relay the findings when the notification lands. If the user approves a finding, resume the same fork with `SendMessage` to make the change.

## `full` mode — deliberate sweep of existing code

Manual only — `/convention-review full [path]`. Run the script against the full tree (or the given path), then triage the exceptions-needing hits yourself or via a plain fork — the checks are mechanical enough that the Workflow/adversarial-verify machinery `architecture-review full` uses is usually overkill here. Reach for a Workflow only if the hit list is large enough that triaging it single-threaded would be slow.

## After a report lands, either mode

Once a finding is approved: make the fix, and if it's a selector/token rename, grep for other references to the old name before considering it done (SCSS `var()` usages, template bindings). Run `documentation-cleanup` (`check` mode) afterward if the fix touched comments.
