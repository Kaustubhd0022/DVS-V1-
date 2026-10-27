# TattvaCo — Final Information Architecture & Product UX Handover
**Version:** 1.0 | **Date:** 9 October 2026  
**Audience:** Product, UX/UI, Frontend, Backend, AI/ML, QA, Security and Content Operations  
**Status:** Refined implementation baseline. Policy-sensitive decisions below are recommended defaults, not claims of formal leadership, Legal or Security approval.

## 1. Executive decision

TattvaCo is a project-centred AI-native film and story development system. The project is the durable intelligence unit; conversation is one interaction surface. The system preserves project context, evidence, creative candidates, human decisions, Canon, continuity and version lineage.

This handover resolves prior IA open questions into a consistent working baseline so design and engineering can proceed. Legal, security, leadership and content-governance decisions are explicitly identified as approval gates rather than silently treated as approved policy.

### Governing principles
1. Project-first: every material action is scoped to an authorized project and workspace.
2. Evidence is not interpretation: source, passage, claim, interpretation and creative decision remain separate.
3. AI proposes; deterministic services enforce: authorization, versioning, approval, persistence and audit are enforced by backend services.
4. Human creative authority: no silent Canon mutation or consequential AI approval.
5. Traceability: material AI runs, evidence, candidate versions, decisions and Canon changes are auditable.
6. Progressive horizons: V1 Narrative Intelligence is the immediate build scope; V2/V3/V4, production integration and MVV OS are strategic architecture, not assumed V1 deliverables.
7. Fail safely: preserve existing state on errors and never claim success before persistence is confirmed.

## 2. Source alignment and authority

When materials conflict, use this order: (1) latest approved Product Strategy and updated PRD; (2) BRD and approved Product Scope; (3) approved user flows, UX specification, AI Interaction Specification and Design System; (4) technical architecture and engineering contracts; (5) this IA handover as the navigation/interaction synthesis; (6) older drafts/prototypes only when not in conflict.

The BRD describes the longer-term journey from idea and research through story, screenplay, dialogue, visual development, production, post-production, localization and distribution. The immediate build baseline is V1 Narrative Intelligence. Future horizons require detailed approved requirements before implementation.

**Labels:** **Baseline** = recommended default for design/engineering; **Approval required** = policy owner must confirm before launch/enablement; **Future horizon** = strategic IA, not V1 commitment; **TBD** = insufficient evidence for a safe final rule.

## 3. Product scope and module map

```text
TATTVACO
├── Platform entry: authentication / invitation / workspace selection / profile
├── Workspace: dashboard / projects / search / review queue / notifications / help
├── Project Intelligence Layer
│   ├── Project overview / activity / decisions
│   ├── Universal input / understanding review
│   ├── Story Brain / entities / relationships / timeline
│   ├── Known / unknown / assumption / ambiguity / conflict
│   ├── Canon / versions / branches
│   └── Dependencies / impact / stale artifacts
├── V1 Narrative Intelligence
│   ├── Research plans / sources / findings / evidence / conflicts
│   ├── Creative exploration / candidate generation / comparison
│   ├── Character and story-world intelligence
│   ├── Format / genre / template / story development
│   ├── Screenplay / dialogue
│   ├── Story Doctor / evaluation
│   └── Story Development Package / review / export
├── Governance: decisions / approvals / Canon proposals / continuity / audit
├── Future horizons: V2 visual / V3 generative production / V4 localization
│   └── DVS production integration / business and management / MVV OS
└── Administration: members / roles / provider config / integrations / security
```

## 4. Resolved policy baseline

### 4.1 Scope boundary
**Baseline:** build the shared intelligence foundation and the V1 narrative workflow: input → understanding → Story Brain → research/evidence → creative exploration → characters/world → format/template → story → screenplay/dialogue → evaluation → Canon/continuity → approved development package.

