---
Skill: /architecture-review
Description: Checks file/folder organization, domain placement, and whether a single file's grown past one responsibility, against docs/ARCHITECTURE.md. `check` (discretion-based, default) forks in the background to review a just-made plan or set of code changes without blocking the conversation, and can move straight into applying an approved fix. `full [path]` (manual) runs a broader background sweep of existing code via a Workflow, fanning out per domain and adversarially verifying findings before they're reported.
---

`docs/ARCHITECTURE.md` is the source of truth for *what* the rule says — read it fresh each run rather than relying on a remembered copy, and don't restate its criteria here. This file governs *when to run a review, what counts as drift, and how to deliver the result*.

Scope: this skill covers *where things live* — domain boundaries, folder placement, the plugin system — plus one shape question that needs the same depth of reading as those: whether a single file's internal structure has outgrown one responsibility and should decompose into a coordinator plus child components (see [the decomposition pass](#the-decomposition-pass-one-file-as-a-bundle-of-concerns) below). Everything else about a file's shape — naming, exports-per-file, component patterns, the parts that reduce to a grep or a named-exception list — is `docs/CONVENTIONS.md`'s concern, checked by `convention-review` instead. The line between the two skills isn't shape-vs-location, it's reasoning depth: convention-review leans on scripts and judges only against named exceptions; this skill's checks require actually reading a file's real content — its template, its methods, the concepts inside it — not just its name or its size.

Reorganizing files is a high-blast-radius change (imports, path aliases, git history, other in-flight docs) — that's the reason nothing here applies a restructuring without the user picking it off a report first. It is not a reason to keep the reviewer tool-restricted once they have: whichever process did the reviewing can go straight into making the approved fix itself.

## What counts as drift

