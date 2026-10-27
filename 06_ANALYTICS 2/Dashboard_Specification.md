# Tattava Copilot — Dashboard Specification & Serving Data Contracts

**Document ID:** ANA-DSH-001  
**Version:** 1.0  
**Status:** Proposed dashboard contract; implementation and SLAs not yet evidenced  
**Scope:** Product outcome analytics, workflow funnel, AI observability, quality/evaluation, data quality and restricted security monitoring

## 1. Purpose and guardrails

Dashboards should support decisions about project progress, development speed, quality, reuse, AI reliability and data integrity. They must not encourage optimization for generation volume, token consumption, agent count or prompt count. Show speed and quality together, expose denominators and missingness, and keep critical safety events as non-compensatory gates.

Tattava's V1 operational outcome is a **Human-Approved Story Development Package**. It is not a claim of readiness for physical production. The North Star is time from accepted project input to an approved package version meeting agreed completeness criteria.

## 2. Dashboard catalogue

| ID | Dashboard | Audience | Main decisions | Refresh (proposed) | Access |
|---|---|---|---|---|---|
| DSH-001 | Product Outcome & North Star | Product, leadership, approved project portfolio stakeholders | Is time-to-approved-package improving without quality degradation? | Daily aggregate; cohort windows selectable | Organization-scoped aggregate; project drilldown permissioned |
| DSH-002 | Project Workflow Funnel | Product, Content Head, Creative Director, Producer according to grants | Where do projects stall or repeat work? | Daily; operational stages may be fresher | Project scope and action-level authorization |
| DSH-003 | AI Run Health | AI/Engineering | Are runs completing, recovering, and meeting operational expectations? | Proposed 5–15 min | Engineering operational role; no raw content |
| DSH-004 | AI Quality & Evaluation | AI, QA, Creative/Content reviewers | Did a model/prompt/retrieval change regress groundedness, continuity or creative usefulness? | Per evaluation run; production aggregates daily | Role-based; restricted output refs |
| DSH-005 | Cost & Unit Economics | Engineering, Finance, Product leadership | What does a run/project/approved package cost and how complete is attribution? | Daily provisional; monthly reviewed | Finance and authorized product/engineering |
| DSH-006 | Data Quality & Pipeline Reliability | Data Engineering, platform owner | Are events fresh, valid, complete and reproducible? | Operational near-real-time where supported | Data/platform operations |
| DSH-007 | Security & Privacy Signals | Security/Privacy, authorized incident responders | Are isolation, authorization, logging and deletion controls functioning? | As close to real-time as architecture permits | Highly restricted; no broad product access |
| DSH-008 | Research, Evidence & Continuity | Knowledge Management, Creative/Content | Is evidence traceable and are continuity findings reviewed and resolved? | Daily or per evaluation batch | Project-level scope; content references require permission |

All refresh frequencies are proposals, not achieved SLAs. Numeric targets and alert thresholds require baseline and approval.

## 3. DSH-001 — Product Outcome & North Star

### Questions
- What is the distribution of time from accepted input to first approved package?
- Is the trend different by project type, maturity, complexity or workflow version?
- Are speed changes accompanied by changes in rejection, substantive revision, completeness, evidence traceability or continuity defects?
- How many eligible projects are still incomplete, cancelled or missing milestones?

### Required models
`fact_project_milestone`, `fact_package_section`, `fact_candidate_decision`, `fact_review_decision`, `fact_continuity_check`, `fact_claim_evaluation`, `dim_project`, `dim_package_template`, `dim_workflow_version`.

### Filters and windows
Date cohort (accepted-input date and approval date separately), project type, maturity/complexity tags if approved, workflow version, environment, organization scope. Default chart uses approval cohort and shows start cohort counts; provide a separate start-cohort view to avoid survivorship bias.

### Layout wireframe

```text
[Date range] [Project type] [Workflow version] [Organization scope]
[Median time-to-approved package] [p75] [Completed n] [Incomplete n]
[Trend by cohort + sample size]
[Speed vs quality: completeness | acceptance | revision | continuity defects]
[Stage funnel: accepted → candidate → reviewed → complete → approved]
[Incomplete / excluded / data-quality warning panel]
```

