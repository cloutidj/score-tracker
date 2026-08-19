# Project conventions

## Documentation and comment standards

`docs/DOCUMENTATION-STANDARDS.md` defines how code comments and project docs should read. After writing or editing non-trivial code, comments, or docs under `src/` or `docs/`, use judgment about whether it's worth checking against that standard before considering the work done — run the `documentation-cleanup` skill (`check` mode) when you added or changed comments, doc content, or non-trivial code. Skip it for trivial or mechanical edits (renames, formatting, a one-line fix); there's no script enforcing this, so the call is yours.

For a deliberate sweep of pre-existing docs/comments (not tied to a specific change), use `/documentation-cleanup full`.

## Architecture and file organization

`docs/ARCHITECTURE.md` defines how the codebase is organized — domain-first folders, folder placement, the game-type plugin system. Read it before adding a folder or moving files between domains. After finishing a plan, or a set of code changes that touch multiple files or folders, use judgment about whether it's worth a background architecture-fit check — run the `architecture-review` skill (`check` mode) as a fork so it doesn't block ongoing work; findings land later as a notification. For a deliberate, broader sweep of existing code, use its `full` mode. There's no script enforcing this one — placement is a judgment call, so use judgment.

## Coding conventions

`docs/CONVENTIONS.md` defines per-file coding standards — `st-` prefix naming, one-exported-type-per-file, static-helper-class pattern, signals/zoneless usage, path aliases. Unlike architecture, most of this is mechanically checkable: run the `convention-review` skill (`check` mode, as a fork) after a set of changes touches component selectors, CSS custom properties, exports, or imports; it runs `scripts/check-conventions.sh` first and only reasons by hand about the hits that need judgment (exceptions list, directive vs. component selectors). For a deliberate sweep, use its `full` mode.
