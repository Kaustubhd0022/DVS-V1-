# Tattava Copilot — UX Specification
**Document ID:** EXP-UX-02 | **Version:** 1.0 | **Status:** Implementation-oriented baseline  
**Scope:** V1 Narrative Intelligence

## Contents
1. Purpose and experience contract
2. Principles
3. Information architecture
4. Screen inventory
5. Shared interaction rules
6. Screen specifications
7. States and feedback
8. Responsive and accessibility requirements
9. Acceptance criteria
10. Open decisions

## 1. Purpose and experience contract

This document defines the interface and interaction behaviour required to realise the User Flows. It is a textual UX specification, not a claim that high-fidelity wireframes or production UI assets already exist. The Design System labels proposed visual values as provisional because approved brand guidelines and final visual assets were not present in the accessible source baseline.

Tattava is not a chat interface with a project sidebar. It is a persistent project-intelligence experience in which conversation is one interaction surface among structured project views. The interface helps users understand project state, act on relevant questions, inspect evidence, review candidates, make decisions and see how those decisions affect downstream work.

For any consequential action, users should be able to answer: What task is being performed? Which project, branch and version are in scope? What context/evidence informed the result? Is this evidence, interpretation, candidate, decision or Canon? What changes if I continue? Who can approve it? What happens if it fails? If the system cannot answer, show that information as unavailable rather than implying certainty.

## 2. Principles

### 2.1 Project first, not prompt first
Project state persists across sessions. Chat history can be retained as interaction history, but it is not authoritative project state.

### 2.2 Progressive disclosure without hidden consequences
Show what is needed for the task first and make provenance, context, version history and impact inspectable. Hiding complexity is acceptable; hiding a consequential state transition is not.

### 2.3 Unknown is a valid state
Missing details are not always errors. Distinguish Unknown, Intentionally unknown, Ambiguous, Assumed, Conflicting, Blocked and Resolved where supported. Do not fill unknown fields just to make a screen look complete.

### 2.4 Candidates before Canon
AI-created content is a candidate by default. “Save,” “Accept,” “Approve,” and “Commit to Canon” are not synonyms. Identify the destination state before confirmation.

### 2.5 Evidence is inspectable
Factual claims should expose source title, publisher, URL/stable identifier, retrieval date, relevant excerpt/locator, evidence status and known qualifications/conflicts where available. Do not use a generic citation icon as the only evidence surface.

### 2.6 Human authority is explicit
Approval controls appear only when the actor is authorised. If the approval route is unknown, block the protected action and surface the unresolved permission path instead of guessing.

### 2.7 Recovery is part of the main experience
Every asynchronous task has a discoverable status and recoverable failure state. A failed run must not erase an approved artifact.

## 3. Information architecture

### 3.1 Recommended workspace model

```text
Workspace / Project switcher
├── Project list and New project
└── Project workspace
    ├── Overview / next best action
    ├── Project understanding / Story Brain
    ├── Research & evidence
    ├── Story development / characters / world
    ├── Writing / screenplay / dialogue
    ├── Branches & alternatives
    ├── Canon & decisions
    ├── Continuity & impact
    ├── Artifacts & versions
    └── Story Development Package
Task activity / notifications (if supported)
Help / feedback
Workspace or account settings (supported controls only)
```

This is a recommended information architecture, not a claim that each item is a separate implemented module. Related views may be combined if users can still discover state, evidence, permissions and versions. The main workspace prioritises the current task and unresolved issues; it should not require navigation among disconnected AI agents.

### 3.2 Navigation levels

| Level | Purpose | Behaviour |
|---|---|---|
| Workspace | Switch authorised workspaces/projects | Show only accessible resources; never leak inaccessible metadata |
| Project overview | Summarise state and next useful action | Surface important unknowns, pending reviews, failed tasks and package status without false urgency |
| Project domains | Structured views for understanding, research, story, branches, Canon and package | Labels may be consolidated; state distinctions must remain discoverable |
| Task detail | Inspect research/generation/diagnostic/approval/package operation | Show status, input scope, context, outputs, failure and recovery |
| Object detail | Inspect source, evidence, decision, Canon item, artifact or version | Show provenance, lifecycle status, links and permitted actions |
| Settings | Manage supported preferences/access | Expose only controls backed by approved policy and implementation |

