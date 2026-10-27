# Tattava Copilot — Design System
**Document ID:** EXP-DS-04 | **Version:** 1.0 | **Status:** Provisional foundation for implementation  
**Scope:** V1 Narrative Intelligence

## Contents
1. Purpose and governance
2. Design principles
3. Tokens and visual foundations
4. Layout and responsive rules
5. Component architecture
6. Component specifications
7. AI-specific patterns
8. Accessibility
9. Implementation and governance
10. Open decisions

## 1. Purpose and governance

This document defines a reusable interface language for project intelligence, research, long-form creative work, evidence inspection, candidate review, Canon governance and package approval. No approved brand guideline, logo specification, final typography system or palette was established in the accessible sources reviewed for this package. Therefore, **all numeric visual values below are provisional recommendations, not approved brand standards**. Replace them when official brand assets are supplied and validate in user testing.

The most important consistency requirement is semantic: users must distinguish project state, evidence, interpretation, candidate content, human decision and Canon across every screen and component.

## 2. Design principles

### Quiet interface, high information integrity
Creative work needs attention. Use restrained emphasis; reserve strong semantic colour for meaningful states. Avoid decorative dashboards and animation that adds no information.

### State over ornament
Use consistent labels, icons, metadata and placement. Never rely on colour alone to distinguish Candidate from Canon or verified from unverified.

### Long-form work is first-class
Editors, research findings, screenplay/dialogue work and package review need readable line length, stable navigation, clear versioning and robust keyboard support. Do not optimise solely for short chat bubbles.

### Human decisions differ from AI suggestions
Use consistent visual treatments for AI proposals, human-edited content, approved decisions and Canon. The difference remains clear in lists, cards, comparisons and exports.

### Evidence stays close to claims
Citations and source metadata must be reachable from the relevant finding. Avoid detached footnotes that make claim-source mapping ambiguous.

### Accessibility by default
Keyboard, screen-reader, zoom, contrast, reduced-motion and non-colour status cues are design requirements.

## 3. Tokens and visual foundations

### 3.1 Token status

| Family | Status | Rule |
|---|---|---|
| Brand colours | Provisional | Replace with approved values; do not infer brand identity from product name |
| Neutral palette | Provisional | Optimised for long-form content and state-heavy UI |
| Semantic colours | Provisional | Must meet contrast and never be the only status cue |
| Typography | Provisional | Confirm against brand, editor needs and font licensing |
| Spacing/radius | Provisional | Consistent scale, not screen-specific improvisation |
| Breakpoints | Provisional | Validate against real usage and implementation |
| Motion | Provisional | Respect reduced-motion preference |
| Icons | Recommendation | Consistent family; text labels for critical state |

### 3.2 Provisional colour tokens

| Token | Provisional value | Use | Constraint |
|---|---|---|---|
| `color.canvas` | `#FFFFFF` | Main background | Maintain hierarchy |
| `color.surface` | `#F7F8FA` | Secondary panels | Preserve text contrast |
| `color.surface.raised` | `#FFFFFF` | Cards/dialogs/editors | Use border/shadow to show boundary |
| `color.text.primary` | `#171A1F` | Main text | Meet contrast |
| `color.text.secondary` | `#525B66` | Supporting text | Must remain legible |
| `color.text.muted` | `#66717D` | Timestamps/metadata | Verify contrast at actual size |
| `color.border` | `#D8DEE6` | Dividers/boundaries | Not a substitute for focus |
| `color.action.primary` | `#244C73` | Primary action | Validate button contrast |
| `color.action.hover` | `#1D3F60` | Hover/active | Keep state visible |
| `color.focus` | `#155EEF` | Focus indicator | Visible against adjacent surfaces |
| `color.success` | `#217A4B` | Success | Pair with text/icon |
| `color.warning` | `#8A5A00` | Warning/unresolved risk | Pair with text/icon |
| `color.danger` | `#B42318` | Error/destructive | Pair with text/icon |
| `color.info` | `#175CD3` | Informational | Pair with text/icon |
| `color.ai.surface` | `#F2F5F9` | AI suggestion surface | Must not imply authority |
| `color.candidate.border` | `#8AA7C2` | Candidate outline | Also label “Candidate” |
| `color.canon.surface` | `#EEF7F0` | Canon surface | Also label “Canon” and version |
| `color.conflict.surface` | `#FFF4E5` | Conflict callout | Also label “Conflict” |