Visual generation, generative film/media, localization, production scheduling/budgeting/casting, contracts, business affairs, revenue and MVV OS are **future horizons**. Do not present them as live features until separately scoped, implemented and enabled.

**Acceptance:** every V1 requirement maps to a screen, workflow or system interaction. Future screens are tagged FUTURE and hidden/disabled until enabled.

### 4.2 Roles and permissions
Use capability-based permissions, not job-title-only checks. Recommended role bundles:
- **Workspace Owner:** workspace membership and workspace configuration.
- **Project Owner:** project metadata, project lifecycle controls and membership requests.
- **Content Head:** creative approval authority where assigned by policy.
- **Project Contributor:** create/edit permitted content and candidates.
- **Knowledge Manager:** research provenance, Canon/continuity review and knowledge quality for assigned projects.
- **Reviewer:** read/comment on assigned items; approve only with explicit permission.
- **Platform Administrator:** technical/platform operations; no automatic creative approval authority.

Users may hold multiple bundles. Every protected action is checked server-side using organization, project, resource, action and current state. Deny by default. Admin status does not automatically grant access to confidential creative content or creative approval rights.

**Approval baseline:** a configured Content Head or explicitly authorized project approver is the default authority for consequential Canon changes and final package approval. If no approver is configured, block final approval and direct the user to an authorized owner; never auto-approve.

**Approval required:** ratify role labels, delegation, multi-approver rules, separation of duties, emergency access and project ownership transfer.

### 4.3 Canon, versions and human control
- AI output is a **candidate**, not Canon.
- Saving a candidate creates/updates a versioned artifact; it does not change Canon.
- Canon mutation requires a change proposal, before/after diff, impact summary, authorization check, current-version check and explicit confirmation.
- Use optimistic concurrency/version validation. If Canon changed, mark the proposal stale and require compare/rebase/re-review.
- On commit failure, preserve existing Canon and the proposal; show truthful failure.
- Record actor, timestamp, source candidate, previous/new version, rationale and affected entities.
- Rejected candidates remain in history subject to approved retention; never silently delete or relabel as approved truth.
- Undo creates a compensating version rather than erasing audit history.

### 4.4 Research source hierarchy and evidence
Default source tiers:
- **Tier 1 — Primary/official:** government departments, official archives, legislation, original records and official institutional collections.
- **Tier 2 — Scholarly/specialist:** peer-reviewed work, university presses, specialist books, reputable research institutions and established specialist journalism.
- **Tier 3 — Discovery/context only:** Wikipedia, blogs, forums, social media, aggregators and unsourced summaries. These can help discover leads but do not independently qualify as verified evidence for consequential claims.

A tier is not a guarantee of truth; a source may not answer the specific question. Preserve disagreement, publication/retrieval dates, exact passage, URL, source identity, claim relationship and verification status.

**Minimum evidence fields:** evidence_id, project_id, source title, publisher/author, URL, source tier/type, publication date if available, retrieval timestamp, exact excerpt/locator, extracted claim, relation (supports/contradicts/contextualizes), confidence/quality assessment, conflict group, extraction method, verification status and research-run reference.

**Conflict rule:** never silently choose a winner when authoritative sources conflict. Show competing claims, compare evidence, seek additional sources if useful, and leave unresolved if evidence is insufficient. Label legend, tradition, etymology and scholarly hypothesis explicitly.

**Provider rule:** providers are interchangeable discovery/retrieval adapters. Provider output is untrusted raw input until TattvaCo validates source identity, URL, excerpt, provenance and claim mapping. Fallback is allowed only to an enabled, policy-approved provider; preserve provider/model/run metadata. User selection is limited to admin-approved providers.