## 4. Screen inventory

| ID | Screen | User job | Key states | Flow |
|---|---|---|---|---|
| UX-S01 | Workspace/project list | Find or create project | Loading, populated, empty, access error | UF-01/02 |
| UX-S02 | New project/universal entry | Submit arbitrary input | Empty, typing, processing, partial failure, ready | UF-02 |
| UX-S03 | Project overview | Understand current state and next action | New, active, awaiting review, failed task, stale package | UF-03/04/12 |
| UX-S04 | Project understanding/Story Brain | Inspect knowns and unresolved items | Known, unknown, ambiguous, assumed, conflicting, blocked, resolved | UF-03 |
| UX-S05 | Research workspace | Review factual research | Running, results, partial, conflict, no results, failed | UF-05 |
| UX-S06 | Candidate editor/reviewer | Edit and assess proposed content | Generating, candidate, edited, stale, rejected, saved | UF-07/08 |
| UX-S07 | Branch comparison | Compare alternatives | Empty, comparing, conflict, merge proposal, stale base | UF-06 |
| UX-S08 | Canon and decisions | Inspect authoritative state and decisions | Current, history, proposed update, denied, stale | UF-08/09 |
| UX-S09 | Continuity/impact report | Review findings and affected items | Running, findings, no issue detected, partial coverage, failed | UF-10 |
| UX-S10 | Artifacts and versions | Find, compare and restore versions | Populated, empty, comparison, stale, restore confirmation | UF-07–12 |
| UX-S11 | Story Development Package | Assemble and review package | Building, gaps, ready for review, approved, stale | UF-11 |
| UX-S12 | Task activity/detail | Understand long-running work | Queued, running, awaiting input/approval, partial, failed, cancelled | UF-05/07/10–12 |
| UX-S13 | Project access/settings | Manage supported controls | View, edit, denied, saved, failed | UF-13 |
| UX-S14 | Help and feedback | Learn or report issue | Contextual help, submitted, failure | UF-14 |

## 5. Shared interaction rules

### 5.1 Action hierarchy
Each view should have one visually dominant action for the user’s immediate goal. Secondary actions remain available without competing equally. State-changing/destructive actions must not look like ordinary navigation.

| Context | Primary action example | Secondary actions |
|---|---|---|
| New project | Create project | Cancel, remove file |
| Research finding | Open evidence / Use findings in exploration | Refine question, retry |
| Candidate | Save candidate | Edit, regenerate, compare |
| Canon proposal | Review proposed change | Compare, defer, cancel |
| Package | Review package | Open gaps, revise |

A final Canon commit action should say **Approve and update Canon** or similarly precise wording and appear only when permitted. Package approval is separate from greenlight.

### 5.2 Confirmation policy
Require confirmation for consequential or hard-to-reverse actions, authoritative-state changes, substantial work discard, access changes, sensitive export and policy-governed deletion. Do not confirm every navigation click.

A consequential confirmation explains exact action; project/branch/artifact/version; whether Canon changes; known downstream impacts; reversibility; and a clear confirm/cancel path. Avoid generic “Are you sure?” copy for Canon changes.

### 5.3 Editing and save state
If autosave exists, show truthful states such as Saving, Saved, Offline/not saved, or Save failed. Do not show Saved until persistence is confirmed. If autosave is not implemented, provide explicit save and warn before leaving unsaved edits. Human edits must survive regeneration; regeneration creates a new version or clearly explains replacement.

### 5.4 Search and filtering
Search project entities, artifacts, research, decisions and versions within permissions. Results identify object type and relevant project/branch/version. A search match is not an authorization grant; permissions apply before results are returned.

### 5.5 Context inspector
For consequential, high-impact or continuity-sensitive tasks, show **Context used** and allow inspection. Where confusion is likely, show **Context not used / Excluded**, such as old versions, rejected branches or unverified sources, with reasons. Pin/remove/add/use-previous-version controls appear only if supported. During branch exploration, persist a label such as **Exploring Branch B — main Canon unchanged**.

### 5.6 Notifications
Make meaningful task events discoverable: task needs input, review is pending, task failed, package may be stale, or work completed. Do not interrupt for every AI thought or low-impact background update. Notification channels, delivery guarantees and preferences remain open decisions. Avoid confidential content in system notification previews unless policy allows it.