### Acceptance criteria
- Primary metric uses authoritative server timestamps and versioned approval/completeness contract.
- Median and percentiles display sample size, cohort definition and freshness.
- Incomplete/cancelled projects are visible; no successful-only chart is the only view.
- Quality companion metrics and their denominators are visible next to speed.
- No numeric target shown as achieved unless approved and supported by measured data.

## 4. DSH-002 — Project Workflow Funnel

### Questions
- Which workflow states have the longest elapsed time?
- Are projects waiting for context, research, candidate review, approval or missing inputs?
- What proportion of candidates are accepted, rejected, deferred or revised?
- Are users repeatedly reconstructing context or revisiting previously decided questions?

### Required models
`fact_workflow_milestone`, `fact_ai_run`, `fact_candidate_decision`, `fact_review_decision`, `bridge_context_manifest_item`, `fact_artifact_revision`, `dim_project`.

### Layout

```text
[Project type] [Workflow] [Status] [Time window]
[Active projects] [Projects with blocked state] [Median stage duration]
[Stage distribution / aging buckets]
[Candidate decisions: accepted | rejected | deferred | pending]
[Rework reasons / repeated research / missing context]
[Project-level drilldown subject to authorization]
```

Aging thresholds are TBD. Pending review is not rejection; absence of a decision is not acceptance. Do not rank individual writers or reviewers without approved purpose, context and privacy review.

## 5. DSH-003 — AI Run Health

### Questions
- What are run success, partial success, failure, cancellation and policy-block rates?
- Where are p50/p95 latencies, retries, queue age and provider errors increasing?
- Are fallback routes used and are all routes approved?
- Are required correlation IDs missing?

### Required models
`fact_ai_run`, `fact_ai_attempt`, `fact_model_call`, `fact_retrieval_operation`, `fact_tool_invocation`, `fact_pipeline_run`, `dim_model_version`, `dim_capability_version`.

### Layout

```text
[Environment] [Capability] [Model/provider alias] [Version]
[Run success] [p95 latency] [Retry rate] [Cost attribution coverage]
[Run outcomes over time] [Latency distribution]
[Errors by class] [Queue age / backlog] [Fallbacks]
[Missing correlation IDs / unapproved route signal]
```

No raw prompt, response or retrieved content. Provider/model dimensions should use approved aliases and avoid exposing secrets or contract-restricted details.

## 6. DSH-004 — AI Quality & Evaluation

### Questions
- Did a build/model/prompt/retrieval/tool change regress the approved evaluation suite?
- How do groundedness, context sufficiency, instruction adherence, schema validity and creative usefulness compare?
- How many cases were run, skipped, failed, adjudicated or disagreed upon?
- Are any critical safety or Canon-integrity cases failing?

### Required models
`fact_evaluation_result`, `dim_evaluation_case`, `dim_dataset_version`, `dim_evaluator_version`, `dim_model_version`, `dim_prompt_version`, `dim_build_version`.

### Layout

```text
[Dataset version] [Build] [Model] [Prompt] [Retrieval/index] [Evaluator]
[Critical gates: pass/fail/not run] [Cases run / total] [Human adjudication coverage]
[Quality by dimension with confidence/uncertainty]
[Version comparison on matched cases]
[Failed cases by severity and failure taxonomy]
```

Do not collapse all quality dimensions into a single score if it can hide a safety failure. Unrun cases are not passes. Regression comparison requires same dataset and comparable configuration, or a clear note describing differences.

## 7. DSH-005 — Cost & Unit Economics

### Questions
- What are attributable model/tool costs per run, project and successful approved package?
- What proportion of costs are actual, estimated or unavailable?
- Which workflows have the largest cost variance, retries or failed-run spend?

### Required models
`fact_ai_cost`, `fact_model_call`, `fact_tool_invocation`, `fact_ai_run`, `fact_project_milestone`, `dim_pricing_version`.

### Layout

```text
[Period] [Currency] [Workflow] [Model/provider alias]
[Total attributable cost] [Cost/run] [Cost/successful task] [Cost/approved package]
[Actual vs estimated vs unavailable]
[Cost by workflow and component] [Retry/failed-run spend]
[Attribution coverage and pricing-version warning]
```

Do not present cost per successful task without including attributable costs from failed runs in the defined numerator. Do not compare currencies or pricing periods without normalization. Provider metadata may be delayed or incomplete.

## 8. DSH-006 — Data Quality & Pipeline Reliability

