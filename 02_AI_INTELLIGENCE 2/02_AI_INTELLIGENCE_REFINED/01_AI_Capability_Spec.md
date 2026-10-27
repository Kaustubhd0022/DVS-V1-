# TATTAVA COPILOT — AI Capability Specification
**Document ID:** TAT-AI-CAP-001 · **Baseline:** V1 — Narrative Intelligence · **Status:** Final operating specification with explicitly provisional policy controls

## 1. Purpose and product contract
Tattava Copilot is a project-centric Narrative Intelligence system. The project—not the conversation—is the durable unit of intelligence. The AI runtime helps the creative team understand project state, discover evidence, explore story directions, prepare candidate artifacts, diagnose continuity and assemble a Story Development Package. It does not own creative authority.

The core loop is: **accepted input → intent → project state → context → action → candidate → human decision → Canon → impact → next best action**.

### Non-negotiable invariants
- Canon is typed, structured, versioned and stored outside model memory, vector indexes and agent scratchpads.
- Evidence, interpretation, candidate content, creative decision and Canon are distinct objects/states.
- Unknown remains unknown until supplied, appropriately researched/verified, or explicitly accepted as a creative choice by an authorized person.
- AI output is never Canon by itself. Every consequential write is permission-checked, version-checked and audited.
- A failed, cancelled or stale AI run leaves authoritative project state unchanged.
- Optimize for project progress and a Human-Approved Story Development Package, not prompts, tokens, agent count or generated words.

## 2. Source authority and decision handling
Use the latest Product Strategy and updated PRD as the operating baseline; use the BRD for business intent and scope history; use the approved System Architecture for component boundaries; use the Product Scope Decision Resolution Addendum for implementation defaults; use Experience and Requirements Traceability for interaction and test alignment. Where documents differ, prefer the newest approved strategy/PRD for product intent and the architecture baseline for technical boundaries. Record any remaining contradiction in the decision register rather than silently merging it.

Status labels used here:
- **Adopted V1 default:** supported by the product baseline and safe to implement.
- **Provisional control:** conservative implementation can proceed, but Security/Legal/leadership must approve the policy before external commitment.
- **Evidence required:** measure in pilot; do not invent thresholds or market facts.
- **Engineering validation:** contract is defined conceptually; concrete API/vendor/schema requires implementation review.

## 3. Capability landscape

| ID | Capability | Trigger and inputs | Output / state | Authority boundary | Primary validation |
|---|---|---|---|---|---|
| AIC-001 | Input and intent understanding | Free-form creator input, uploaded files, selected task | Parsed intent, project type/format hypothesis, missing information, confidence/qualification | May classify and suggest; user confirms material interpretation | Intent match, correction rate, unsupported inference tests |
| AIC-002 | Project-state classification | New input or project change + authorized project state | Known / Unknown / Ambiguous / Assumed / Conflicting / Blocked / Resolved items | Never silently convert Unknown/Assumed into Known | Seeded state-label tests and provenance checks |
| AIC-003 | Adaptive clarification | Material ambiguity, missing required fields, conflicting instructions | Prioritized questions with rationale and defer/answer options | Ask only questions that change the next action; permit deferral when safe | Question usefulness, unnecessary-question rate |
| AIC-004 | Context resolution | Capability request + authorized project context | Task-specific context manifest with provenance and excluded-context reasons | Retrieval is permission-filtered; Canon remains authoritative | Context precision, leakage tests, stale-context tests |
| AIC-005 | Next-best-action recommendation | Project state, intent, unresolved questions, impact and evidence gaps | Ranked actions such as ask, research, explore, generate, validate, review | Recommendation only; user can accept/edit/dismiss/defer | Progress-to-next-milestone and action acceptance |
| AIC-006 | Research planning and discovery | Factual unknown, research request, claim to verify | Search plan, source candidates and source cards | Tool/provider availability is deployment-dependent; no invented sources | Source relevance, source availability, attribution |
| AIC-007 | Evidence extraction and claim mapping | Retrieved/uploaded sources | Extracted evidence linked to source, claim, date, qualification, rights metadata where known | LLM text alone is not evidence; extraction may be uncertain | Claim support and extraction fidelity |
| AIC-008 | Research synthesis and conflict surfacing | Evidence set, claims, project question | Findings, corroboration, disagreement, gaps, confidence rationale | Do not flatten cultural/historical disagreement into false certainty | Evidence traceability and conflict recall |
| AIC-009 | Character and story-world intelligence | Approved or candidate story entities and relationships | Structured character/world candidates, relationships, constraints | Candidate until reviewed; no silent Canon changes | Schema validity, relationship consistency |
| AIC-010 | Narrative exploration and reasoning | Creative brief, Canon, constraints, selected branch | Alternative story directions, beats, outlines, rationale and trade-offs | Alternatives isolated from active Canon | Constraint adherence and creative review |
| AIC-011 | Format, genre and template guidance | Project intent, format, maturity, user selection | Recommended format/genre/template and rationale | Recommendation can be overridden; no assumed industry rules | Relevance and reviewer acceptance |
| AIC-012 | Story development and drafting | Explicit creative task + relevant context | Candidate synopsis, premise, treatment, outline, episode/scene content as in V1 scope | Generated content is not approved by default | Human quality review, Canon adherence |
| AIC-013 | Screenplay and dialogue assistance | Selected story state, format, scene/character context | Candidate screenplay/dialogue with source/version context | Must respect approved character/story constraints; candidate only | Continuity and editorial acceptance |
| AIC-014 | Continuity and dependency diagnosis | Candidate or proposed Canon change | Conflict list, dependency graph updates, impact preview | Diagnosis can flag; cannot resolve creative trade-offs unilaterally | Seeded conflict recall, false-positive review |
| AIC-015 | Candidate comparison and decision support | Multiple candidates/branches, criteria, Canon snapshot | Side-by-side differences, pros/cons, affected entities | Does not choose or approve for authorized humans | Difference accuracy, decision usefulness |
| AIC-016 | Story Development Package assembly | Package request + governed project state | Versioned, format-adaptive package with readiness and unresolved issues | Package generation is not greenlight; approval is separate | Completeness, provenance, version consistency |
| AIC-017 | Run transparency and recovery | Any material AI workflow | Status, steps, sources, failures, retry/resume/cancel options | Do not report success before durable state confirms it | Run-state accuracy, recovery integrity |
| AIC-018 | Evaluation and observability | Material AI run, release candidate, feedback | Run telemetry, evaluation records, regression findings | Feedback does not automatically train models or change Canon | Audit completeness and benchmark results |