## 6. Screen specifications

### UX-S01 — Workspace / project list
**Purpose:** locate a project or start one. **Entry:** authenticated user with workspace access. **Actions:** open project, create project, search/filter if implemented. **Hierarchy:** title; New project; project list; recent activity/state; empty/error state.

Project row may show title, known format/genre (never inferred just to fill space), last activity, current branch/version, pending review/task state and package readiness when meaningful.

**Empty copy:**
> **No projects yet**  
> Start with an idea, a character, a scene, a script, research material, or a question. You do not need to choose a format first.  
> **[Start a project]**

Handle access revoked between list and open, fetch failure and large lists. Keyboard users must navigate items; project title and state are announced meaningfully; no essential action is hover-only.

### UX-S02 — New project / universal entry
**Purpose:** capture arbitrary input without forced structure. **Controls:** optional project name if policy permits; large text input; file attachment; create/continue; cancel; per-file processing state and remove action. Examples can show idea, character, scene, screenplay, research or existing material, but must not read as a required checklist.

Validate only real constraints: required input, unsupported type, size limit or processing issue. Exact file types/limits are governed by D-14. After submit, show input receipt and processing state. Intent inference is provisional and editable.

**Representative response:** “I understand this as an early-stage story idea about a woman returning to her village. I do not yet know the format, her motivation, or the central conflict. You can clarify one of these, explore possible directions, or leave them unresolved for now.”

One failed file must not invalidate other successfully received inputs. Preserve text and original files when extraction fails, subject to policy; offer retry/remove/manual text entry.

### UX-S03 — Project overview
**Purpose:** orient user and recommend next action. **Hierarchy:** project identity and branch/version; concise state summary; pending decisions/reviews; high-impact unresolved items; recent artifacts/tasks; next best action; package status when relevant.

Do not make a generic analytics dashboard. Explain why each recommendation matters and what it affects; qualify incomplete dependency analysis. Avoid unvalidated progress percentages or AI confidence scores.

State variants: new project (understanding + next step); active project (current task + few important unresolved items); awaiting review (candidate/package and approval status); failed/partial task (what succeeded + recovery); potentially stale package (what changed + reassessment).

### UX-S04 — Project understanding / Story Brain
**Purpose:** make persistent project state legible and correctable. Group by project concepts and allow filtering by epistemic status. Each item shows value if known; epistemic status; lifecycle status if applicable; origin/last update; evidence/decision/Canon/artifact links; known dependencies; permitted actions.

Epistemic status and lifecycle status are separate dimensions. “Approved” does not mean “externally verified”; “Known” does not mean “Canonical.” Status must be text plus icon/shape, not colour alone. Complex graphs require list/table alternatives.

### UX-S05 — Research workspace
**Purpose:** make research inspectable and connected to creative decisions. **Layout:** question/scope; task status; findings; source detail; conflict panel; refine/retry/verify/use-in-creative-work actions.

Finding shows claim, evidence status, source links, qualification/conflict label and affected topic. Source detail shows title, publisher, URL/stable identifier, retrieval date, excerpt/locator, supported claim, qualification, conflict links, source tier if approved and verification status. Do not show a green “verified” badge unless criteria are defined and the evidence meets them.

**No results:** “I couldn’t find usable evidence for this question in the sources available to this run. The claim remains unverified. You can refine the question, try another source scope, or continue with this limitation visible.”

**Conflict:** “The available sources disagree on this point. I have kept the claims separate rather than selecting one as fact.”

### UX-S06 — Candidate editor/reviewer
**Purpose:** support generation, editing, comparison and explicit acceptance. Show task/title; branch and context scope; candidate; edit area; version/dirty state; source/context inspector; save/review action; revise/regenerate/compare/discard controls.

States: idle, generating, streamed/in progress if supported, candidate ready, editing, saving, saved, save failed, stale, rejected and superseded. Streaming output remains draft until run and validation complete. If a run fails, partial output is labelled. Regeneration must state whether it creates a new version or replaces a draft. Stale candidate shows version used and current version with compare/refresh/revise path.