The rule ("organize by functional domain, not by file type," `_shared/` for cross-cutting pieces) is easy to state and easy to drift from as an app grows one feature at a time. Watch for these shapes (illustrative, not exhaustive — use judgment on what's actually there, not on how closely it resembles this list):

**The project-structure table in `docs/ARCHITECTURE.md` is a snapshot, not a verdict.** Its "Contains" column records where things currently sit, not where they belong — it can be as drifted as the code it describes. Never cite "the table lists it here" as evidence a component is correctly placed; that just makes the table's own drift self-confirming. Check every component against the *rule* (domain-first, genuinely-shared-vs-single-consumer), independent of what the table currently says.

- **Abstraction levels mixed in one folder.** Generic, reusable low-level primitives sitting flat alongside domain-specific high-level composites built from them, with no sub-grouping separating "building blocks" from "assembled features."
- **Infrastructure mixed with the content it hosts.** A generic container/host component living inside the folder of the specific content it happens to host today, instead of with other generic UI — or the reverse.
- **A component that reads as generic/shared by name but has exactly one consumer.** "Generic-sounding" names (host, manager, provider, panel, dialog) get placed in shared folders on vibes. Check import/consumer count across the codebase — don't infer genericness from the component's own docblock, its folder, or how reusable its implementation *could* be. A component instantiated exactly once, alongside other app-wide singleton chrome, belongs with that chrome even if it reads as generic.
- **Siblings merged (or kept separate) on abstraction tier alone.** The mirror-image mistake to the one above: treating "these are both primitives" or "these are both composites" as itself evidence they belong together. Tier is not a relationship — see the merge-evidence rule in [the relational pass](#the-relational-pass-siblings-as-a-set-not-independent-items) below.
- **A folder that accreted responsibilities over time** — each addition was locally reasonable, the sum no longer reads as one purpose.
- **A folder's name no longer matching its contents** after several rounds of the above.

Every check above is evaluated one component at a time against a rule. That leaves a gap this list can't close by itself — see [The relational pass](#the-relational-pass-siblings-as-a-set-not-independent-items) below for the separate, setwise question these per-component checks structurally cannot ask.

**Cross-check against already-settled analogous decisions elsewhere in the tree.** When a component's placement is ambiguous, find a structurally similar case the codebase has already decided and compare: e.g. "`pages/play` hosts `GameType` plugins the same way `X` hosts `Y` plugins — where does *that* analog actually live?" A placement that contradicts an established analog is a stronger signal than either placement looking fine in isolation. Do this as a standard step for any placement judgment, not only when directly challenged on a finding.

Report a placement finding as: **location**, **observation** (concrete, not a vibe), **convention at stake** (point to the specific `ARCHITECTURE.md` rule), **suggested change** (a concrete target structure — split / merge / move / rename — not just "reorganize this"), **blast radius** (rough file/import count), **confidence**. If a scope is clean, say so in one line — don't manufacture findings to pad a report.

## The relational pass — siblings as a set, not independent items

A folder can pass every check above — each child correctly scoped, correctly named, sitting in its own tidy directory — and still be wrong in a way none of those checks can see: whether the boundaries between its children are conceptual lines or just where the scaffolding happened to land as the app grew one feature at a time. A folder split because one half was built before the other, or because one half started as a lower-level primitive and the other as its consumer, reads as two clean folders under every per-component check and is still one domain wearing two names. The per-component checks can't catch this because each one asks "is this item where it belongs," never "do these items belong to each other."

Run this pass only after the per-component checks for a folder pass clean (or their findings are resolved) — its entire reason to exist is to catch what "everything individually passed" leaves standing, so running it earlier just re-does the work above under a different name.

For every folder in scope, look at its immediate children together as a set of hypotheses about each other, not as independent facts to verify one at a time. For each pair or cluster that looks even loosely related, ask which of three things is actually true: are they the same concept expressed as variations on each other (a merge candidate), is one assembled out of the other(s) (a nesting/composite candidate — the assembled-from child belongs under the thing it assembles into, not beside it), or are they genuinely independent primitives that happen to sit at the same level (correctly flat — leave it alone)? The answer is a grouping judgment argued from how the siblings relate to each other, not a property of either one in isolation, so don't reach for the per-component evidence ("count the consumers," "check the docblock") to settle it — that evidence answers a different question.

**This pass must partition every immediate child, not stop at the first cluster found.** Finding one real, well-evidenced cluster is not the same as having checked the whole sibling set — a folder with a dozen children and one obvious 3-way match still has the other nine to account for, and the next real cluster is often a stronger surface signal than the one that got reported (a shared name stem like `number-*` across five folders, for instance, is a louder hint than a shared docblock between two). Before concluding the pass for a folder, every immediate child must land somewhere: in a reported merge/nest cluster, or explicitly checked and found correctly flat. Cheap ways to generate candidate clusters to check (then verify each against the merge-evidence rule above, not on the candidate signal alone): shared name prefix/stem, a shared implemented contract (e.g. both implement the same framework interface), overlapping consumer domains, one importing another. Keep generating and checking candidates until the full set is accounted for — a report that quietly stops after the first hit looks clean but isn't.

**Merge requires a documented or usage-established relationship, not shared abstraction tier.** "Both are low-level primitives" or "both are composites built from primitives" is a fact about each sibling in isolation, smuggled back in as if it were a fact about the pair — tier-based grouping alone over-merges. The evidence that actually settles a merge/nest call is relational: existing doc language calling them the same concept, or the composition graph (who actually imports/assembles whom). Concretely: `form-field/`, `select/`, and `toggle-icon/` are all primitives sitting flat in the same folder, but that alone doesn't make them merge candidates — they're independent concepts with no documented or compositional relationship, so tier-matching them would be a false merge. Contrast that with a case like `number-pad/`, `number-picker/`, `number-change/`, `number-dialog/`, `score-entry-header/`: there, `number-dialog` literally composes the others and the cluster shares one documented concept (entering/adjusting/animating a numeric score) — that's what makes it a real merge/nest candidate. Before writing up a merge or nest finding, check the composition graph and existing docs first; if the only support you can point to is tier, it's a false positive — drop it or reclassify it as correctly-flat.

Before reporting any merge/nest finding from this pass, argue the counter-case against it using the rule above — could this cluster's only real support be tier-matching rather than a documented or compositional relationship? If the finding doesn't survive that self-check, drop it or downgrade its confidence rather than reporting it as-is. Do this in every mode, `check` included — it's a cheap pass over your own reasoning, not the heavier multi-agent refutation `full` mode runs separately below.

Report these findings under their own heading, separate from placement findings, even when the section comes back empty. Folding a relational judgment back into the same flat list as the per-component checks is exactly how the question stops getting asked — a reviewer ticks down one list and never steps back to look at a folder's contents as a whole. Report each as: **folder**, **siblings compared**, **relationship judgment** (merge / nest / correctly flat), **evidence** (the relationship between the siblings, not a property of either alone), **suggested restructuring**, **blast radius**, **confidence**. Close the section with one line naming every immediate child of the folder that wasn't already covered by a cluster above and confirming each was checked and found correctly flat — a report that mentions only the children involved in the one cluster it found, silently dropping the rest, has not actually finished the pass.

## The decomposition pass — one file as a bundle of concerns

A single component can pass every placement and relational check — it's the only file of its kind, correctly named, correctly placed, nothing to merge or nest it with — and still be wrong in the mirror-image way the relational pass is: not because it should join a sibling, but because what reads as one component is actually several concerns that ended up in the same file because each addition was locally reasonable and nobody stepped back. The relational pass asks "do these existing separate files actually belong together"; this pass asks the reverse — "does this one existing file actually contain separate things."

This is not a size check. A long file that is genuinely one responsibility stays as-is; a short file that bundles two unrelated concerns is still a real finding. Read the actual template and class body for signals like these (illustrative, not a checklist to run mechanically):

- **Template sections gated by a mode-like flag** (editing vs. viewing, add vs. list, expanded vs. collapsed) where each branch carries its own significant markup and its own supporting methods/fields.
- **Method/field clusters that only reference each other**, never the rest of the component — a cohesion seam, the file-level version of the accretion smell in [what counts as drift](#what-counts-as-drift) above. This signal comes up empty on a hub-and-spoke component (one piece of shared state that nearly every method touches) even when a real split exists — don't read an empty cluster search as "no finding here"; fall through to the next signal instead.
- **An `input()`/`output()` surface that would split cleanly into two independent contracts** — e.g. "how to render and act on one item" vs. "how to own and manage the collection." This is the signal that still fires on a hub-and-spoke component: the shared state can stay entangled across every method and a split still be warranted, as long as the *extracted* piece's contract (what it would take as input, what it would emit) is independently nameable and doesn't need the rest of the file to make sense.
- **The component reads as more than one thing if you imagine writing it fresh today** — a list-managing component whose file also contains a full add/edit form is the same shape as `number-dialog` composing `number-pad`, just not yet split into files.

The likely split, when one is warranted: a top-level coordinator that keeps the data/state/orchestration, plus one or more presentational child components it composes — e.g. a row component (renders one item, emits actions) and a form component (owns one item's edit state, emits save/cancel). Argue the split from what each piece would independently own and be named for, the same relational evidence bar as the merge/nest pass — not from line count.

New children from a decomposition finding are almost never a placement question — they belong right alongside the file they came from. Skip the per-component placement pass for them; if the resulting sibling set now looks like a relational-pass candidate (a new child might complete a cluster with something already there), run that pass as normal afterward.

Report each finding as: **file**, **concerns identified** (name each one), **evidence** (the concrete template/method signal, not "it's long"), **suggested split** (coordinator + named children, what each owns), **blast radius**, **confidence**. A file's concerns don't all have to warrant the same confidence — a strongly-evidenced extraction and a weaker, "mostly tidies up the template" one can appear in the same finding; give confidence per proposed child rather than forcing one blended number for the file. If a file was read and genuinely is one concern, say so in one line rather than skipping it silently — same rule as the other passes.

## `check` mode — after a plan or a set of changes

Discretion-based, same judgment call as `documentation-cleanup check`: after finishing a plan, after making a set of code changes touching multiple files or folders, or after a single component file grew substantially in this session (new template branches, new methods, a bigger input/output surface) even if nothing else moved, decide for yourself whether it's worth a look. Skip it for small or purely mechanical changes.

Deliver it as a **fork**, not a blocking call — the point is that it runs alongside ongoing work, not in place of it:

```
Agent({
  subagent_type: "fork",
  description: "Architecture fit check",
  prompt: "Review the plan/change just made against this skill's drift criteria: per-component placement checks first, then the decomposition pass on any file that grew substantially, then the relational pass over any folder whose contents changed (including any new children a decomposition finding would add). Report findings only for now — don't make any edit yet."
})
```

The fork already has the plan or diff in its inherited context and the criteria above (it was loaded into this conversation when the skill ran) — the prompt is a directive, not a briefing. Don't wait on it or predict its result; relay the findings when the notification lands.

If the user approves a finding, resume the same fork with `SendMessage` (its id/name) telling it to make the change — it already has full context and full tools, so there's no re-briefing and no handoff to a different, more-privileged process. It's the same work, continuing.

## `full` mode — deliberate sweep of existing code

Manual only — `/architecture-review full [path]`. The periodic, broader audit, not something to run per change.

If no path is given, ask whether to scope to one domain folder (see the project-structure table in `docs/ARCHITECTURE.md`) or the whole `src/app/` tree.

Run it as a **Workflow** (the user has opted into this by asking for this mode to work this way): fan out one review agent per top-level domain in the scope, in parallel, run the placement pass, then the decomposition pass, then the relational pass on each domain in sequence (the decomposition pass can add new children the relational pass needs to see; the relational pass needs the placement pass done first — see above), then adversarially verify every returned finding, all three kinds alike — a second pass that tries to refute it — before it counts as reported. Each fan-out agent stays report-only *for this pass specifically* — not out of distrust, but because several of them are reading/reasoning about the same tree concurrently, and one deciding to edit mid-sweep would corrupt what the others see. Sketch:

```
pipeline(
  domainFolders,
  domain => agent(`Review ${domain} for per-component placement fit against this skill's drift criteria. Report-only.`, { phase: "Placement" }),
  async (placementReport, domain) => {
    const decomposition = await agent(
      `Placement checks for ${domain} are done. Now run the decomposition pass: read each component file's actual template and class body and judge whether it bundles more than one concern that should split into a coordinator plus child components. Not a size check — argue from content. Report-only.`,
      { phase: "Decomposition" }
    )
    return { placement: placementReport.findings ?? [], decomposition: decomposition.findings ?? [] }
  },
  async (combined, domain) => {
    const relational = await agent(
      `Placement and decomposition checks for ${domain} are done (decomposition findings: ${JSON.stringify(combined.decomposition)}). Now run the relational pass: treat ${domain}'s immediate children — including any new children a decomposition finding would add — as a set of hypotheses about each other, not independent facts. Flag merge candidates, nesting/composite candidates, and confirm genuinely-flat siblings. Report-only.`,
      { phase: "Relational" }
    )
    return { ...combined, relational: relational.findings ?? [] }
  },
  (combined, domain) => parallel(
    [...combined.placement.map(f => ({ ...f, kind: "placement" })),
     ...combined.decomposition.map(f => ({ ...f, kind: "decomposition" })),
     ...combined.relational.map(f => ({ ...f, kind: "relational" }))]
      .map(f => () => agent(`Try to refute this architecture finding: ${JSON.stringify(f)}`, { phase: "Verify" })
        .then(v => ({ ...f, verdict: v })))
  )
)
```

Runs in the background like `check` — don't block the conversation waiting on it. For a quick single-folder look where the Workflow machinery is overkill, just review it directly yourself (or a plain fork) instead.

## After a report lands, either mode

Once a finding is approved: update imports and path aliases (moved files get theirs updated, new files from a decomposition split get theirs added, including the parent's new references to its extracted children), update the project-structure table and any per-domain doc in `docs/ARCHITECTURE.md` if the top-level layout changed, and run `documentation-cleanup` (`check` mode) afterward since moving or splitting code frequently strands or duplicates comments.
