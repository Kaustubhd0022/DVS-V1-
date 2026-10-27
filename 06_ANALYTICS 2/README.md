# 06_ANALYTICS — Documentation Package

**Version:** 1.0  
**Status:** Proposed implementation-ready analytics contracts; not evidence of deployed systems.

## Contents

- `KPI_Tree.md` / `.docx` — North Star, KPI tree, definitions, formulas, lineage and gaps.
- `Event_Tracking.md` / `.docx` — event envelope, catalogue, payload examples, delivery semantics, governance and tests.
- `AI_Metrics.md` / `.docx` — AI run/model/retrieval/tool/review/evaluation data model and metrics.
- `Dashboard_Specification.md` / `.docx` — dashboard audiences, questions, serving contracts, access and acceptance criteria.

## Source authority and integrity

The updated Product Strategy and PRD govern product outcomes; approved technical architecture governs data boundaries; AI specifications govern runtime and context semantics; evaluation and security/privacy documents govern evaluation evidence and data handling; BRD supplies business context. Conflicts and missing evidence are explicit blockers, not silently resolved facts.

## Safe defaults

- North Star: time from accepted project input to Human-Approved Story Development Package, with total elapsed time primary and active/waiting intervals separate only when measured.
- Authoritative server-side business events for approval, package completeness and Canon commits.
- At-least-once delivery plus idempotency/deduplication; no blanket exactly-once claim.
- Raw prompts, outputs, retrieved content and project IP are not logged by default.
- No invented warehouse, broker, BI vendor, baseline, numeric SLO or achieved result.
- Unknown/unrun is not zero/pass. Critical security and Canon violations are non-compensatory release blockers.

## Unresolved decisions

Warehouse/BI/orchestration stack; event transport and schema registry; retention/deletion/residency/legal hold; numeric freshness/latency/cost/quality targets; role-level dashboard grants; human time-measurement method; package completeness rubric; cost attribution source; evaluation sample sizes and evaluator calibration; alert destinations and named operational owners.

## Validation

All four Markdown documents have matching DOCX outputs generated from the same source text. JSON examples are illustrative contracts; validate with the chosen schema validator and warehouse dialect during implementation. Mermaid diagrams are included as source text and should be rendered in the documentation platform. No production test execution or deployment is claimed.
