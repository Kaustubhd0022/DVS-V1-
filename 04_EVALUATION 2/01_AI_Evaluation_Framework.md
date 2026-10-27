# 01 — AI Evaluation Framework

**Product:** Tattava Copilot · **Company:** Tattava Co. / Don Vanzara Showbiz LLP  
**Product boundary:** V1 — Narrative Intelligence  
**Status:** Proposed evaluation operating standard; no execution results are implied.  
**Version:** 1.0 · **Date:** 6 October 2026

## 1. Purpose and decision principle

This framework defines how Tattava evaluates AI behaviour before release and during operation. It is not a leaderboard for model intelligence. It measures whether the complete product helps a creator progress from accepted project input toward a Human-Approved Story Development Package while preserving project truth, provenance, creator control, security, and Canon integrity.

The North Star remains **time from accepted project input to a Human-Approved Story Development Package**. Time must be interpreted with quality and safety guardrails: faster output is not a win if the output is ungrounded, creatively misrepresents a decision, leaks another project's data, or requires extensive rework. The project is the primary context; a conversation is one interaction surface.

### Evaluation principles

1. **Product behaviour over isolated model eloquence.** Evaluate application logic, context assembly, retrieval, tool execution, orchestration, model output, validation, and human hand-off separately where feasible, then test them end to end.
2. **Unknown remains unknown.** The system must not convert absent, ambiguous, assumed, or conflicting information into asserted project fact.
3. **Canon safety is a hard invariant.** AI output is a candidate until reviewed and accepted through an authorized domain command. No quality score can compensate for unauthorized or silent Canon mutation.
4. **Evidence is inspectable.** Research claims should preserve source/evidence/claim lineage and accurately represent disagreement and uncertainty.
5. **Average scores cannot hide critical failures.** Report critical security, privacy, authorization, and Canon-integrity failures separately as release blockers.
6. **Reproducibility with uncertainty disclosed.** Pin or record model/provider, prompt, tool, retrieval, dataset, evaluator, and application versions; repeat stochastic cases when the decision warrants it.
7. **No false maturity claims.** Proposed tests, generated candidate examples, executed tests, expert-validated goldens, and production observations are different evidence classes.

## 2. Scope and source hierarchy

This package covers project intake and intent understanding; Story Brain / Project Intelligence; context resolution; clarification; research and provenance; narrative/character/format/story development; candidate review; branches and decision records; governed Canon; continuity/impact; Story Development Package readiness; run recovery; authorization, privacy, safety, latency, and cost telemetry.

Source precedence used for evaluation design: (1) current Product Strategy and consolidated updated PRD for product intent and requirements; (2) approved System Architecture and `02_AI_INTELLIGENCE` for runtime/guardrail contracts; (3) Experience specifications for user-visible behaviour; (4) Requirements Traceability for normalized verification relationships; (5) BRD and supporting discovery for business context. Where source identifiers differ, preserve the source ID and record the mapping as inferred until confirmed.

### Evidence labels

| Label | Meaning |
|---|---|
| Source-stated | Explicitly present in an available source. |
| Proposed | Recommended evaluation contract, dataset case, threshold, or operating procedure. |
| Candidate golden | Example drafted from requirements; not yet expert-validated as ground truth. |
| Human-validated golden | Reviewed by an accountable domain expert against evidence and rubric. No such status is assumed here. |
| Executed | Test harness produced a recorded result with version/run metadata. |
| Not run / unavailable | No execution evidence is available. |

## 3. Quality model

Evaluate a capability through five layers. **Layer A — invariants:** authorization, project isolation, Canon integrity, untrusted-input handling. **Layer B — deterministic application correctness:** schemas, state transitions, IDs, permissions, version checks, citations/links, retry and recovery. **Layer C — evidence and context:** retrieval relevance, completeness of required context, provenance, conflict preservation, memory isolation/freshness. **Layer D — AI task quality:** intent, narrative utility, groundedness, completeness, uncertainty calibration, instruction adherence, structured output. **Layer E — user and operational outcomes:** successful task completion, review/revision burden, latency, cost, reliability, and progress toward the Story Development Package.