## 4. Shared capability contract
Each AI operation must declare: capability ID; actor and project; requested outcome; input references; project version snapshot; permitted autonomy tier; required context classes; allowed tools; output schema; validation policy; budget/time limits; human checkpoint; terminal states; and telemetry fields. Missing required authorization, project scope, or output contract is a deterministic rejection—not a prompt-level suggestion.

### State vocabulary
- **Epistemic:** Known, Unknown, Ambiguous, Assumed, Conflicting, Blocked, Resolved.
- **Content lifecycle:** Working, Candidate, Reviewed, Approved, Canonical, Deprecated, Locked, Derived.
- **Evidence:** Discovered, Retrieved, Extracted, Corroborated, Conflicted, Human-verified, Rejected.
- **AI run:** Queued, Running, Awaiting input, Awaiting approval, Succeeded, Partially succeeded, Failed, Cancelled.
- **Decision:** Open, Options prepared, Awaiting decision, Accepted, Rejected, Deferred, Superseded.

These state families are not interchangeable. A factual claim can be evidence-backed while the related creative content remains a Candidate. A decision can be Accepted while a separate authorization step is still pending.

## 5. Capability routing and autonomy
The Model Gateway is provider-agnostic. Route by task quality, grounding, structured-output reliability, context needs, multimodal need, privacy policy, availability, latency and cost. Use the smallest/fastest model that passes the task’s evaluated quality gate; escalate when complexity or uncertainty requires it. Specialized models are adopted only when evaluation demonstrates material value.

| Tier | Permitted behaviour | V1 default |
|---|---|---|
| A0 Explain | Explain state and authorized context | Allowed with provenance/uncertainty |
| A1 Recommend | Suggest next actions, options, risks | Allowed; user retains choice |
| A2 Prepare | Research, draft, compare, diagnose, prepare candidate changes | Allowed within policy; output remains non-canonical |
| A3 Reversible execution | Index, format, non-canonical bounded work | Only explicitly allowlisted, logged and budgeted |
| A4 Consequential action | Canon mutation, approval, branch merge, greenlight | Never autonomous in V1; authorized human + deterministic gate required |

## 6. Failure and fallback contract
- **Missing context:** ask, retrieve, qualify, or stop; never fill a material gap with invented fact.
- **Conflicting evidence:** preserve competing claims and source provenance; explain the disagreement.
- **Provider/tool failure:** mark Failed or Partially succeeded, expose completed steps, preserve outputs only as clearly labelled candidates, and offer safe retry/resume.
- **Schema failure:** validate; permit bounded repair attempt; if still invalid, fail visibly rather than coercing into authoritative state.
- **Stale project snapshot:** do not write; show stale-version conflict and compare/refresh path.
- **Authorization failure:** deny server-side, audit the attempt, do not expose restricted data.
- **Evaluation failure:** block promotion or mark output as needing review according to risk policy.
- **Cancellation:** stop future side effects where possible; preserve audit; do not mutate Canon.