### UX-S07 — Branch comparison
Show branch names, base version, purpose if supplied, key differences, affected characters/relationships/structure, evidence, Canon conflicts, unresolved assumptions and candidate artifacts. Each merge decision must be explicit: keep A, keep B, accept synthesis, reject or defer. Conflicts remain unresolved until human choice. Before commit, show final change set and run permission/version checks.

### UX-S08 — Canon and decisions
Show current Canon version, history, decision record, affected entities, source/evidence links, approval actor/role and timestamp when available, proposed updates and stale-write state. Decision detail includes statement, alternatives if recorded, rationale, owner, time, affected items, linked candidate/evidence and superseded decision.

Before protected action, show change preview and current version. If actor lacks permission, do not expose restricted approval data; explain the boundary.

### UX-S09 — Continuity and impact report
Each finding shows type (confirmed contradiction, possible inconsistency, missing information, potential impact, not evaluated), evidence/context, affected item, recommendation, coverage limits and user disposition. Distinguish confirmed from potential impact. “No issue detected” includes scope/version evaluated and does not imply full coverage. Dismissal records a human disposition, not proof that the diagnostic was false.

### UX-S10 — Artifacts and versions
Show artifact title/type, lifecycle state, version, branch, update time, author/source, approval status, stale indicator and dependencies. Version comparison highlights changes where reliable; semantic AI comparison is labelled interpretation and allows opening source versions. Restore creates a new version or rollback event rather than erasing history.

### UX-S11 — Story Development Package
Show package version; creation time; source project/Canon version; included sections; missing/unresolved sections; linked artifacts; research/evidence; diagnostics; open questions/risks; review/approval state. Use descriptive readiness labels—Building, Ready for review, Contains unresolved gaps, Awaiting approval, Approved version, May be stale—not an unapproved score. Approval binds to exact version. Relevant later changes may mark it stale; never silently rewrite an approved package.

### UX-S12 — Task activity/detail
Show task name, project/branch, status, start/last update, task input summary, real progress stages, outputs, safe error explanation, retry/cancel where supported and context/version used. Show only real observable stages; no fabricated percentage or remaining time. Retry explains if output may differ or create a new candidate. Preserve previous successful artifacts and partial results.

### UX-S13 — Project access/settings
Expose only implemented and policy-approved settings. Permission changes, export, deletion, provider handling and retention are sensitive. Explain scope/consequence before confirmation. Retention, backup deletion, legal hold and provider-side deletion remain open decisions.

### UX-S14 — Help and feedback
Explain concepts in plain language. Attach feedback to a task/item where possible; avoid requiring users to repaste confidential content. State whether feedback was submitted. Do not promise model retraining or human review unless those processes are approved.

## 7. States and feedback

| State | Meaning | UX pattern |
|---|---|---|
| Queued | Work has not started | Task identity + Queued |
| Running | Work in progress | Real stage where available; safe navigation |
| Awaiting input | Needs user answer | Focused question and alternatives |
| Awaiting approval | Needs authorised review | Review CTA and route if known |
| Succeeded | Completed | Outcome and changed object/version |
| Partially succeeded | Some steps failed | Partial label, completed/missing steps and recovery |
| Failed | Did not complete | Error, preserved state and recovery |
| Cancelled | Stopped | What was retained and what did not finish |
| Stale | Base/context changed | Compare/refresh/revise |
| Blocked | Permission/policy/dependency prevents action | Reason and safe next step |

Use the pattern **what happened → what is affected → what remains safe → next action**. Example: “This Canon update was not applied. The project changed after the proposal was prepared, so I paused it to avoid overwriting newer work. Your current Canon is unchanged. Compare the versions and prepare an updated proposal.”

Empty states explain what belongs here, why it may be empty and the next useful action. Do not seed user projects with fake sample data. Toasts may confirm low-risk actions but must not be the sole record of a Canon update.

## 8. Responsive and accessibility requirements

Responsive behaviour is content-driven; breakpoints are provisional in the Design System. Wide desktop may show project navigation, main content and optional context inspector. Compact layouts collapse navigation and use a drawer for context. Narrow viewports use one primary column and labelled overlays/dedicated views. Long-form text should remain readable rather than stretching across an ultrawide viewport.