### 4.5 AI provider and model policy
**Baseline architecture:** TattvaCo Model Gateway → approved providers/models. UI and agent logic must not be coupled directly to one vendor API.
- Reasoning-capable models for multi-step narrative reasoning, synthesis, research reasoning and impact analysis.
- Lower-latency models for extraction, classification, tagging, routing and structured transformations where evaluation supports them.
- Specialized services/models for OCR, embeddings, reranking and multimodal processing when needed.
- Log run_id, project_id, user_id, task, provider/model, prompt version, context snapshot, retrieved item/evidence IDs, tool calls, output IDs, validation, latency, cost/tokens when available, failure and recovery.
- Do not expose private chain-of-thought; expose concise rationale, sources, context, uncertainty and actionable explanations.
- Fallback models must pass task-specific compatibility/evaluation; fallback is not permission to silently reduce quality.
- External-provider data transfer follows approved organizational policy.

**Approval required:** provider/model allowlist, data classes permitted per provider, cost limits, regional processing and vendor terms.

### 4.6 Privacy, retention and deletion
**Safe default:** least privilege, workspace/project isolation, encryption in transit/at rest, server-side secrets, no provider training use of project data unless explicitly approved, and no cross-project retrieval.

Retention periods cannot be inferred safely from available material. Until an approved schedule exists:
- follow existing organizational retention policy and legal holds;
- do not promise complete/immediate deletion unless the backend can guarantee it;
- provide a documented deletion-request workflow and status;
- distinguish user-visible removal, logical deletion, backup expiry and provider-side deletion;
- define audit retention separately from creative artifacts.

**Approval required:** Legal/Security approval of data classification, retention, deletion semantics, backup expiry, provider processing and incident response.

### 4.7 Uploads and processing
Use an allowlist of file types and configurable size limits; do not accept arbitrary files by default. Validate extension, MIME type and actual content; scan uploads; isolate processing; check access before extraction/retrieval. Show supported formats and current limits in the upload UI.

No verified final size limit or complete format list is established here. Make them centrally configurable, not hard-coded UX promises. For unsupported/corrupt files, preserve the upload record, explain why it failed and offer a supported alternative. Label partial extraction as partial.

**Approval required:** Engineering/Security publish the allowlist, limits, retention, scanning and OCR/extraction support before launch.

### 4.8 Package readiness and approval
Mark a Story Development Package **Ready for Review** only when:
1. Required sections exist according to the selected template.
2. Required metadata and format are defined.
3. Material unresolved questions/conflicts are surfaced.
4. Required research evidence is linked and provenance is available.
5. Included artifacts reference explicit versions.
6. Continuity analysis status is recorded; partial/failed is not presented as passed.
7. Canon-dependent content is current or explicitly marked stale.
8. Required approvals are complete or explicitly pending.
9. The package can be inspected in preview.

Statuses: **Draft → Needs Attention → Ready for Review → Changes Requested → Approved → Superseded**. Ready for Review means ready for human review, not guaranteed creative quality. Do not invent universal numeric quality thresholds.

**Approval required:** Content leadership defines mandatory package templates by format and which gaps block review versus warn.

### 4.9 Metrics and quality thresholds
Instrument first; do not invent baseline targets.

- **Outcome:** time to first usable candidate; time to approved package; development hours/project where reliable; projects progressing by stage; rework/revision rate.
- **Quality/trust:** acceptance/edit/rejection; meaningful edit rate; approval time/review cycles; citation validity/provenance completeness; unsupported-claim rate; continuity precision/missed-issue rate; stale artifact resolution time; correction/trust feedback.
- **Reliability/cost:** completion/failure by capability/provider; P50/P95 latency; retry/fallback rate; cost/task and cost/project; recovery success.

Each metric needs owner, definition, denominator, event source and reporting cadence. Establish pilot baselines, then approve capability-specific thresholds. A generic AI score must not be the sole release gate.

### 4.10 Notifications and proactive intelligence
Notify only for actionable, project-relevant events: assigned review/approval; AI task completion/failure requiring action; material conflict/stale dependency; relevant project/package status change; security/permission event requiring action.

