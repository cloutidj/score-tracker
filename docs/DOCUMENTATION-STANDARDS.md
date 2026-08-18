# Documentation Standards

The standard for project docs and code comments across the app. Source of truth — [ARCHITECTURE.md](./ARCHITECTURE.md) and the `documentation-cleanup` skill both cross-link here rather than restating it.

- **Short, succinct, to the point.** Document the *why* and the non-obvious; let the code show the *what*. Prefer a present-tense sentence over a paragraph of history.
- **One concern per document.** When a doc grows large, split it by domain (`docs/<domain>.md`) rather than letting one file sprawl.
- **Docs are a development guide.** New work matches the structure and conventions here; consistency of approach and goals is the point.

## Project documents

- The `/docs` folder holds project-level documentation for core concepts: multi-class interaction, common bugs/patterns, design details, and anything else that doesn't belong in a single class or comment.
- **Domain documents.** When the multi-class interaction being documented belongs to one functional domain (a folder under `src/app/`, e.g. `ui/`, `color/`, `player/`, `game/`), it gets its own document named for that domain (e.g. `docs/UI-COMPONENTS.md` for `src/app/ui/`), not a subsection folded into a general project-wide document. Create the domain document the first time that domain needs one — it doesn't have to already be page-long to earn its own file. Reserve app-wide documents (e.g. `ARCHITECTURE.md`'s "Key systems") for concerns that genuinely span multiple domains (persistence, theming, motion); a single domain's own component contracts belong in that domain's document instead, cross-linked from the app-wide doc rather than duplicated into it.
- **New documents.** Create one when an existing document grows longer than a single page. Break the concept into a high-level overview with supporting detail documents so consumers can go to the level of detail they need.
- Documents should link to related documents, include Mermaid diagrams, and use other documentation tools to aid simplification and understanding.

## Common issues and bugs

Documenting bugs with code comments is **not desired**. Instead, add a "Common Issues / Troubleshooting" section to the relevant document, detailing the reasons and solutions for system bugs that need to be addressed — this handles recurring patterns (e.g. common CSS override techniques used by skins) consistently instead of leaving one-off notes scattered in code.

## Code comments

Same standard as docs, applied inline:

- **Comment the *why*, never the *what*.** Well-named code already shows what it does; a comment earns its place by carrying a non-obvious constraint, invariant, or trade-off a reader couldn't derive from the code itself. If removing it wouldn't confuse anyone, don't write it.
- **Present tense, no history.** Describe the code as it is. Don't narrate what it used to do, reference a migration in progress, or point at "the regression this fixed" — that context belongs in the commit message, not the source.
- **One JSDoc block per exported member, sized to the need.** A one-line `/** ... */` is the default; let it grow only when the rationale genuinely doesn't fit in a sentence (see `scoring-engine.ts`'s two-pass explanation for a justified example).
- **Consolidate, don't repeat.** When the same rationale would otherwise appear in several places (e.g. a CSS cascade quirk explained at every call site), state it once and have the rest cross-reference it by file/section rather than restating it.
- **Large or cross-cutting rationale belongs in `docs/`, not a comment block.** If a comment needs several paragraphs to explain a subsystem, that's a sign it should be a doc section with a short pointer left in the code.
- **Properly scoped.** Comments belong at method/property or class level, not scattered inline, unless a specific line needs its own non-obvious explanation.