Proposed target is WCAG 2.2 AA, subject to formal review. Requirements: full keyboard access; visible focus; semantic headings/landmarks/labels; status announcements without excessive noise; text/icon/shape status cues; sufficient text and non-text contrast; reflow and zoom; associated validation messages; dialog focus management/restoration; reduced-motion support; accessible alternatives for graphs and branch diagrams; no critical hover-only action; citations and candidate controls keyboard navigable; streaming does not overwhelm assistive technology.

Use direct verbs and concise labels. Explain Canon and branch at first use or via help. Do not use colour as the sole status cue.

## 9. UX acceptance criteria

1. Arbitrary project entry without mandatory format/template.
2. User can inspect/correct intent and understanding.
3. Unknowns, assumptions and conflicts are explicitly labelled.
4. User can ask their own question.
5. Research claims link to evidence; source conflicts are visible.
6. Candidate and Canon have distinct controls and status.
7. Context and relevant versions are discoverable for consequential tasks.
8. Branch scope remains visible during exploration.
9. Canon update requires permission and current-version validation.
10. Errors explain preservation and safe recovery.
11. Partial output and incomplete dependency coverage are not presented as complete.
12. Package gaps, version and approval are explicit.
13. Core journeys work by keyboard and assistive technology.
14. Responsive layouts retain state, evidence, review and recovery access.
15. Progress messaging reflects actual system state.

## 10. Open decisions

| ID | Decision | Consequence |
|---|---|---|
| UX-OD-01 | Approved brand, logo, typography and colours | Tokens remain provisional |
| UX-OD-02 | Identity provider, SSO, invitation and session model | Exact authentication screens depend on integration |
| UX-OD-03 | Action-level role/approval matrix | Approval routes cannot be finalised |
| UX-OD-04 | File formats, size limits and extraction capabilities | Entry copy/validation must match implementation |
| UX-OD-05 | Autosave and offline draft guarantees | Save indicators must not promise unsupported persistence |
| UX-OD-06 | Notification and support channels | No unapproved delivery/escalation promise |
| UX-OD-07 | Package completeness policy | Readiness remains descriptive, not numeric |
| UX-OD-08 | Accessibility audit owner | Proposed WCAG target needs formal validation |

---

## 11. Screen inventory and implementation-ready low-fidelity wireframes

The wireframes below are structural, low-fidelity representations. They communicate information hierarchy and interaction intent; they are not approved visual designs or evidence that a production UI exists. Brand colours, typography, exact responsive breakpoints and final component styling remain provisional until approved.

### 11.1 Screen inventory

| ID | Screen | Primary job | Main regions | Critical states |
|---|---|---|---|---|
| UX-S01 | Project Home / Project State | Make project status and next action legible | Project identity, state summary, open questions, recent decisions, next action | Empty, active, blocked, stale |
| UX-S02 | Universal Input / Intent Review | Accept varied creator input and show interpreted intent | Input area, attachments, interpreted intent, context confirmation | Empty, parsing, ambiguous, unsupported input |
| UX-S03 | Clarification Panel | Resolve consequential ambiguity without over-questioning | Question, why it matters, options, freeform response, skip/defer where safe | Awaiting answer, deferred, conflicting answers |
| UX-S04 | Research Workspace | Make evidence inspectable | Query, findings, source list, evidence detail, conflicts, research limitations | Searching, partial, no results, source failure, conflict |
| UX-S05 | Candidate Review | Let a human evaluate AI-produced work | Candidate body, type/status, rationale, evidence links, edit controls, decision actions | Draft, candidate, reviewed, rejected, stale |
| UX-S06 | Branch / Version Compare | Explain differences and isolate alternatives | Base version, alternative, diff, affected elements, merge/keep separate | Same version, diverged, stale, merge blocked |
| UX-S07 | Canon / Decision Review | Make consequential changes explicit | Proposed change, before/after, rationale, impact, approver, decision record | Awaiting approval, authorised, denied, conflict |
| UX-S08 | Change Impact Preview | Show downstream consequences | Changed entity, affected entities, severity/reason, proposed follow-up | No known impacts, impacts found, analysis incomplete |
| UX-S09 | Story Development Package | Show readiness and provenance of final package | Package outline, section status, unresolved gaps, version, approvals, export action | In progress, ready for review, blocked, approved |
| UX-S10 | Run Status / Recovery | Keep long-running work visible and recoverable | Task, current stage, completed outputs, failed steps, retry/resume/cancel | Queued, running, awaiting input, partial, failed, cancelled |