Notifications are permission-aware, deduplicated, deep-linked and labeled informational vs action-required. Do not repeatedly notify unchanged states. Provide category preferences where feasible. No autonomous external communications or consequential project changes.

**Approval required:** channels (in-app/email), delivery schedule, quiet hours, escalation and retention.

### 4.11 Accessibility and responsive behaviour
Target WCAG 2.2 AA as a design/test goal, subject to formal validation. Require keyboard support, visible focus, accessible names, semantic headings, screen-reader announcements, adequate contrast, non-colour-only indicators, zoom/reflow and reduced-motion support. AI progress/errors must be accessible.

Desktop is primary authoring. Tablet supports review/moderate editing. Mobile supports project status, notifications, evidence inspection and approvals; full screenplay editing on mobile is not promised until designed and validated.

### 4.12 Future product horizons
- **V2 Visual Intelligence:** art direction, references, moodboards, character/location visual development and review.
- **V3 Generative Production:** generated scene/shot/media, asset versions and review.
- **V4 Localization & Adaptation:** language/market variants, adaptation, cultural review and approvals.
- **DVS Production Suite:** breakdown, casting, scheduling, budgeting, crew/vendors/assets/contracts and production tracking.
- **Business / management / MVV OS:** rights/IP, business affairs, costing/revenue, deliverables, dashboards/MIS and operational approvals.

All future domains reuse the same Project Intelligence Layer, entity identifiers, version lineage, authorization and audit principles. Each requires its own screen-level PRD, integrations, data contracts and acceptance tests.

## 5. Navigation and screen register

### Global shell
- **NAV-001 Home/Dashboard:** recent projects, assigned reviews, actionable task status.
- **NAV-002 Projects:** directory, filters, sorting, creation and access checks.
- **NAV-003 Review Queue:** decisions assigned to the user.
- **NAV-004 Notifications:** actionable events and deep links.
- **NAV-005 Search:** permission-aware project/entity/artifact search.
- **NAV-006 Profile/Settings:** personal preferences and security.
- **NAV-007 Administration:** members, role bundles, approved providers, integrations and operational status; role-gated.

### Project shell
- **PRJ-001 Project Overview:** status, activity, unresolved items and next actions.
- **PRJ-002 Universal Input:** idea, brief, instructions and supported attachments.
- **PRJ-003 Understanding Review:** interpreted intent, knowns, unknowns, assumptions, ambiguities and conflicts.
- **PRJ-004 Story Brain:** entities, relationships, timeline and context.
- **PRJ-005 Context/Decision History:** context snapshots, decisions and activity.
- **PRJ-006 Canon:** approved project truth and current version.
- **PRJ-007 Branches/Versions:** alternatives and version lineage.
- **PRJ-008 Dependency/Impact:** affected entities, artifacts and stale-state resolution.

### Research
- **RES-001 Research Workspace:** question, scope, plan and approved provider choice where enabled.
- **RES-002 Research Progress:** actual execution stage, partial results, failure/retry.
- **RES-003 Research Results:** findings, claim groups, sources and gaps.
- **RES-004 Evidence Detail:** provenance, exact excerpt, claim relationship and verification status.
- **RES-005 Conflict Review:** competing evidence and unresolved claims.
- **RES-006 Research History:** prior runs and source snapshots.

### Creative development
- **CRE-001 Creative Exploration:** brief and alternatives.
- **CRE-002 Branch Comparison:** trade-offs and selected direction.
- **CRE-003 Candidate Editor:** editable candidate and version history.
- **CRE-004 Character Directory/Workspace:** profile, motivations, arc and relationships.
- **CRE-005 Story World Workspace:** locations, culture, institutions, timeline and rules.
- **CRE-006 Format/Genre:** project format and genre.
- **CRE-007 Template Selection:** template preview and selection.
- **CRE-008 Story Workspace:** logline, synopsis, treatment, beats and outline according to template.
- **CRE-009 Screenplay Workspace:** scenes/sequences, draft and continuity context.
- **CRE-010 Dialogue Workspace:** dialogue candidates and character voice.
- **CRE-011 Story Doctor/Evaluation:** issues, rationale, recommendations and limits.

