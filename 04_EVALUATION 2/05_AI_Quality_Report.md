# 05 — AI Quality Report

**Reporting period:** Not set  
**Application/model/config versions:** Not supplied  
**Status:** Report template; no measured evaluation results were available in the reviewed source set.  
**Audience:** Product leadership, Engineering, AI/ML, QA, Security/Privacy, Research/Content/Creative and Operations.

## 1. Executive quality summary

**Current evidence status: NOT ASSESSED / NOT RUN.** The documentation establishes a proposed evaluation framework and candidate case library. It does not establish that the tests have executed, that candidate cases have been expert-validated, or that a production baseline exists. Therefore pass rates, trends, model rankings, release readiness and numerical quality claims are unavailable.

### Decision summary

| Decision area | Current status | Evidence needed | Decision implication |
|---|---|---|---|
| Critical security, privacy and Canon invariants | Not run | EV-005, EV-014, EV-015, EV-019, EV-023 and critical suite run bundle | Release remains blocked from evidence-based approval until run results are reviewed. |
| Core AI task quality | Not measured | Human-reviewed golden set and scored runs | No quality claim or model superiority claim. |
| Grounding and research quality | Not measured | Claim-level evidence annotation and reviewer adjudication | No groundedness percentage may be reported. |
| Structured-output correctness | Not measured | Schema/contract test run | No conformance claim. |
| Reliability and recovery | Not measured | Fault-injection run results | No recovery-rate claim. |
| Latency and cost | Baseline unavailable | Representative end-to-end traces and provider usage data | Instrument first; numeric budget remains unapproved. |
| Release readiness | **Undetermined** | Full release evidence, blockers, owners and authorized decision | This report is not a release approval. |

## 2. Scope and versions tested

| Field | Value |
|---|---|
| Product | Tattava Copilot — V1 Narrative Intelligence |
| Build / commit | Not supplied |
| Model/provider/version | Not supplied / provider decision remains subject to approval |
| Prompt/agent config version | Not supplied |
| Retrieval/index version | Not supplied |
| Tool adapter versions | Not supplied |
| Golden dataset version | `tattava-golden-candidate-1.0` (candidate, not validated) |
| Evaluation cases | EV-001–EV-030 (proposed, NOT_RUN) |
| Regression suite | REG-01–REG-10 (proposed, NOT_RUN) |
| Evaluator/rubric version | Framework v1.0 proposed; calibration not evidenced |
| Run window | Not supplied |
| Report owner / approver | Unassigned |

## 3. Metric dictionary and result table

Report all metrics with a numerator/denominator, scope, exclusions, data source, version, and confidence/limitations. `N/A` means the metric is not applicable; `Unavailable` means it is applicable but no valid evidence is available. Never use zero to represent missing data.

| Metric | Definition | Required evidence | Current result | Interpretation |
|---|---|---|---|---|
| Critical invariant pass | Critical required assertions passed / critical assertions executed | Run records and assertion outcomes | Unavailable | Must report any critical failure separately; proposed gate is zero known critical failures. |
| Case pass rate | Passed cases / executed eligible cases; report blocked, skipped and quarantined separately | Case-level status and exclusion log | Unavailable | Does not equal model quality or coverage. |
| Coverage | Requirements/capabilities with at least one relevant reviewed case / in-scope requirements/capabilities | Normalized requirement inventory and mappings | Not computed | Existing mappings are proposed and need ID reconciliation. |
| Rubric score | Distribution of human/model-assisted scores per dimension and case | Calibrated rubric annotations | Unavailable | Report median, distribution, sample size and disagreement; do not average unrelated dimensions. |
| Grounded claim rate | Material claims supported by admissible evidence / material claims reviewed | Claim annotation with evidence links | Unavailable | Citation presence alone is insufficient. |
| Retrieval Recall@k / Precision@k | Relevant items retrieved within top k / relevant items judged; retrieved relevant items / retrieved items | Reviewed query-to-document relevance labels | Unavailable | Only meaningful for a judged retrieval set. |
| Schema validity | Outputs passing schema/domain validation / outputs validated | Validator version and output records | Unavailable | Report before and after bounded repair separately. |
| Tool success | Valid authorized tool operations completed / required tool operations attempted | Tool traces and expected tool plan | Unavailable | Distinguish agent error from provider outage and quota exhaustion. |
| Recovery success | Failed/partial runs recovered without state corruption / recovery attempts | Fault injection and state snapshots | Unavailable | Do not infer from successful retry alone. |
| p50/p95 latency | Percentiles of end-to-end duration and component spans | Trace timestamps and sample count | Unavailable | Segment queue, model, tool, retrieval and UI delivery. |
| Cost per run/project | Attributable provider/tool costs divided by defined run/project denominator | Usage telemetry and approved pricing basis | Unavailable | Identify missing provider cost fields and currency/pricing timestamp. |
| North Star | Time from accepted project input to Human-Approved Story Development Package | Event definitions, timestamps, quality/approval status | Unavailable | Report alongside rework, quality and safety; do not optimize speed alone. |