### 11.2 Wireframe UX-S01 — Project Home / Project State

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ TATTAVA  /  Projects  /  [Project Name]                 Search  Help  Profile│
├────────────────┬─────────────────────────────────────────────┬───────────────┤
│ PROJECT NAV    │ PROJECT STATE                              │ COPILOT       │
│                │                                             │               │
│ Overview       │ [Project title]  [Branch]  [Version]        │ Next best     │
│ Story           │ Status: In development                     │ action        │
│ Research        │                                             │               │
│ Characters      │ Known / Resolved                           │ [Explain why] │
│ Story structure │ • Approved premise                         │               │
│ Screenplay      │ • Confirmed character relationship         │ Ask anything  │
│ Decisions       │                                             │ [Input....]   │
│ Canon           │ Open / Unknown / Conflicting                │ [Submit]      │
│ Package         │ • Historical date needs verification        │               │
│                │ • Ending option awaits Creative Director    │ Recent run    │
│                │                                             │ [View status] │
├────────────────┴─────────────────────────────────────────────┴───────────────┤
│ Recent decisions | Evidence needing review | Package readiness | Activity     │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Behaviour.** The project identity, branch and version remain visible when a consequential action is taken. Project state is not presented as a generic chat transcript. “Next best action” must be grounded in current project state and explain its rationale. The Copilot panel is an interaction surface, not the authoritative record of Canon.

### 11.3 Wireframe UX-S02 — Universal Input / Intent Review

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Start with what you have                                              │
│                                                                       │
│ [ Describe an idea, paste notes, ask a question, or add a document ]  │
│                                                                       │
│ [Attach file] [Paste text] [Ask a question]                           │
│                                                                       │
│ Tattava understood:                                                   │
│ • Intent: develop a historical drama concept                          │
│ • Project context: Rajyam / Branch A                                  │
│ • Known: central political conflict                                   │
│ • Unknown: intended format and historical latitude                    │
│                                                                       │
│ [Continue with this understanding] [Correct interpretation]           │
│ [Ask me about unresolved details]                                      │
└───────────────────────────────────────────────────────────────────────┘
```

**Behaviour.** The user can begin with arbitrary input. Tattava shows its interpretation and material unknowns before using an assumption that could materially change the output. Corrections update the working interpretation; they do not silently alter Canon.

### 11.4 Wireframe UX-S03 — Clarification Panel

```text
┌───────────────────────────────────────────────────────────────────────┐
│ One decision will materially improve the next result                  │
│                                                                       │
│ Question: How closely should the story follow documented history?     │
│ Why this matters: It changes research depth and how invented events   │
│ are labelled in the story.                                            │
│                                                                       │
│ ( ) Evidence-led historical reconstruction                            │
│ ( ) Fiction inspired by documented events                             │
│ ( ) Not decided yet                                                   │
│ ( ) Another approach: [________________________________________]       │
│                                                                       │
│ [Save answer] [Defer decision] [See what changes by option]            │
└───────────────────────────────────────────────────────────────────────┘
```

**Behaviour.** Questions are prioritised by impact and dependency, not by a desire to complete every field. Deferring is allowed when safe; the system records the unresolved state and proceeds only with actions that do not require the missing decision.

### 11.5 Wireframe UX-S04 — Research Workspace

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Research: [Question / claim]                          Status: Partial       │
├──────────────────────┬──────────────────────────────────┬───────────────────┤
│ FINDINGS             │ SELECTED EVIDENCE                │ SOURCE DETAILS    │
│                      │                                  │                   │
│ Claim A              │ Excerpt / relevant passage       │ Title             │
│ [Corroborated]       │                                  │ Publisher         │
│                      │ Why it matters to the story      │ URL / locator     │
│ Claim B              │                                  │ Retrieved date    │
│ [Conflicting]        │ Limitations / qualification      │ Evidence status   │
│                      │                                  │ Conflicts         │
│ Claim C              │ [Add to research brief]          │                   │
├──────────────────────┴──────────────────────────────────┴───────────────────┤
│ [Refine query] [Compare sources] [Create story implication candidate]       │
└────────────────────────────────────────────────────────────────────────────┘
```

