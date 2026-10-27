# 04_EVALUATION — Tattava Copilot

**Product boundary:** V1 Narrative Intelligence  
**Package status:** Evaluation design and candidate test artifacts; not evidence of execution, validation, or release approval.

## Documents

| File | Purpose |
|---|---|
| `01_AI_Evaluation_Framework.md` | Quality model, methodology, evaluator governance, proposed release gates, error taxonomy and traceability. |
| `02_Golden_Dataset.md` | Dataset schema, governance, promotion workflow and 30 synthetic candidate cases. |
| `03_Evaluation_Cases.md` | 30 proposed detailed evaluation cases, execution procedures and high-risk test specifications. |
| `04_Regression_Suite.md` | 10 regression suites, trigger mapping, baseline rules, triage and release template. |
| `05_AI_Quality_Report.md` | Leadership report template; all actual results are unavailable/not run. |
| `golden_dataset.jsonl` / `.csv` | Machine-readable synthetic candidate dataset. |
| `evaluation_cases.jsonl` / `.csv` | Machine-readable case library. |
| `regression_manifest.json` | Proposed regression suites and gate defaults; no run results. |
| `regression_run_template.json` | Blank run-record template. |

Each Markdown document has a corresponding DOCX. Markdown preserves Mermaid source and technical tables. DOCX uses consistent headings, tables, headers/footers and page numbers; Mermaid source is retained as readable code where diagram rendering is not available.

## How to interpret the package

- **Source-stated:** grounded in product/technical source material.
- **Proposed:** recommended operating default that still needs accountable approval.
- **Candidate:** synthetic example awaiting expert validation.
- **Not run / unavailable:** no execution evidence exists in the reviewed source set.
- **Human-validated golden:** must be assigned only after review and adjudication evidence is recorded.

## Open questions handled with defaults

This package resolves methodological gaps with conservative recommendations: invariant gates are separate from graded quality; no critical failures are allowed for security/authorization/Canon invariants; candidate goldens require expert review; missing results are never counted as passes; model judges are secondary and calibrated; numeric latency/cost targets are set only after representative telemetry. These defaults are proposed, not falsely represented as already approved policy.

## Source alignment

Built against the available updated Product Strategy, consolidated PRD, BRD, Product Scope, Requirements Traceability, Experience specifications, AI Intelligence specifications and Technical documentation. Preserve the source's core principles: project-centric intelligence; unknown remains unknown; evidence, interpretation, creative decision and Canon are distinct; AI cannot silently mutate Canon; and release quality must include safety, provenance and human control. The exact mapping of FR-021–FR-024 and some source-version precedence should be confirmed against the controlled PRD register before formal audit use.

## Suggested implementation sequence

1. Build deterministic authorization, isolation, Canon, concurrency and schema tests.
2. Promote high-risk candidate examples to reviewed golden status.
3. Capture durable run metadata, context manifests, tool traces and evidence.
4. Implement case runner, rubric capture and adjudication.
5. Wire REG-01–REG-10 into change-triggered CI and release review.
6. Generate AI Quality Report from actual run artifacts; never populate results manually without evidence.