## 4. Coverage and risk review

The initial candidate suite includes 30 cases across entry/intent, context, research, narrative quality, branches/decisions/Canon, package readiness, security/privacy, recovery, cost/latency, and human approval. These are design-time coverage counts, not executed test coverage and not proof that all requirements are covered. FR-021–FR-024 mappings and the exact requirement-to-case inventory should be reconciled against the controlled PRD before formal coverage reporting.

| Risk domain | Candidate cases | Execution status | Release concern |
|---|---|---|---|
| Cross-project isolation / authorization | EV-005 | Not run | Critical blocker until validated |
| Canon mutation / concurrency | EV-012–EV-015 | Not run | Critical blocker until validated |
| Prompt injection / external provider policy | EV-019; EV-023 | Not run | Critical blocker until validated |
| Grounding / conflict handling | EV-007–EV-009 | Not run | High impact; needs expert-reviewed evidence fixtures |
| Context / memory freshness | EV-004; EV-021; EV-025 | Not run | Risk of stale or unauthorized context |
| Reliability / recovery | EV-018; EV-022; EV-024 | Not run | Risk of lost progress, duplicate effects or hidden failure |
| Quality / latency / cost | EV-010–EV-011; EV-026–EV-028 | Not run | No baseline or approved budget |

## 5. Failure analysis template

For each failure cluster, capture: cluster ID; affected capability and requirements; case/run IDs; frequency with denominator; severity; representative output or redacted evidence; expected vs observed behaviour; likely user/project impact; root-cause layer (application, context, retrieval, model/prompt, tool/provider, evaluator/dataset, UX or infrastructure); confidence in diagnosis; workaround/containment; remediation owner; due date; regression added; verification run; residual risk and approver.

Do not infer causality from correlation alone. When model/provider changes coincide with application or dataset changes, isolate variables with paired tests where practical. A single failure is sufficient to block on a hard invariant even if the aggregate rate appears low.

## 6. Charts and interpretation rules

Charts should be generated only from actual run data. Recommended views after execution: (1) stacked case status counts by risk; (2) per-dimension rubric distributions with sample counts; (3) grounded-claim numerator/denominator and confidence interval; (4) critical failures by category and release; (5) paired baseline-vs-candidate differences; (6) p50/p95 latency by workflow and component; (7) cost per successful task with missing-cost coverage; (8) coverage heatmap by requirement/capability and test status. Never render fictional trend lines or fill unavailable results with zero.

## 7. Remediation and decision log

| Priority | Recommended action | Owner function | Exit evidence | Status |
|---|---|---|---|---|
| P0 | Implement deterministic authorization, project isolation, Canon-write and stale-version tests | Engineering + QA + Security | Passing recorded critical suite; no critical failures | Open / not evidenced |
| P0 | Promote a small risk-weighted candidate set to reviewed golden status | Product + Research/Content/Creative + AI/QA | Reviewer evidence, adjudication and dataset version | Open |
| P0 | Capture durable run IDs, context manifests, tool traces and version metadata | Engineering + AI/ML | Inspectable run bundle for each executed case | Open |
| P1 | Implement schema validation, bounded repair and structured failure contracts | Engineering + AI/ML + QA | Contract tests and failure examples | Open |
| P1 | Calibrate rubric and model-assisted evaluator against human-reviewed anchors | AI/ML + domain reviewers | Calibration report with agreement and limitations | Open |
| P1 | Establish representative latency/cost baseline before approving numeric budgets | Engineering + Product / Finance | Workflow-level telemetry and approved budget | Open |
| P2 | Add privacy-reviewed production failure intake into candidate dataset | Product + Security/Privacy + QA | Documented intake, minimization and adjudication flow | Open |

## 8. Release-readiness checklist

- [ ] Required critical suite executed on the exact candidate build/configuration.
- [ ] Zero unresolved critical authorization, privacy, isolation, injection or Canon-integrity failures.
- [ ] All required deterministic contracts pass; blocked/skipped/quarantined cases are disclosed.
- [ ] Candidate golden examples used for release gates have appropriate domain review.
- [ ] Human/model evaluator calibration and limitations are reported.
- [ ] Quality by capability/risk and high-severity cases is reviewed; averages do not hide outliers.
- [ ] Baseline comparison uses a valid, versioned baseline or explicitly says no comparison is available.
- [ ] Latency/cost observations and telemetry gaps are visible; numerical budgets are approved or marked open.
- [ ] Remediation owners, blockers, residual risks and decision authority are recorded.
- [ ] Authorized release decision is recorded separately from this report template.

**Current conclusion:** Evaluation design is specified; quality has not yet been measured in this deliverable. A release-readiness conclusion cannot be made until required runs, dataset review, and accountable approval are recorded.