| Dimension | Operational definition | Primary method | Unit / aggregation | Critical limitation | Traceability |
|---|---|---|---|---|---|
| Task success | Does the complete workflow achieve the requested safe outcome? | End-to-end assertion + expert rubric | pass / partial / fail by case and capability | Depends on task-specific success definition | FR-001–FR-024; North Star |
| Intent understanding | Correctly identifies goal, format, constraints, and unresolved choices | Reference labels + human rubric | 0–4 per dimension; report distribution | Intent may be legitimately underspecified | FR-001–FR-003 |
| Context utilisation | Uses relevant, authorized project state and avoids irrelevant/stale state | Context manifest assertions + ablation comparison | required-item recall, prohibited-item leakage count | More context is not always better | FR-004–FR-007; NFR-001/002/015 |
| Groundedness | Material factual claims are supported by supplied project facts or admissible evidence | Claim-level evidence review; citation checks | supported claims / material claims; conflicts separately | Citation presence does not prove entailment | FR-008–FR-011; NFR-006 |
| Research quality | Sources are traceable, relevant, dated, correctly characterized, and disagreements preserved | Source/evidence/claim audit + expert review | source validity and claim support rates | Web availability and source quality vary | FR-008–FR-011 |
| Narrative utility | Output respects brief, character motivation, causal logic, format and chosen creative direction | Domain-expert rubric, pairwise review | 0–4 dimensions; pairwise preference | Subjective; calibrate reviewers and retain dissent | FR-012–FR-015 |
| Canon integrity | AI cannot commit canonical state without authorized explicit approval and version-safe command | Deterministic negative tests + audit inspection | zero unauthorized mutations | Must not be averaged into quality score | FR-017–FR-020; NFR-003/019 |
| Structured-output validity | Output conforms to declared schema and domain constraints | JSON/schema/domain validator | valid / total | Valid structure can still be semantically wrong | FR-021–FR-024; API contracts |
| Retrieval quality | Retrieved items are relevant, permission-filtered and sufficient for task | Judged retrieval set; Recall@k / Precision@k where labels exist | per query and subgroup | Needs reviewed relevance labels | FR-005/008/009; NFR-001 |
| Tool correctness | Tool selected, authorized, parameterized and interpreted correctly | Tool trace assertions and fault injection | correct calls / required calls; unauthorized calls | Provider failure can be distinct from agent error | AI Tool Specs; NFR-002/013 |
| Memory fidelity | Persistent intelligence preserves approved facts, provenance, versions, and deletion semantics | State-transition and retrieval tests | exact invariant pass; stale/conflicting recall rate | “Memory” must not become a second source of truth | FR-004/018; NFR-015 |
| Uncertainty handling | Unknown, ambiguous, assumed and conflicting states remain explicit until resolved | State labels + expert rubric | state-preservation rate | Creative invention is allowed only when framed as a proposal | FR-002/003/010 |
| Safety and privacy | Resists injection, prevents cross-project leakage and blocks disallowed consequential actions | Adversarial tests, access tests, security review | critical failures; severity-weighted counts | Synthetic tests do not prove absence of all attacks | NFR-001/002/014/016 |
| Reliability and recovery | Failures are visible and recover without corrupting project state | Fault injection, retry/cancel/resume tests | recovery pass rate; data-loss incidents | Requires realistic infrastructure | NFR-004/005/008/013 |
| Latency and cost | User-visible duration and attributable model/tool cost per task | Traces and provider telemetry | p50/p95; cost/run and cost/project | Provider accounting may be incomplete | NFR-007/009 |
| User experience | Users understand state, evidence, candidate status, approvals, impact and next action | Moderated usability, task completion, qualitative review | completion, time, errors, confidence | Small samples are directional, not population estimates | UX-001–UX-012 |

### Scoring rubric for graded AI behaviour

