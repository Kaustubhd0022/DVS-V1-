# 02_AI_INTELLIGENCE — Final Documentation Package
**Product:** Tattava Copilot · **Company:** Tattava Co. / Don Vanzara Showbiz LLP · **Baseline:** V1 — Narrative Intelligence

## Purpose
This package defines the AI behaviour and operating contracts behind Tattava Copilot: capabilities, agent/workflow responsibilities, prompts, context assembly, memory/project intelligence, tools, guardrails and human oversight. It is designed to align Product, Creative, AI/ML, Engineering, QA, Security, Research/Knowledge Management and Operations.

## Refined edition
This edition preserves the current AI Intelligence specifications and adds deeper operational contracts, failure taxonomies, context manifests, domain-state rules, tool boundaries, threat tests, decision semantics, rendered diagrams and low-fidelity AI interaction wireframes. It deliberately does **not** use the superseded blueprint as the authority.

## Included documents
1. `01_AI_Capability_Spec` — capability catalogue, triggers, outputs, autonomy, failures and evaluation.
2. `02_Agent_Specifications` — logical agent/workflow registry, orchestration, handoffs, budgets and failure recovery.
3. `03_Prompt_Specifications` — governed prompt families, candidate templates, instruction/data boundaries and evaluation.
4. `04_Context_Specification` — context classes, source precedence, retrieval/manifest, freshness, conflicts and budgeting.
5. `05_Memory_Project_Intelligence` — memory categories, conceptual data model, Canon, evidence, decisions, lineage and deletion.
6. `06_Tool_Specifications` — logical tool contracts, read/write boundaries, authorization, idempotency, ingestion and audit.
7. `07_Guardrails` — risk register, deterministic controls, threat boundaries, failure response and release gates.
8. `08_Human_in_the_Loop` — role model, review checkpoints, approval flow, decision records and acceptance criteria.

Each Markdown document has a matching DOCX. The Markdown is the editable source of truth for headings, tables, IDs and Mermaid diagram source. DOCX files include the same substantive content; Mermaid blocks are preserved as labelled, readable diagram-source blocks where a renderer is not available. They should be rendered and visually checked during publication.

## Source hierarchy used
- Latest Product Strategy and updated PRD for product intent and V1 scope.
- Approved `03_TECHNICAL_01_System_Architecture_FINAL` for system boundaries and architecture gates.
- `03A_Product_Scope_Decision_Resolution_Addendum` for operating defaults and the disposition of OD-01–OD-14.
- BRD for original business intent.
- `01_EXPERIENCE_FINAL` and Requirements Traceability for UX and acceptance/test alignment.

## Decisions auto-resolved for implementation
The package adopts safe operating defaults for: configurable action-based authorization; provider-agnostic Model Gateway; assistive autonomy with no autonomous Canon mutation; evidence/source provenance and source tiering; versioned adaptive Story Development Package; bounded DVS handoff instead of deep V1 production-suite integration; optimistic concurrency; configurable supported-file limits; project-scoped context and durable Project Intelligence; structured candidate and approval workflows; bounded agent execution; and risk-based release gates.

## Decisions intentionally left open
These require a real accountable owner or measured evidence and are not silently invented:
- approved providers, contract terms, residency, subprocessors and external data handling;
- retention periods, legal holds, deletion exceptions and backup deletion timelines;
- exact action-to-role/approver matrix, named approvers and separation of duties;
- final retrieval/search/OCR vendors and concrete API/JSON schemas;
- exact supported file sizes/pages and production capacity;
- numeric quality thresholds, latency/availability SLOs, RTO/RPO and per-project cost budgets;
- external customer segment, pricing and willingness-to-pay;
- pilot-derived quality and usability baselines.

## Cross-document dependency chain
Business objective → PRD/BRD requirements → AI capability → agent/workflow → prompt → context/memory → tool → guardrail → human checkpoint → evaluation/acceptance. Not every capability needs every layer; the chain is used to identify applicable dependencies, not to force unnecessary agents.

## Release gates
Security isolation, authorization, Canon integrity, prompt-injection/tool boundary, sensitive-data routing, auditability of consequential changes, concurrency/data-loss and recovery tests are hard gates. Quality, latency, cost and reviewer workload targets require baseline measurement and owner approval.

## Status discipline
“Proposed” identifies an implementation module or schema contract that needs engineering validation; it does not imply deployed functionality. “Provisional control” identifies a conservative default pending Security/Legal/leadership sign-off. No test result, compliance certification, customer validation or production capability is claimed by this package.


## Visual assets
- `visual_assets/01_runtime_architecture.png`
- `visual_assets/02_lifecycle.png`
- `visual_assets/03_context_evidence.png`
- `visual_assets/04_wireframe_run_inspector.png`
- `visual_assets/05_wireframe_candidate_review.png`
- `visual_assets/06_wireframe_context_manifest.png`

Wireframes are functional/structural only, not final UI styling. All open policy decisions remain visible; no vendor, numerical SLO, retention duration, or permission matrix has been invented.