### Governance and delivery
- **GOV-001 Review Queue Item:** context, proposal, rationale and decision.
- **GOV-002 Canon Change Proposal:** before/after diff, impact and current version.
- **GOV-003 Approval Confirmation:** explicit protected-action confirmation.
- **GOV-004 Continuity Analysis:** scope, status, findings and coverage.
- **GOV-005 Impact Analysis:** dependencies and affected artifacts.
- **GOV-006 Activity/Audit Detail:** actor, timestamp, action, resource and outcome.
- **PKG-001 Package Builder:** template and artifact selection.
- **PKG-002 Readiness:** missing/invalid/stale items and links to resolve.
- **PKG-003 Package Preview:** assembled deliverable, versions and evidence links.
- **PKG-004 Package Approval/Export:** authorized approval, recorded version and export/share controls.

### Shared contextual interfaces
- **AI-001 Copilot Panel:** project context, prompt, result, sources, feedback and actions.
- **AI-002 Task Detail:** task status, steps, outputs, retry/recovery and appropriate run metadata.
- **SYS-001 Error/Recovery Panel:** what happened, what was preserved and safe retry/exit.
- **SYS-002 Access Restricted:** permission explanation and access request where available.
- **SYS-003 Stale State Resolution:** compare, refresh or rebase.

Future visual, media generation, localization, production, business and MVV OS screens remain FUTURE until approved. Do not count them as completed V1 scope.

## 6. Core end-to-end journeys

### A — Idea to project
1. Authenticate and enter an authorized workspace.
2. Create a project and enter an idea/brief or upload supported materials.
3. Show extraction/processing status.
4. Review interpreted intent, separating known facts, assumptions, unknowns, ambiguities and conflicts.
5. Correct, answer, research or defer unresolved questions.
6. Persist project state and open Project Overview.
7. Preserve input and resume safely if processing fails.

### B — Research to evidence
1. Enter a question and build/display a research plan.
2. Run permitted discovery and retrieval.
3. Extract claims with source identity, exact passage and provenance.
4. Validate source URLs and evidence records.
5. Show partial results and gaps when incomplete.
6. Route material conflicts to Conflict Review.
7. Preserve unresolved conflicts when evidence is insufficient.
8. Make findings available to creative workflows without automatically turning them into Canon.

### C — Creative direction to candidate
1. Start a task from the relevant project workspace.
2. Resolve context and show constraints.
3. Generate distinct alternatives and compare trade-offs.
4. Select a direction or revise the brief.
5. Generate an editable candidate and validate it.
6. Edit, regenerate, reject or submit for review.
7. Save candidate versions without mutating Canon.

### D — Canon update
1. Submit a candidate/change proposal.
2. Show current state, diff and downstream impact.
3. Check server-side permission and current Canon version.
4. If stale, compare/rebase and re-review.
5. Obtain explicit authorized confirmation.
6. Commit atomically and record audit event.
7. Recompute dependencies and mark affected artifacts stale.
8. On failure, preserve existing Canon and offer safe recovery.

### E — Continuity to package
1. Run continuity analysis against a defined scope.
2. Show analysis coverage and status.
3. Review issues and affected entities; resolve or defer.
4. Check package template requirements and artifact versions.
5. Surface missing evidence, conflicts, stale artifacts and pending approvals.
6. Assemble and preview the package.
7. Obtain authorized approval and persist the approved package version.

### F — Interrupted work
1. Persist draft inputs and task identifiers where supported.
2. On return, show running/completed/partial/failed status.
3. Reconcile unsaved changes against server state.
4. Avoid duplicate mutations on retry; use idempotency keys for protected operations.
5. Preserve the previous known-good artifact and show recovery status.

## 7. AI and orchestration contract