## 7. AI evaluation and acceptance
Use versioned golden and adversarial datasets with seeded Unknowns, contradictions, permissions, source conflicts, branch isolation, stale versions and provider failures. Separate deterministic assertions from probabilistic quality ratings. Creative review should include qualified reviewers and capture rubric/version, not just a thumbs-up.

Hard release gates: cross-project isolation; server-side authorization; Canon integrity; auditability of consequential changes; no silent Canon mutation; data-loss/recovery tests. Quality, latency, cost and availability thresholds remain evidence-dependent until pilot baselines are measured.

### North Star and supporting measures
North Star: **time from accepted project input to a Human-Approved Story Development Package**. Supporting dimensions include development time, rework/revision cycles, research effort, reviewer workload, project throughput, grounding, evidence attribution, Canon adherence, continuity/impact quality, adoption by role, successful workflow cost and failure recovery. Establish baselines before setting numerical targets.

## 8. Cross-functional ownership
Product owns capability intent and acceptance; Creative leadership owns creative rubric and approval policy; AI/ML owns model/prompt/evaluation design; Engineering owns deterministic state, authorization, runtime contracts and recovery; Research/Knowledge Management owns source-quality and rights metadata; Security/Legal owns provider/data policy and retention; QA owns deterministic and probabilistic test execution; Operations owns run monitoring and incident response.

## 9. Remaining decisions
The specification resolves product-operating defaults. The following cannot responsibly be auto-approved: exact provider/vendor and contractual data terms; retention/deletion/residency; named approvers and separation-of-duties; exact file limits and OCR availability; production SLO/RTO/RPO and cost budgets; numeric quality thresholds; external ICP/pricing/willingness-to-pay. Build configuration points and instrumentation now; obtain the accountable sign-off or pilot evidence before making external commitments.

## 15. Refinement — capability contracts and measurable acceptance

### 15.1 Shared capability envelope
Every AI capability invocation MUST carry: `tenant_id`, `project_id`, `actor_id`, `action_id`, `run_id`, `capability_id`, `input_refs[]`, `expected_project_version`, `policy_version`, `prompt_version`, `model_route_policy_id`, `deadline`, `budget`, and `correlation_id`. The server derives identity and permissions; clients cannot self-assert them. Persist the request envelope and a redacted execution trace under the approved retention policy.

### 15.2 Shared result envelope
Every result MUST include: `status`, `candidate_refs[]`, `evidence_refs[]`, `state_items[]`, `assumptions[]`, `unknowns[]`, `conflicts[]`, `warnings[]`, `recommended_next_actions[]`, `validation_results[]`, `source_project_version`, `proposed_changes[]`, and `requires_human_review`. Omit fields only where schema permits; use explicit empty arrays rather than ambiguous nulls. A result is not successful merely because a provider returned text.

### 15.3 Capability completion criteria
A capability is complete only when: input scope is authorized; context is versioned; output validates against a versioned schema; provenance is retained for factual claims; unsupported claims are qualified or withheld; proposed mutations remain candidates; errors are actionable; run and cost telemetry are recorded; and relevant evaluation cases pass. Numerical quality thresholds are a measured release decision, not invented defaults.

### 15.4 Failure taxonomy
- `INPUT_INVALID`: request cannot be interpreted or violates schema.
- `AUTH_DENIED`: access is denied before retrieval/tool execution.
- `CONTEXT_INSUFFICIENT`: safe execution needs clarification or evidence.
- `POLICY_BLOCKED`: requested action/provider/tool is disallowed.
- `PROVIDER_UNAVAILABLE`: route cannot execute; preserve state and offer safe retry/fallback only if policy allows.
- `OUTPUT_INVALID`: model output fails schema or safety checks; repair within bounded attempts, then fail safely.
- `VERSION_STALE`: source project version changed; re-resolve context and re-evaluate before any commit.
- `BUDGET_EXCEEDED`: stop before additional work and return partial state with explicit limitations.
- `CANCELLED`: stop cancellable work and prevent later background commits.
- `PARTIAL_SUCCESS`: clearly enumerate completed and incomplete sub-tasks.

### 15.5 Capability acceptance template
For each capability, QA must test: normal path; missing information; ambiguous request; conflicting evidence; stale context; unauthorized reference; prompt injection; timeout; malformed model output; budget exhaustion; cancellation; retry/idempotency; concurrent project update; accessibility of disclosure and recovery; and traceability from output to requirement and evaluation case.