Use a 0–4 anchored rubric per relevant dimension: **0 Critical failure** (violates an invariant, materially fabricates fact, or fails the task); **1 Poor** (major omissions or unsupported conclusions; unusable without substantial correction); **2 Partial** (useful core with material gaps requiring revision); **3 Good** (meets expected behaviour with minor omissions); **4 Excellent** (complete, appropriately calibrated, traceable, and ready for the intended review stage). A rubric score never overrides deterministic blockers. Reviewers must cite the output span/evidence supporting a score and may mark **Not applicable** with rationale.

For creative quality, use anchored dimensions rather than exact text matching: brief adherence, causal coherence, character consistency, originality within constraints, format suitability, and editability. A reference answer should describe required properties and protected facts, not prescribe a single creative phrasing.

## 4. Evaluation architecture and lifecycle

```mermaid
flowchart TD
  R[Requirements and risk register] --> D[Versioned candidate/golden dataset]
  D --> H[Test harness and pinned environment]
  H --> X[Application + context + retrieval + tools + model execution]
  X --> A[Deterministic assertions]
  X --> J[Task-specific / model-assisted judges]
  A --> G[Human review and adjudication]
  J --> G
  G --> M[Metrics, error clusters, confidence and coverage]
  M --> Q{Release gates satisfied?}
  Q -- No --> F[Block or limit rollout; remediation]
  F --> H
  Q -- Yes --> L[Approved release candidate]
  L --> O[Production telemetry and user feedback]
  O --> T[Privacy-reviewed, de-identified candidate cases]
  T --> D
```

The harness must capture run ID, test ID, dataset version, application build, model/provider identifier, prompt/config version, retrieval/index version, tool versions, relevant context manifest hash, evaluator version, timestamps, status, raw output reference under access control, metric values, and adjudication. Do not place secrets or unnecessary personal/project content in logs. Where content retention is not approved, store references/hashes and minimum necessary metadata.

Separate the result streams: deterministic assertions (machine pass/fail), task rubric scores (human or validated judge), operational measurements, and product outcome metrics. A release report may summarize them together, but must not collapse them into one opaque composite score.

## 5. Evaluator selection and calibration

- **Deterministic checks first** for permission decisions, Canon writes, schema validity, version conflicts, required fields, run-state transitions, citation format, and project isolation.
- **Reference-based comparison** when the correct factual result is stable and evidence exists. Use semantic constraints for creative tasks.
- **Programmatic task rules** for required/forbidden concepts, source presence, explicit uncertainty markers, and impact lists.
- **Model-based evaluator** only for dimensions where automated semantic judgement is useful. It must use a versioned rubric, be tested against human-labelled examples, and report disagreement. It cannot approve releases or overrule critical invariants.
- **Human domain review** for narrative quality, research interpretation, creative usefulness, and ambiguous reference cases. Use at least two independent reviewers for calibration samples and disagreements; adjudicate material conflicts with a named accountable reviewer, not by averaging away disagreement.
- **Pairwise comparison** for prompt/model variants when outputs cannot be judged by a single absolute reference. Randomize order and blind the model identity where practical.

Calibration procedure: prepare a small expert-reviewed anchor set; train reviewers on the rubric; independently score the same examples; inspect per-dimension agreement and disagreement patterns; clarify ambiguous rubric language; re-score affected examples; version the rubric and annotation. Use Cohen's kappa only for suitable categorical labels, weighted kappa for ordinal scores, or an appropriate agreement statistic for the design. Report sample size and uncertainty; do not present a statistic without assumptions and denominator.

## 6. Initial release gates — proposed defaults requiring owner approval

These are conservative proposed gates to make the process operational, not measured baselines or source-approved thresholds.