### Required signals
- Event completeness against authoritative source action counts.
- Duplicate rate and conflicting duplicate IDs.
- Schema failures, unknown event versions and quarantine volume.
- Referential integrity and cross-tenant/project scope violations.
- Event-time to warehouse-availability freshness lag.
- Transformation failures, retries, backfill status and reconciliation deltas.
- AI telemetry coverage and missing correlation identifiers.

### Layout

```text
[Pipeline/model] [Time window] [Environment]
[Freshness lag] [Valid event %] [Duplicate rate] [Quarantine backlog]
[Pipeline runs and failures] [Reconciliation deltas]
[Schema versions / contract test status]
[Backfill/replay status and last successful reconciliation]
```

Thresholds are proposed only after baseline and owner approval. Any tenant-scope mismatch or potential sensitive-content leakage is critical and follows security incident handling.

## 9. DSH-007 — Security & Privacy Signals

This dashboard is restricted, not a general product analytics surface. It contains aggregate counts and incident references for denied/allowed policy decisions, suspicious scope mismatch, unauthorized tool attempts, provider-route blocks, prohibited-content logging detections, deletion workflow status, access/export events and audit coverage. Do not expose project content, secret values or broad project-existence information.

**Critical gates:** any confirmed cross-project leakage, unauthorized Canon mutation, approval bypass, unauthorized tool execution or unapproved provider routing blocks release/trigger incident response according to the approved policy. No averaging or green dashboard status may override a confirmed critical event.

Deletion state must distinguish requested, queued, primary deleted, derived data invalidated, provider deletion requested/confirmed where applicable, backup expiry pending and completed with evidence. Do not claim complete when a downstream copy is unverified.

## 10. DSH-008 — Research, Evidence & Continuity

### Questions
- Are factual claims linked to evidence with source locators and status?
- What is the review outcome for AI-detected continuity issues?
- Which defects are confirmed, rejected as false positives, unresolved or corrected?
- Are source provenance and context-manifest references retained through output review?

### Required models
`fact_claim_evaluation`, `bridge_claim_evidence`, `dim_source_reference`, `fact_continuity_check`, `fact_defect`, `dim_project_item`.

### Layout

```text
[Project scope] [Artifact type] [Evaluation version] [Time window]
[Evidence traceability coverage] [Confirmed continuity defects] [Unresolved review items]
[Claim provenance status] [Source trust tier, if configured]
[Defect severity and resolution state]
[Restricted links to source/artifact, opened only after permission check]
```

AI-detected issues are not confirmed defects until the approved review/labeling process classifies them. A source citation alone does not prove claim correctness.

## 11. Serving layer contracts

Recommended logical serving objects; technology is not selected.

| ID | Serving object | Grain | Required columns / contract |
|---|---|---|---|
| MODEL-001 | `mart_north_star_project` | Project × qualifying package version | project/package opaque keys, accepted/approved times, elapsed hours, completeness, cohort dates, data-quality status |
| MODEL-002 | `mart_workflow_funnel_daily` | Date × workflow type/version × state | eligible count, transitions, incomplete count, duration percentiles, cohort definition |
| MODEL-003 | `mart_ai_run_health` | Time bucket × capability/version × status | run counts, status counts, latency percentiles, retry/error counts, freshness |
| MODEL-004 | `mart_ai_quality_release` | Evaluation run × dataset × metric × version | numerator/denominator or score, uncertainty, case counts, not-run counts, evaluator version |
| MODEL-005 | `mart_ai_cost_unit` | Period × workflow × pricing version | amount, currency, actual/estimated/unavailable split, attributed coverage, denominator |
| MODEL-006 | `mart_data_quality` | Check × model × run/time bucket | severity, observed value, threshold version/status, failure count, last success |
| MODEL-007 | `mart_security_signal_restricted` | Security event category × time bucket × tenant scope as authorized | count, severity, incident reference, policy version; no raw sensitive payload |
| MODEL-008 | `mart_evidence_continuity` | Project × evaluation/check version | evidence coverage, defect counts by status/severity, sample size and adjudication coverage |

Every serving object must carry `model_version` or transformation version, `built_at`, source watermark, data-quality status and approved scope. Do not let dashboard tools bypass row-level access policies; serving aggregates must be tested for cross-tenant inference/leakage.

## 12. Data contracts and transformation behavior