### 3.3 Semantic state tokens

| Token | Meaning | Required text cue |
|---|---|---|
| `state.known` | Currently known in project state | Known |
| `state.unknown` | Not established | Unknown / Intentionally unknown |
| `state.ambiguous` | Multiple interpretations remain | Ambiguous |
| `state.assumed` | Working assumption | Assumption |
| `state.conflicting` | Inputs/evidence disagree | Conflicting |
| `state.blocked` | Cannot proceed under current constraints | Blocked |
| `state.resolved` | Resolution recorded | Resolved + link |
| `state.candidate` | Proposed content awaiting decision | Candidate |
| `state.canonical` | Approved authoritative state | Canon + version |
| `state.partial` | Operation partly completed | Partial result |
| `state.stale` | Base/context may be outdated | Stale / Needs refresh |
| `state.awaiting-approval` | Human decision pending | Awaiting approval |

### 3.4 Typography

Provisional recommendation: use a legible UI sans-serif for interface text and, if brand permits, a compatible readable face for long-form content. Use monospaced type only for identifiers/code/technical metadata.

| Token | Provisional size / line height | Use |
|---|---|---|
| `type.display` | 32 / 40 px | Rare top-level workspace heading |
| `type.h1` | 28 / 36 px | Page title |
| `type.h2` | 22 / 30 px | Major section |
| `type.h3` | 18 / 26 px | Subsection |
| `type.body` | 16 / 24 px | Default prose and controls |
| `type.body.compact` | 14 / 20 px | Dense metadata/tables when accessible |
| `type.label` | 14 / 20 px, medium | Labels/tabs/buttons |
| `type.caption` | 12 / 16 px | Non-essential metadata only |
| `type.editor` | 16–18 / 26–30 px | Long-form creative editing; validate with users |

Do not shrink essential information to fit a dense card. Reduce or progressively disclose content instead.

### 3.5 Spacing, radius, border and elevation

Provisional spacing scale: `space-1=4px`, `space-2=8px`, `space-3=12px`, `space-4=16px`, `space-5=20px`, `space-6=24px`, `space-8=32px`, `space-10=40px`, `space-12=48px`, `space-16=64px`.

Provisional radii: `radius-sm=4px`, `radius-md=8px`, `radius-lg=12px`, `radius-pill=999px`. Use restrained shadows; prefer spacing and borders for ordinary panels. Elevation communicates layering (dialog/popover/menu), not importance.

### 3.6 Responsive breakpoints

Provisional content-driven breakpoints: `bp-narrow` below 640 CSS px; `bp-medium` 640–1023; `bp-wide` 1024–1439; `bp-xl` 1440 and above. These are starting points, not approved device support. Test intermediate widths and browser zoom. Long-form prose needs a readable max line length; comparison views may use more width when beneficial.

## 4. Layout and responsive rules

### 4.1 App shell

The app shell consists of workspace/project navigation, main task content and optional contextual inspector. The inspector should not remain open if it makes the editor unusably narrow. On narrow screens it becomes a drawer or dedicated view. Current project, branch and version must remain identifiable during navigation.

### 4.2 Content density

Use denser layouts for source inventories, version lists and metadata, but retain clear row spacing and accessible target sizes. Long-form prose needs comfortable line length and paragraph spacing. Mobile tables should have an accessible responsive alternative such as stacked key/value rows; avoid inaccessible horizontal-scroll traps.

### 4.3 Responsive component rules