| Gate | Proposed default | Rationale | Approval / exception |
|---|---|---|---|
| Critical safety/security | 0 known critical failures in the release candidate on required suite | Averages cannot offset cross-project leakage, unauthorized actions or silent Canon mutation | Security + Engineering + Product; no silent waiver |
| Core deterministic contract | 100% pass for required schema, auth, isolation, version, audit and state-transition assertions | These are invariants, not probabilistic quality preferences | Engineering / QA |
| Required critical-path cases | 100% pass or explicitly documented blocker with release held | A failed critical path means core value cannot be trusted | Product + QA |
| Candidate AI quality | Initial target: median ≥3/4 on each applicable core rubric dimension, with no 0 on a high-severity case | Gives a reviewable baseline without hiding outliers | Product + Content/Creative domain reviewers; calibrate after pilot |
| Grounded material claims | Initial target ≥95% supported on reviewed factual/research cases; any fabricated high-impact fact blocks | Candidate threshold; requires adjudicated claims and denominator | Research/content owner + Product |
| Structured outputs | 100% schema validity after bounded repair on required output contracts; failures remain visible | Contract consumers need predictable structure | Engineering / QA |
| Cost and latency | Establish baseline by workflow first; set numeric budget only after representative run data and provider pricing are available | No defensible source-based numeric SLO currently established | Engineering / Finance/Product |
| Evaluation coverage | All P0/core workflows have at least one normal, one negative/edge, and one recovery test before release | Prevents feature-level green status with obvious gaps | QA + Product |

If the team elects to run a limited internal pilot before full thresholds are approved, it must be explicitly labelled a learning pilot, constrained to approved data and users, with hard invariants enforced. “Pilot” does not waive privacy, authorization, or Canon safety.

## 7. Statistical and reporting method

Report numerator and denominator for every rate. Use case-level paired comparisons when testing a new model/prompt against a baseline. Repeat stochastic high-impact cases; choose the number of repeats based on variability and decision risk, not a universal arbitrary count. For binary proportions, include Wilson confidence intervals when sample size supports interpretation; for paired scores, use paired bootstrap intervals or an appropriate paired test. Report effect size and sample size, not p-values alone. Treat repeated runs of the same case as correlated observations; do not count them as independent golden cases.

Stratify by capability, risk, scenario, language, context complexity, and source/evidence status where sample size permits. Report critical subgroup failures separately. Missing results are not passes; timeouts and evaluator failures remain visible and are categorized separately. Exclusions require reason, owner and versioned rule.

## 8. Error taxonomy and triage

| Code | Failure class | Examples | Default severity |
|---|---|---|---|
| E-FACT | Unsupported or contradicted claim | Research claim with no evidence; assumed fact presented as known | High; critical if consequential |
| E-CANON | Unauthorized or silent canonical mutation | AI writes approved state without human action | Critical |
| E-AUTH | Authorization or isolation failure | Cross-project context exposed; unauthorized tool invoked | Critical |
| E-CTX | Context resolution failure | Stale branch treated as main Canon; material context omitted | High |
| E-RETR | Retrieval failure | Relevant evidence missed or unauthorized evidence returned | High / critical for leakage |
| E-TOOL | Tool selection/execution failure | Wrong tool, malformed arguments, unhandled quota failure | Medium–high |
| E-STRUCT | Schema/domain validation failure | Invalid package, malformed structured output | Medium–high |
| E-UNC | Uncertainty-state failure | Unknown becomes a factual assertion | High |
| E-NARR | Narrative quality failure | Character contradiction, broken causality, brief mismatch | Medium–high by impact |
| E-REC | Recovery/state integrity failure | Retry duplicates mutation or loses candidate | High / critical if data corruption |
| E-OBS | Observability gap | No run status or failure reason | Medium; high if blocks incident response |
| E-COST | Cost/latency anomaly | Unbounded loops, unexpected spend, stalled run | Medium–high |
| E-EVAL | Evaluation validity issue | Broken judge, leakage, mislabeled golden | High for release confidence |

Every high/critical failure receives a reproducible case, root-cause hypothesis, owner, containment, fix, and regression addition. Root cause should distinguish product bug, context/retrieval, prompt/model, tool/provider, evaluator/data, user-expectation mismatch, and operational incident.

## 9. Governance and operating cadence

Proposed cadence: run fast deterministic smoke checks on every relevant change; run capability regression for prompt, model, retrieval, tool, or context changes; run the full risk-weighted suite before release; run periodic production-quality review once telemetry is available; add privacy-reviewed, adjudicated failures to the candidate dataset after de-identification and approval. Do not silently convert production content into training/evaluation data.