**Behaviour.** A source citation opens inspectable details. Evidence status and source quality must not be collapsed into a decorative confidence badge. Conflicting claims remain visible, and any story implication is a separate candidate linked back to evidence.

### 11.6 Wireframe UX-S05 — Candidate Review

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Candidate: Character motivation       [Candidate] [Branch A] [v12]         │
├──────────────────────────────────────────┬─────────────────────────────────┤
│ CANDIDATE CONTENT                        │ WHY THIS VERSION                │
│                                          │                                 │
│ [Editable long-form content]             │ • Uses approved premise         │
│                                          │ • Draws on evidence E-014       │
│ [Inline comments / suggested edits]      │ • Assumption: motive not Canon  │
│                                          │ • Conflicts: none detected      │
├──────────────────────────────────────────┴─────────────────────────────────┤
│ [Save draft] [Compare versions] [Request review] [Accept candidate]         │
│ Note: Accepting a candidate is not the same as committing it to Canon.      │
└────────────────────────────────────────────────────────────────────────────┘
```

**Behaviour.** The lifecycle state is always visible. Candidate acceptance, formal approval and Canon commitment are separate actions where the workflow requires them. If the current user is not authorised for the next state transition, the corresponding action is disabled or replaced by a clear request-review path.

### 11.7 Wireframe UX-S07 — Canon / Decision Review

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Proposed Canon change                         Awaiting authorised decision │
├────────────────────────────────────────────────────────────────────────────┤
│ CURRENT CANON                         PROPOSED CHANGE                      │
│ [Current approved statement]          [Proposed replacement]               │
│                                                                            │
│ Reason for change: [explanation]                                            │
│ Evidence / candidate links: [E-014] [Candidate C-022]                      │
│ Known downstream impact: [Character arc, episode 3 motivation]             │
│ Unknown impact: [Screenplay draft not yet analysed]                         │
│                                                                            │
│ Decision record: actor, role, timestamp, rationale, source version          │
│                                                                            │
│ [Approve and commit] [Reject] [Request revision] [Defer]                    │
└────────────────────────────────────────────────────────────────────────────┘
```

**Behaviour.** The system checks authorisation and expected version on the server before committing. The action is blocked if permission is unresolved or the base version is stale. The UI must not promise a successful commit before the server confirms it.

### 11.8 Wireframe UX-S09 — Story Development Package

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Story Development Package   Version 0.8   Status: Ready for review          │
├──────────────────────────────┬─────────────────────────────────────────────┤
│ PACKAGE SECTIONS             │ READINESS / GAPS                             │
│ ✓ Project premise            │ Required sections: 8 / 10 complete           │
│ ✓ Format and genre           │ Awaiting approval: character arc              │
│ ✓ Research brief             │ Open conflict: timeline of event X             │
│ ✓ Story world                │ Unresolved assumptions: 2                     │
│ • Character profiles         │ Evidence limitations: 1                       │
│ • Narrative structure        │                                               │
│ • Screenplay / sample        │ [View issues] [Open section]                  │
│ • Decisions and canon        │                                               │
├──────────────────────────────┴─────────────────────────────────────────────┤
│ [Preview package] [Request approval] [Export if permitted]                  │
└────────────────────────────────────────────────────────────────────────────┘
```

**Behaviour.** Readiness is explained through section-level status, approvals, conflicts and unresolved assumptions. Counts and “ready” labels must be computed from an approved package schema; until that schema is finalised, these fields are illustrative and must not be treated as approved thresholds.

### 11.9 Wireframe UX-S10 — Run Status / Recovery

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Research and synthesis run                          Status: Partially done  │
│ Stage 1 Retrieve sources             Complete                              │
│ Stage 2 Extract evidence              Complete                              │
│ Stage 3 Synthesis                    Failed — model unavailable             │
│                                                                            │
│ Saved outputs: 12 source records, 7 extracted evidence items                │
│ Not completed: research synthesis                                          │
│ Canon changes: none                                                         │
│                                                                            │
│ [Retry failed stage] [Resume] [Cancel remaining work] [View run details]    │
└────────────────────────────────────────────────────────────────────────────┘
```