- Raw events are immutable; validated events are schema checked, classified and deduplicated; modeled facts/dimensions express canonical business meaning; serving objects are dashboard-specific aggregates.
- Transformations are idempotent and dependency-aware. A failed upstream model blocks dependent refresh or marks output stale; it must not publish silent zeros.
- Late-arriving events trigger bounded event-time reprocessing with transformation version and replay lineage.
- Historical metric changes caused by formula/schema changes require backfill or an explicit non-comparable boundary and dashboard annotation.
- Fact tables retain event grain. Aggregates must never be joined back to lower-grain tables in ways that multiply counts.
- Use effective-dated dimensions for team/role/project classification where historical interpretation depends on it.
- Partition/cluster/index strategy depends on actual warehouse and volume. Proposed starting point: partition large event/fact tables by event date and cluster on frequently filtered tenant/project/workflow keys only after workload testing. Do not assert a chosen vendor.

## 13. Access, privacy and retention

- Enforce organization/project isolation in source queries, transformation jobs, marts and dashboard row-level policies.
- Restrict security, audit, diagnostic and cost data by role and purpose. Content Head and Creative Director remain parallel authority domains under Producer; dashboard access must be mapped to explicit actions, not assumed from titles.
- General dashboards use aggregate data and opaque references. Content-bearing drilldowns reauthorize at access time.
- Deletion must propagate to analytics copies and derived aggregates according to approved policy; where aggregate removal is not possible immediately, track tombstone/rebuild workflow and avoid claiming completion early.
- Retention periods, legal hold, residency, deletion SLA, named owners and dashboard vendor controls remain open approvals.

## 14. Acceptance criteria

1. Every dashboard metric links to a versioned definition and serving model.
2. Every panel shows time window, timezone, filters, data freshness and denominator/sample size where applicable.
3. Empty/missing data is distinguished from true zero and pipeline failure.
4. Role and project access is enforced server-side/at query layer; direct URLs cannot bypass it.
5. Tenant/project isolation tests cover aggregates and drilldowns.
6. Dashboard refresh failure is visible and alerts the data owner.
7. Backfills and metric definition changes are annotated and reproducible.
8. Critical security/Canon events are displayed as hard failures, not averaged into health scores.
9. Raw content is absent from general telemetry and dashboards by default.
10. Acceptance tests cover normal, negative, duplicate, replay, privacy, access, deletion and late-arrival scenarios.

## 15. Implementation backlog

| Task ID | Priority | Work | Dependencies | Acceptance criteria |
|---|---|---|---|---|
| DSH-T001 | P0 | Build NSM serving model | authoritative milestone events and package completeness | time calculation reproducible; incomplete projects visible |
| DSH-T002 | P0 | Implement row/project access tests | IAM and tenant scope | unauthorized aggregate/drilldown access denied |
| DSH-T003 | P0 | Build restricted security signal view | security events and audit correlation | no raw secrets/content; critical signals visible to authorized roles |
| DSH-T004 | P1 | Build workflow funnel dashboard | workflow milestone model | stage denominators and aging definitions visible |
| DSH-T005 | P1 | Build AI run health dashboard | AI telemetry marts | status/latency/retry/freshness visible with no content logging |
| DSH-T006 | P1 | Build evaluation regression dashboard | evaluation result model | version-matched comparisons; Not Run visible |
| DSH-T007 | P1 | Build cost attribution view | provider usage/pricing version | actual/estimated/unavailable separated; coverage visible |
| DSH-T008 | P1 | Build data quality dashboard/alerts | pipeline check registry | failures, freshness and backfill status visible |
| DSH-T009 | P2 | Build evidence/continuity dashboard | claim/evidence and defect review model | AI findings distinguish confirmed/unconfirmed |
| DSH-T010 | P2 | Add dashboard annotation and metric version history | governance workflow | formula changes have impact and comparability note |

## 16. Unresolved decisions and blockers

- Warehouse, transformation engine, orchestration and BI/dashboard vendor.
- Exact freshness/latency SLAs and alert destinations.
- Role-to-dashboard and row-level access grants.
- Approved retention, deletion, residency and legal-hold policy.
- Package completeness rubric and project complexity segmentation.
- Human time tracking approach, if measured at all.
- Cost source, pricing version and allocation for shared calls.
- Evaluation minimum sample size, confidence interval policy and evaluator calibration gates.
- Security incident ownership and escalation SLA.