**Execution loop:** `UNDERSTAND → PLAN → GATHER CONTEXT → EXECUTE → OBSERVE → VALIDATE → COMPLETE / RETRY / RECOVER / ESCALATE`

- **AI:** intent interpretation, research discovery, synthesis, candidate generation, narrative reasoning, evaluation suggestions and impact hypotheses.
- **Deterministic services:** authorization, retrieval execution, schema validation, version checks, approval, persistence, audit, UI state and safety policy.
- **Human:** creative selection, consequential decisions, approval and Canon ownership.

Minimum run metadata: `run_id, project_id, user_id, task_type, intent, provider, model, prompt_version, context_snapshot_id, retrieved_item_ids, evidence_ids, tool_calls, output_ids, validation_status, latency, cost/tokens when available, failure_code, recovery_action, user_action, approval_event_id, canonical_mutation_id`.

Do not place the entire project in transient orchestration state. Persist project truth in the Project Intelligence Layer; orchestration state should carry identifiers, status, step, context snapshot reference, evidence/candidate IDs and task metadata.

User-visible states: Ready; interpreting; needs clarification; planning; retrieving; generating; validating; partial; completed; failed; blocked; requires approval; stale. Show meaningful progress without exposing hidden chain-of-thought.

## 8. Navigation, interaction and error rules

- Keep active project context visible across project screens.
- Use stable deep links to projects, entities, artifacts and review items.
- Preserve filters, selection and editor state where practical.
- Warn before discarding unsaved edits.
- Permission-denied screens must not reveal protected resource details.
- Clearly distinguish AI candidates, human edits, approved artifacts and Canon.
- Use a shared task-status contract across AI capabilities.
- Retries must not duplicate committed operations; protected writes require idempotency and version checks.
- Show success only after server confirmation.
- Label partial results and disclose continuity-analysis scope/coverage.
- Notifications must be actionable, permission-aware, deduplicated and deep-linked.
- Future modules remain unavailable until enabled.

## 9. Security, accessibility and operations

### Security
- Organization/project isolation across data, search, retrieval, cache, logs and exports.
- Least privilege and server-side action authorization.
- Provider secrets never exposed to clients.
- Encryption in transit and at rest.
- Approved data classes/provider allowlists.
- Audit logs for material access, decisions and mutations.
- Secure upload validation, malware scanning and isolated extraction.
- Legal/Security-approved retention, deletion and backup policy before production.

### Accessibility
- Target WCAG 2.2 AA, subject to formal verification.
- Keyboard support, visible focus, semantic headings and labels.
- Screen-reader announcements for progress, success and errors.
- Adequate contrast and status indicators not dependent on colour alone.
- Zoom/reflow and reduced-motion support.
- Desktop-first authoring; tablet review; mobile review/approval unless broader mobile authoring is validated.

### Operations
- Instrument task status, provider/model, latency, failures, retries, fallback and cost.
- Monitor provider health and integration errors.
- Define incident response, audit access and operational ownership.
- Provide user-safe errors and internal correlation IDs.
- Do not log secrets or unnecessary raw confidential content.

## 10. Measurement plan

Instrument and baseline before setting numeric targets.

| Metric family | Measures | Required definition |
|---|---|---|
| Time-to-value | Time to first usable candidate; time to approved package | Start/end events and exclusions |
| Throughput | Projects by stage; development hours/project | Stage definitions and reliable time data |
| Creative quality | Candidate acceptance/edit/rejection; revision cycles | Candidate/decision event schema |
| Research trust | Citation validity; provenance completeness; unsupported claims | Evidence validation test set |
| Continuity | Precision, missed issues, resolution time | Labeled evaluation set and scope |
| Human control | Approval time; correction rate; stale proposals | Decision/version events |
| Reliability | Completion/failure; P50/P95 latency; retries/fallback | Task telemetry |
| Economics | Cost/task and cost/project | Provider cost attribution |
| Trust | User confidence and usefulness | Short, non-leading feedback instrument |