| Component | Wide viewport | Narrow viewport |
|---|---|---|
| Primary navigation | Persistent sidebar or equivalent | Drawer/overlay with current project identified |
| Context inspector | Side panel | Drawer or dedicated view |
| Dialog | Centred, max-width | Near-full-screen sheet/dialog with internal scrolling |
| Table | Multi-column | Responsive row cards or accessible horizontal scroll |
| Branch comparison | Side-by-side aligned columns | Select branch and compare sections sequentially |
| Candidate editor | Editor + context panel | Editor-first; context opens on demand |
| Package review | Section navigation + content | Section list/content view with version state |
| Toast/status | Non-blocking live region | Same, without obscuring controls |

## 5. Component architecture

### 5.1 Naming conventions

Use semantic names rather than colour names:
- `Button/Primary`, `Button/Secondary`, `Button/Destructive`
- `Input/Text`, `Input/Textarea`, `Input/File`
- `Navigation/ProjectSidebar`, `Navigation/Breadcrumbs`, `Navigation/Tabs`
- `Surface/Card`, `Surface/Panel`, `Surface/Drawer`, `Surface/Dialog`
- `Status/Badge`, `Status/InlineMessage`, `Status/TaskProgress`
- `AI/Response`, `AI/CandidateHeader`, `AI/ContextInspector`, `AI/SourceCitation`
- `Evidence/Finding`, `Evidence/SourceDetail`, `Evidence/Conflict`
- `Governance/ApprovalRequest`, `Governance/CanonVersion`, `Governance/ChangePreview`
- `Version/History`, `Version/Comparison`, `Branch/ScopeLabel`, `Branch/MergeProposal`
- `Package/ReadinessSummary`, `Package/Section`, `Package/ApprovalState`

A component name describes semantic purpose, not colour. Do not duplicate components solely because they appear in different domains.

### 5.2 Component contract

Every reusable component documents purpose/context; required and optional content; variants/sizes; default, hover, focus, pressed, disabled, loading, success and error states as relevant; keyboard behaviour; accessible name/description/status announcement; responsive behaviour; state-changing effects; analytics events if justified; dependencies on permissions/project state/tokens.

## 6. Component specifications

### 6.1 Buttons

| Variant | Use | Avoid |
|---|---|---|
| Primary | One main action per view/dialog | Multiple equally dominant actions |
| Secondary | Useful alternative/navigation | Hiding destructive consequence |
| Tertiary/text | Low-emphasis action | Using for critical ambiguous action |
| Destructive | Delete/discard/revoke when supported | Red styling without clear label |
| Icon-only | Compact utility with accessible name | Ambiguous icon-only critical action |

Provide compact/default/large sizes if needed, with dimensions validated against accessibility and product layout. States include default, hover, focus-visible, pressed, disabled, loading, task-level success and task-level error. Use verbs: “Save candidate,” “Compare versions,” “Approve and update Canon,” not “OK” for consequential actions.

### 6.2 Text inputs and textareas

Persistent label; optional helper text; clear required/optional indication; validation associated with field; preserve entered text after recoverable errors; support paste and keyboard navigation. Creative-input textareas should resize or scroll predictably and not unexpectedly lose focus.

| State | Behaviour |
|---|---|
| Empty | Label and concise example/helper if useful |
| Focused | Visible focus indicator |
| Invalid | Field-level error explains correction |
| Disabled | Clearly unavailable; explain why when meaningful |
| Saving | Truthful save state; reading remains possible |
| Error | Preserve text and offer retry/alternative |

### 6.3 File input and upload status

Identify selected file, type/size when available, processing state, extraction result and error. Users can remove a file before submission. If extraction fails, keep original according to policy and allow other inputs to proceed. Do not claim OCR, image understanding, transcription or a format is supported unless validated. File limits are governed by D-14.

### 6.4 Navigation and tabs

Use clear labels, current-page indication and keyboard support. Tabs are for peer views, not hiding critical workflow steps. On small screens, tabs may become labelled select or accessible horizontal scroll. Keep current project/branch/version identifiable.

### 6.5 Cards and panels

Cards group related summaries/actionable objects, not every paragraph. Clickable cards have an accessible interactive name. Avoid nested clickable cards with ambiguous focus order. AI suggestion panels must not resemble approved Canon panels without explicit state labels.