Owners by function: Product owns outcome definitions and prioritization; AI/ML owns evaluator design and model/prompt comparisons; QA owns harness integrity and test execution evidence; Engineering owns application contracts and operational telemetry; Security/Privacy owns security and data-handling review; Research/Content/Creative domain reviewers validate evidence and narrative rubrics. Named individuals and formal approval authority remain to be assigned by the organization.

## 10. Traceability and known gaps

| Requirement / source | Evaluation coverage in this package | Status |
|---|---|---|
| FR-001–FR-003: entry, understanding, clarification | GDS-001–003; EV-001–003; REG-01 | Proposed |
| FR-004–FR-007: Story Brain, context, next action | GDS-004–006; EV-004–006; REG-02 | Proposed |
| FR-008–FR-011: research, provenance, conflict | GDS-007–009; EV-007–009; REG-03 | Proposed |
| FR-012–FR-015: narrative/character/format/story | GDS-010–012; EV-010–012; REG-04 | Proposed |
| FR-016–FR-020: branches, decisions, Canon, approvals | GDS-013–016; EV-013–016; REG-05 | Proposed; hard invariants |
| FR-021–FR-024: continuity, package, audit/run status (mapping to consolidated PRD requires ID check) | GDS-017–020; EV-017–020; REG-06 | Proposed; verify source ID alignment |
| NFR-001/002/014/016: isolation, authorization, privacy, injection | GDS-021–023; EV-021–023; REG-07 | Proposed; mandatory blockers |
| NFR-003–006/013/015: integrity, recovery, traceability, observability, version lineage | GDS-024–026; EV-024–026; REG-08 | Proposed |
| NFR-007–009: performance, scale, cost telemetry | GDS-027–028; EV-027–028; REG-09 | Proposed; numeric budgets open |
| UX-001–UX-012: experience contracts | EV-029–030 and usability plan | Partial proposed coverage |

The initial dataset and case library are candidate artifacts drafted from requirements, not validated ground truth. The source set does not establish executed runs, production data, calibrated judges, signed thresholds, or a prior valid baseline. These are deliberately not represented as results.

## 11. Open decisions resolved by recommended defaults

| Open question | Recommended default for implementation now | Why / boundary |
|---|---|---|
| How to score quality? | Separate invariant gates, deterministic checks, graded rubrics and operational outcomes; no single opaque score | Prevents safety and factuality being averaged away |
| How to treat unknown facts? | Require explicit uncertainty state; score a fabricated assertion as failure | Directly follows product principle |
| Can an LLM judge its own output? | Use model judges only as calibrated secondary evaluators; human-reviewed anchors and adjudication required | Reduces judge bias and circular validation |
| What initial gates? | Apply conservative proposed gates in §6; owner approval required before release policy becomes binding | Operationalizes quality without misrepresenting approval |
| How to manage absent test results? | Status = Not Run; report results as unavailable; no pass-rate denominator until run evidence exists | Prevents fabricated evidence |
| How to handle privacy-sensitive examples? | Synthetic/minimized examples by default; approved de-identification and access controls for real cases | Avoids accidental production-data reuse |
| How to set latency/cost targets? | Instrument first, baseline representative workflows, then approve budgets | Current source evidence lacks defensible numerical targets |
| How to expand the golden set? | Candidate → expert review → adjudication → versioned golden; record provenance and changes | Maintains dataset trust |

## 12. References

- Updated Product Strategy and consolidated `Product_Requirements_Document.md` (29-section baseline).
- `02_AI_INTELLIGENCE_REFINED/` capability, agent, prompt, context, memory, tools, guardrails, and human-in-the-loop specifications.
- `01_EXPERIENCE_FINAL/` user flows, UX specification, AI interaction specification, and design system.
- `03_TECHNICAL/` System Architecture, Data Architecture, API Specification, Integration Specification, and Infrastructure.
- `Requirements_Traceability/Requirements_Traceability.md`.
- BRD and Product Scope materials. Exact section/page mappings should be normalized in the controlled source register before formal audit use.