**Behaviour.** The UI reports what succeeded, what failed, and what state was not changed. Retry must be idempotent where possible and must not duplicate decision records or mutate Canon.

## 12. Screen-to-requirement and acceptance mapping

| Screen ID | Requirement family | Minimum acceptance evidence |
|---|---|---|
| UX-S01 | Project state / context / next action | Active project, branch, version, open unknowns and next action are visible; stale context is detectable |
| UX-S02 | Universal input / intent understanding | User can submit unstructured input; interpretation can be corrected before consequential downstream use |
| UX-S03 | Adaptive clarification | Questions explain why they matter; deferred unknowns remain explicit |
| UX-S04 | Research and provenance | Each factual finding links to source details; conflicts and partial coverage are visible |
| UX-S05 | Candidate lifecycle | Candidate state is distinguishable from approved Canon; edit and review actions preserve version history |
| UX-S06 | Branching and versioning | Alternatives remain isolated; diffs are inspectable; merge requires explicit action |
| UX-S07 | Approval and Canon integrity | Permission and version are validated before commit; all decisions are auditable |
| UX-S08 | Dependency / impact intelligence | Known affected elements and analysis limitations are displayed before consequential change |
| UX-S09 | Story Development Package | Section status, gaps, version and approval state are visible; incomplete content is not misrepresented |
| UX-S10 | AI run observability / recovery | Long-running tasks have status; partial results survive; retry cannot silently overwrite approved state |

## 13. UX edge-state matrix

| State | Required visible feedback | Required user option | Safety/integrity rule |
|---|---|---|---|
| Empty project | Explain how to start and accept arbitrary input | Enter idea / add supported material | Do not imply project context exists |
| Loading | Name the active operation and show progress when available | Continue elsewhere or cancel if supported | Do not show fabricated progress percentages |
| Awaiting input | State the question and why it matters | Answer / defer where safe | Keep unknown explicit |
| Partial success | Separate completed and incomplete outputs | Inspect / retry failed stage | Preserve completed outputs |
| No research results | Explain query scope and limitations | Refine query / change approach | Do not invent sources |
| Conflicting evidence | Show competing claims and source provenance | Compare / defer / choose with rationale | Do not silently resolve |
| Permission denied | Explain that the action is unavailable | Request authorised review / return | Never infer authority from role label alone |
| Stale version | Identify changed version and affected review | Refresh / compare / rebase if supported | Do not commit against stale state |
| Commit failure | State that Canon was not changed unless confirmed otherwise | Retry / refresh / inspect error | No optimistic success message |
| Package blocked | List concrete gaps and their states | Open gap / request review | No unsupported readiness claim |

## 14. Accessibility and responsive wireframe rules

Wireframes are content-structure references, not desktop-only constraints. On narrower layouts, preserve the task context and state labels before preserving side-by-side columns. Research source details may move into a drawer; Copilot may collapse into a panel; review actions must remain discoverable and keyboard reachable. Avoid relying on colour alone for statuses. Every state must have text and, where useful, an icon. Keyboard focus order must follow the logical reading and decision sequence. Modal approval and destructive-action flows must trap/restore focus appropriately and clearly announce status changes to assistive technology.

## 15. Open UX decisions

| ID | Decision | Why it matters | Safe interim treatment |
|---|---|---|---|
| UX-OD-01 | Approved brand guidelines and assets | Determines final visual tokens and brand expression | Keep tokens provisional |
| UX-OD-02 | Rich-text and screenplay editor behaviour | Affects editing, formatting, autosave and versioning | Specify editing outcomes without claiming a particular editor implementation |
| UX-OD-03 | Supported file types, size and extraction limits | Affects universal input and error states | Show accepted types/limits only after Engineering confirms them |
| UX-OD-04 | Action-level role/approval matrix | Controls approval and Canon actions | Server-side authorisation; block unresolved protected actions |
| UX-OD-05 | Package schema and readiness rules | Controls section completeness and readiness | Explain gaps; do not invent thresholds |
| UX-OD-06 | Responsive device/browser support | Affects layout and test matrix | Validate target support before release |
| UX-OD-07 | Notification channels | Affects async run completion | In-product status is baseline; do not promise email/push |