### 6.6 Dialogs, drawers and menus

Dialogs support focused decisions, confirmations and short workflows. Keep project/version context visible for consequential actions. Move focus into dialog, manage focus, support Escape when safe and restore focus on close. Cancel must not partially commit. Menus support keyboard and touch; critical actions are not discoverable only on hover.

### 6.7 Tables and comparison views

Use for source inventories, versions and decisions. Provide labelled columns, row headers where appropriate, sorting/filter announcements and responsive alternatives. Semantic AI comparisons must be distinguished from literal text diffs and must allow opening source versions.

### 6.8 Notifications, inline messages and toasts

| Pattern | Use | Persistence |
|---|---|---|
| Inline message | Current field/task state | Until resolved or irrelevant |
| Status badge | Object lifecycle/epistemic state | Persists with object |
| Toast | Brief low-risk confirmation | Temporary; never sole proof of consequential success |
| Task notification | Long-running completion/failure/review need | Discoverable from task/activity list |
| Blocking alert | Critical permission/integrity/safety issue | Remains until resolved/acknowledged |

After Canon changes, show new version and link to change record; a disappearing toast is insufficient.

### 6.9 Tooltips and help

Tooltips supplement labels and work on hover/focus; they do not replace essential instructions. Use inline explanation for unfamiliar concepts. Tooltips must be dismissible and avoid hiding policy or state information.

### 6.10 Loading and progress

Use spinner for short indeterminate wait; task-level progress for long-running operations. Show real stages only. Respect reduced motion and avoid fabricated percentages. Keep task identity and safe navigation available.

### 6.11 Empty and error components

Empty state explains what belongs in view, why it may be empty and one useful next action. Error state explains what failed, what state was preserved and how to recover. Never imply an action was applied if it failed.

## 7. AI-specific patterns

### 7.1 AI response container

Group AI-provided content without implying authority. Include response content; task/context label where relevant; candidate/partial/interpretation status; source links where required; correction/feedback controls. AI output must not be visually indistinguishable from human-authored Canon. Do not use colour as the sole signal.

### 7.2 Candidate header

Display Candidate label, artifact name/type, project/branch, Canon/context version when relevant, created/updated state, unsaved/stale status and permitted actions. Never show Approved until approval event exists.

### 7.3 Source citation and evidence card

Show source title, publisher, URL/stable identifier, retrieval date, excerpt/locator, supported claim, qualification, evidence status and conflict link where available. Missing fields are omitted or labelled unavailable, never fabricated. Keyboard activation opens source detail or external link without unexpectedly discarding work.

### 7.4 Uncertainty and conflict

Use explicit label plus concise explanation: **Unresolved** (“The project has not established this yet”); **Assumption** (“Used for this draft only; not approved”); **Sources conflict**; **Not verified**; **Potential impact** (“May affect linked scenes; dependency graph may be incomplete”). Do not use a universal confidence meter that conflates evidence quality, model confidence and creative quality.

### 7.5 Streaming response

Optional implementation capability. If supported, indicate in-progress; keep output draft until run and validation finish; avoid announcing each token to screen readers; provide stable reading mode/completion announcement; preserve partial output as partial on failure; disable protected actions until validation/review is complete.

### 7.6 Tool activity

Show user-relevant stages only when backend reports them. No raw internal function names or speculative progress. Provide task detail with completed/failed steps, outputs and retry/cancel controls where supported.

### 7.7 Approval request and change preview

Required content: action; current version; proposed changes; affected entities/artifacts; evidence/rationale; known impact and coverage caveat; required approval status; actor permission state.

| State | Behaviour |
|---|---|
| Proposed | Show change set and review action |
| Awaiting approval | Show status and route if known |
| Approved | Show exact approved version, actor/role and timestamp where available |
| Rejected | Preserve proposal and record rejection where supported |
| Blocked | Explain permission/version/policy block |
| Stale | Pause commit and require compare/refresh |
| Failed | Show Canon unchanged unless confirmed commit proves otherwise |

### 7.8 Canon version indicator