Each metric needs an owner, numerator/denominator, event source, segmentation and reporting cadence. Release thresholds are capability-specific and calibrated against representative test sets and pilot data. A generic AI score must not be the sole release gate.

## 11. Acceptance checklist

A screen/workflow is implementation-ready when:
- [ ] Stable screen ID and traceable requirement IDs exist.
- [ ] Primary user, purpose, entry/exit and permissions are defined.
- [ ] Happy path, alternatives and recovery are specified.
- [ ] Loading, empty, partial, stale, blocked, validation and error states are covered where relevant.
- [ ] AI output is distinct from evidence, interpretation, human edits and Canon.
- [ ] Provenance/context are inspectable for material research/AI output.
- [ ] Protected mutations use server authorization, version checks and audit.
- [ ] Dependencies and API/data contracts are identified.
- [ ] Keyboard, screen-reader and responsive behaviour are documented.
- [ ] Tests cover success, denial, stale state, retry and persistence failure.
- [ ] No future feature is presented as live without approval and implementation.
- [ ] Open policy dependencies have an owner and launch gate.

## 12. Approval register

| ID | Decision | Working default | Owner / gate |
|---|---|---|---|
| DEC-01 | Release scope | V1 narrative workflow immediate; later horizons future | Product/Leadership |
| DEC-02 | Roles and Canon approver | Capability RBAC; configured Content Head/project approver; deny if absent | Content leadership + Security |
| DEC-03 | Research hierarchy | Tier 1 primary/official; Tier 2 scholarly/specialist; Tier 3 discovery only | Product + Knowledge Management |
| DEC-04 | Provider governance | Central gateway, allowlist, task-specific evaluation and metadata | AI Architect + Security |
| DEC-05 | External data handling | No provider training use unless explicitly approved | Legal/Security |
| DEC-06 | Retention/deletion | Follow existing approved policy; no unsupported deletion promise | Legal/Security |
| DEC-07 | Upload formats/limits | Configurable allowlist and limits; validate/scan/isolate | Engineering/Security |
| DEC-08 | Package readiness | Required sections, evidence, versions, analysis status and approvals | Content Head + Product |
| DEC-09 | Quality thresholds | Baseline first; calibrate per capability | Product + AI/QA |
| DEC-10 | Notifications | Actionable, deduplicated, permission-aware in-app baseline | Product |
| DEC-11 | Accessibility | Target WCAG 2.2 AA | Design + QA |
| DEC-12 | Future activation | Hide/disable until separately scoped and enabled | Product/Leadership |
| DEC-13 | Visual tokens | Provisional until brand review | Design/Brand |
| DEC-14 | Integrations | No assumed integration without confirmed API, access and owner | Engineering/Product |

These decisions are resolved as a recommended working baseline, not falsely represented as formal approvals. Legal/security/leadership items are launch gates. Safe defaults may be implemented behind configuration; unresolved policy must not be hard-coded into irreversible architecture.

## 13. Deliverable boundaries and next actions

This is the IA and cross-functional handover, not a replacement for detailed PRD acceptance criteria, screen-level visual designs, API schemas, ERD, provider-specific implementation, security threat model, retention policy, calibrated evaluation datasets or future-horizon PRDs.

**Handoff sequence**
1. Product and Content leadership review the approval register.
2. Security/Legal ratify data, provider, retention and upload policy before production use.
3. UX turns screen IDs into screen-by-screen wireframes and interaction specifications.
4. Engineering maps screen IDs to API/data contracts and service dependencies.
5. AI/QA defines evaluation sets for research, candidate generation, continuity and package readiness.
6. QA uses the journey flows and acceptance checklist for regression and recovery coverage.

**Definition of ready:** every V1 screen has a stable ID, documented journey, requirement link, permission model, applicable states, API/data dependency and testable acceptance criteria.