Always show current version in Canon views/protected flows. Candidate shows version used. If stale, use text and clear compare/refresh action. Version labels come from system state, not model inference.

### 7.9 Branch scope label

During exploration/comparison show active branch and base version. Persistent label example: **Exploring Branch B — main Canon unchanged**. It remains visible during generation/editing, not hidden in a panel.

### 7.10 Package readiness

Use observable states: Building, Ready for review, Contains unresolved gaps, Awaiting approval, Approved version, May be stale. Avoid unapproved scores. Approval applies to exact package version; greenlight is a separate human/business action.

## 8. Accessibility

Proposed target: WCAG 2.2 AA, subject to formal review. Test actual app, not merely component library claims.

- Every interactive component is keyboard reachable; focus order follows task order; focus is visible and not obscured.
- Dialog focus is managed/restored; drag actions have keyboard alternatives; menus/tabs/accordions/tables use expected keyboard patterns.
- Verify text, control boundary and focus contrast in final combinations.
- Status always includes textual label or accessible name; never rely on red/green alone.
- Use live regions for meaningful task-state changes, save success/failure, validation and approval outcomes; avoid announcing every streamed token.
- Respect reduced-motion; avoid flashing, parallax and decorative motion; prevent layout shifts during streaming.
- Provide logical headings/landmarks for AI response, evidence list and branch comparison.

## 9. Implementation and governance

### 9.1 Token hierarchy

1. **Primitive tokens:** raw colour, spacing, type scale, radius, border, elevation, motion.
2. **Semantic tokens:** text, surface, action, focus, success, warning, danger, information, candidate, Canon, conflict, partial and stale.
3. **Component tokens:** button, card, dialog, input, status, citation, candidate, approval and editor.
4. **Composed patterns:** project shell, research review, candidate review, branch comparison, Canon change and package review.

Components consume semantic tokens rather than hard-code primitive colours. A palette update should not require editing every screen.

### 9.2 Suggested analytics events

Project entry started/completed/failed; intent corrected; clarification answered/skipped/deferred; research partial/complete/failed; source opened/marked incorrect; candidate created/edited/accepted/rejected; branch created/compared/merge proposed; Canon proposal approved/rejected/blocked/stale; continuity finding accepted/dismissed; package assembled/reviewed/approved/stale; recovery attempted/succeeded/failed. Avoid unnecessary raw script text or confidential content. Event schema and retention require data/privacy review.

### 9.3 Component acceptance checklist

Purpose and allowed contexts documented; relevant states implemented; keyboard/screen reader tested; contrast/zoom/reflow checked; responsive behaviour verified; destructive/protected actions clearly labelled; loading/error/empty/recovery included; AI suggestion distinguished from human decision/Canon; analytics justified and privacy-reviewed; design and engineering agree on token use.

## 10. Open decisions

| ID | Decision | Follow-up |
|---|---|---|
| DS-OD-01 | Approved brand assets/guidelines | Replace provisional colours, fonts, logo and visual rules |
| DS-OD-02 | Frontend component library/theming | Map semantic tokens and contracts to implementation |
| DS-OD-03 | Device/browser support | Validate breakpoints and layouts |
| DS-OD-04 | Accessibility target/audit owner | Confirm WCAG recommendation and test plan |
| DS-OD-05 | Editor capabilities | Define rich text, screenplay formatting, autosave, collaboration and offline behaviour |
| DS-OD-06 | Upload/extraction capabilities | Align component with real formats/limits |
| DS-OD-07 | Notification channels | Confirm in-app/email/push and privacy constraints |
| DS-OD-08 | Approval matrix | Finalise approval request/change-preview variants |
| DS-OD-09 | Evidence/confidence labels | Align with source policy and AI evaluation |
| DS-OD-10 | Analytics/privacy schema | Approve events, retention and data minimisation |

## Final design-system decision

Adopt a restrained, accessible, state-explicit design system for V1. Make persistent project intelligence legible, support long-form creative work, and distinguish AI-generated candidates from human-approved Canon at every stage. Visual values in this version are provisional pending brand confirmation; behavioural and semantic distinctions are core product requirements.

---

## 10. Experience wireframe conventions and semantic states

The wireframes in `02_UX_Specification.md` use a structural, low-fidelity convention. The Design System governs the meaning of status, content type, actions and component behaviour; it does not turn those wireframes into approved visual designs.

### 10.1 Content-state semantics

| Semantic concept | Meaning | Required presentation rule |
|---|---|---|
| Evidence | Material retrieved or supplied to support a factual claim | Provide inspectable provenance and evidence status |
| Interpretation | Tattava’s reading of input or evidence | Label as interpretation; permit correction |
| Candidate | Generated or proposed content awaiting human decision | Visually distinct from approved/canonical content |
| Decision | Explicit human choice with actor, time and rationale where applicable | Show decision state and history |
| Canon | Authoritative approved project state | Use persistent, unmistakable canonical label; never imply that draft text is Canon |
| Unknown | Information not established | Display as an explicit state, not an empty value that implies omission |
| Ambiguous | More than one plausible interpretation | Show alternatives or ask a targeted question |
| Conflicting | Sources or project facts disagree | Present conflict without silently collapsing it |
| Blocked | Work cannot safely proceed until a dependency is resolved | Explain the blocker and safe next action |
| Stale | The result was prepared against an earlier project version | Require refresh/review before protected commit |

Colour may reinforce these meanings but must never be the only carrier of meaning. Use text labels and accessible iconography as well.

### 10.2 Core component inventory

| Component ID | Component | Required variants/states | Behaviour contract |
|---|---|---|---|
| DS-C01 | Project context header | Active, switched, stale, unavailable | Shows project/branch/version context on consequential surfaces |
| DS-C02 | Epistemic state label | Known, unknown, ambiguous, assumed, conflicting, resolved, blocked | Uses plain language and exposes detail on demand |
| DS-C03 | Lifecycle badge | Working, candidate, reviewed, approved, canonical, deprecated, locked, derived | Does not conflate saved, accepted, approved and canonical |
| DS-C04 | Evidence reference | Available, partial, conflicting, rejected, unavailable | Opens source detail where possible; preserves provenance |
| DS-C05 | AI activity/status panel | Queued, running, awaiting input, awaiting approval, succeeded, partial, failed, cancelled | Reports actual state and available actions |
| DS-C06 | Candidate editor | Editing, saved, dirty, stale, read-only | Makes save state and version clear |
| DS-C07 | Approval panel | Awaiting review, authorised, denied, stale, completed | Shows proposed change and permission outcome |
| DS-C08 | Change-impact list | Impact found, none known, incomplete analysis | Distinguishes “no impact found” from “analysis incomplete” |
| DS-C09 | Version comparison | Base, alternative, changed, added, removed, conflict | Identifies versions and keeps branches isolated |
| DS-C10 | Package readiness list | Complete, missing, unresolved, awaiting approval, blocked | Readiness derives from approved rules; gaps are actionable |
| DS-C11 | Recovery panel | Retryable, resumable, terminal failure, cancelled | Names completed and failed steps; protects saved work |
| DS-C12 | Confirmation dialog | Standard, consequential, destructive, Canon commit | States the consequence, target project/version and undo/recovery limits |

### 10.3 Component behaviour requirements

**Project context header.** Keep the current project, branch and version visible where an action could affect project state. If the current context is unknown or stale, the interface must not conceal that fact behind a generic project title.

**Evidence reference.** The control must communicate whether it opens a source, a project artefact or a research finding. When source details are unavailable, state that limitation instead of rendering a misleading active citation.

**Lifecycle badge.** “Saved,” “accepted,” “approved,” and “canonical” must remain distinct states. A badge must reflect authoritative application state, not a model-generated claim.

**AI activity/status panel.** Display only progress information actually supplied by the orchestration system. Do not invent percentage completion. For partial success, list completed and failed stages separately.

**Approval panel.** Explain the change, the current and proposed values, relevant dependencies and the action being authorised. Permission must be checked by application services. If the action is blocked, explain the safe next step without exposing sensitive permission internals.

**Recovery panel.** Preserve completed outputs, explain what failed, and offer only recovery actions supported by the system. Retry and resume must be safe against duplicate side effects.

## 11. Interaction and state matrices

### 11.1 Primary action states

| State | Button/action treatment | User feedback |
|---|---|---|
| Available | Enabled with specific verb | Expected outcome is understandable |
| Processing | Disabled or replaced by progress state when duplicate action is unsafe | Current operation and cancellation options, if supported |
| Awaiting input | Show the required question or decision | Explain why input is needed |
| Awaiting approval | Do not imply the action has completed | Identify review status and next step |
| Permission denied | Hide or disable protected action according to approved policy | Explain action is unavailable and route to authorised review |
| Stale version | Prevent commit until version conflict is handled | Identify stale state and offer refresh/compare |
| Failed | Do not show success styling | Explain failed step and safe recovery |
| Completed | Reflect server-confirmed outcome | Confirm what changed and link to audit/version details where permitted |

### 11.2 Semantic token architecture (provisional)

Use semantic token names rather than hard-coded styling decisions in product components:

```text
color.*
type.*
space.*
radius.*
border.*
shadow.*
motion.*
layout.*
z-index.*
state.*
ai.*
```

Suggested semantic families include:

```text
state.unknown
state.ambiguous
state.conflict
state.approved
state.canonical
state.stale
state.blocked

ai.surface
ai.border
ai.action
ai.candidate
ai.processing
ai.warning
```

These names are proposed conventions. Actual token values, contrast pairs, typography scale and breakpoints require brand and accessibility approval.

## 12. Keyboard, screen-reader and responsive behaviour

All controls must be keyboard reachable with visible focus. Dialogs must support focus management and return focus to the initiating control when closed. Status changes that matter to task completion should be announced without continuously interrupting the user. Evidence and state must not be conveyed by colour alone. Long-form creative content must remain navigable at zoom and narrow viewport sizes.

On narrow layouts, convert side-by-side research and project panels into a prioritised stacked view or drawer while preserving context, status and action visibility. Never remove the branch/version indicator from a consequential review. If a control cannot be supported on a viewport, provide an explicit alternative rather than silently dropping functionality.

## 13. Component acceptance checklist

Before a reusable component is accepted:

- Its purpose, semantic meaning and permitted contexts are documented.
- Relevant normal, loading, empty, partial, blocked, error and recovery states are defined.
- Keyboard and screen-reader behaviour is tested.
- Contrast, zoom, reflow and focus visibility are checked.
- Responsive behaviour is verified against supported devices.
- Destructive and protected actions clearly identify their consequences.
- AI-generated candidates are visibly distinct from human decisions and Canon.
- Evidence controls expose provenance or clearly state when provenance is unavailable.
- Status indicators reflect authoritative application state rather than model wording.
- Analytics are justified, minimised and privacy-reviewed.
- Design and engineering agree on token and component contracts.

## 14. Design-system open decisions

| ID | Decision | Follow-up |
|---|---|---|
| DS-OD-01 | Approved brand assets and guidelines | Confirm logo, colours, typography and visual rules |
| DS-OD-02 | Frontend component library and theming | Map semantic tokens and component contracts to implementation |
| DS-OD-03 | Device and browser support | Confirm supported viewport and browser matrix |
| DS-OD-04 | Accessibility target and audit owner | Approve target standard and validation plan |
| DS-OD-05 | Editor capabilities | Define rich text, screenplay formatting, autosave, collaboration and offline behaviour |
| DS-OD-06 | Upload and extraction capabilities | Confirm file formats, limits and error handling |
| DS-OD-07 | Notification channels | Confirm in-app, email or push support before promising any channel |
| DS-OD-08 | Approval matrix | Finalise action-level permissions and review routes |
| DS-OD-09 | Evidence and confidence labels | Align with source policy and AI evaluation; avoid uncalibrated numerical confidence |
| DS-OD-10 | Analytics and privacy schema | Approve event taxonomy, retention and data minimisation |

