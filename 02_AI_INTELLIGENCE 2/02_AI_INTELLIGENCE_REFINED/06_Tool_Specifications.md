# TATTAVA COPILOT — Tool Specifications
**Document ID:** TAT-AI-TLS-001 · **Baseline:** V1 — Narrative Intelligence · **Status:** Logical tool contracts; concrete APIs require engineering validation

## 1. Tooling principle
Tools are explicit, typed, least-privilege interfaces to deterministic application services or approved external systems. A model may propose a tool call; the runtime validates it. The tool gateway and domain services enforce authorization and side-effect boundaries. No direct model access to databases, secrets, arbitrary network endpoints or Canon persistence.

## 2. Tool registry

| ID | Tool contract | Class | Purpose | Key controls |
|---|---|---|---|---|
| TLS-001 | `get_project_state` | Read-only | Fetch authorized project metadata and state by project/version/scope | Server-side authorization, project scoping, version snapshot |
| TLS-002 | `get_canon` | Read-only | Fetch relevant typed Canon items and current version | Read permission, branch/project filter, audit access where needed |
| TLS-003 | `search_project_assets` | Read-only | Search authorized uploaded/derived project assets | Permission filter before results; source/version references |
| TLS-004 | `retrieve_evidence` | Read-only | Retrieve research records and source cards | Provenance, freshness, rights and conflict metadata |
| TLS-005 | `search_external_sources` | External read | Discover permitted external research sources | Approved provider policy, safe URL handling, quotas, source metadata |
| TLS-006 | `fetch_source_content` | External read | Fetch permitted source content for extraction | Domain allowlist/policy, size/time limits, malware and injection treatment |
| TLS-007 | `extract_document` | Processing | Extract text/metadata from supported uploads | Preserve original; report OCR/parsing confidence; reject unsafe/corrupt inputs |
| TLS-008 | `create_candidate` | State-changing, non-canonical | Persist candidate artifact/branch output | Schema validation, actor/project, snapshot and lineage |
| TLS-009 | `compare_artifacts` | Read-only/analysis | Compare versions/branches and identify changes | Permission checks, version identity, no automatic merge |
| TLS-010 | `run_continuity_check` | Analysis | Assess candidate against Canon/dependencies | Current snapshot, findings with references, no automatic resolution |
| TLS-011 | `prepare_canon_change` | Non-canonical proposal | Prepare typed change set, rationale and impact preview | Candidate only; no commit permission |
| TLS-012 | `submit_for_review` | Workflow action | Route candidate/change to configured reviewer | Configured approval policy, audit event, notification result |
| TLS-013 | `record_human_decision` | Consequential domain command | Record authorized accept/reject/defer/return-for-revision decision | Server-side role/action/consequence authorization; actor identity and audit |
| TLS-014 | `commit_canon_change` | Consequential domain command | Commit approved, validated, non-stale change | Domain-only call, required approval token, optimistic concurrency, idempotency |
| TLS-015 | `get_dependencies` | Read-only | Retrieve dependency graph for changed entities | Scope and version filters; stale assessments labelled |
| TLS-016 | `generate_package` | Artifact generation | Build versioned Story Development Package from governed state | Schema version, current snapshot, open issues, approval status |
| TLS-017 | `export_project` | Consequential export | Export approved artifacts and structured lineage | Export permission, sensitive-data filtering, audit, rights restrictions |
| TLS-018 | `cancel_or_resume_run` | Workflow control | Cancel or resume a supported run/checkpoint | Actor/run authorization, idempotent control, terminal state correctness |
| TLS-019 | `write_audit_event` | Internal deterministic | Record material actions and state transitions | Append-only or tamper-evident controls as selected by architecture |
| TLS-020 | `record_evaluation_result` | Internal deterministic | Persist evaluation metadata and test results | Dataset/version provenance, restricted access, no fake pass status |

Names are logical contract identifiers, not claims that these exact APIs already exist. Each must be implemented behind authenticated application boundaries.

## 3. Common tool envelope
Every invocation should carry: `request_id`, `run_id`, `actor_id`, `project_id`, `action`, `resource_refs`, `input_schema_version`, `idempotency_key` where applicable, `deadline/budget`, and trace context. Responses should carry: status, typed payload, resource/version refs, provenance, warnings, retryability, side-effect summary, error code and trace reference. Never expose credentials or internal secrets to the model.

## 4. Read versus write boundary
Read-only tools must still authorize access. External read tools may introduce malicious or misleading content and therefore return untrusted, provenance-labelled data. Non-canonical writes create candidates or derived artifacts only. Consequential writes require a separate domain command that rechecks authorization, approval, current version and impact policy. The model cannot call `commit_canon_change` directly; it can only prepare a proposal and submit it into the authorized workflow.

## 5. Canon change sequence
```mermaid
sequenceDiagram
  participant M as Model/Agent
  participant G as Tool Gateway
  participant D as Domain Service
  participant V as Validator/Impact
  participant H as Authorized Human
  participant A as Audit/Event Store
  M->>G: prepare change proposal
  G->>D: authorize and persist Candidate
  D->>V: validate schema, version, constraints and impact
  V-->>D: findings + affected dependencies
  D-->>H: review request with diff and impact
  H->>D: approve / reject / defer
  D->>D: re-check role, approval and optimistic version
  alt valid and approved
    D->>D: create new Canon version
    D->>A: record decision, mutation and lineage
  else stale, denied or rejected
    D->>A: record outcome; Canon unchanged
  end
```

## 6. Error and retry contract
Classify errors as validation, authorization, not found, conflict/stale version, rate limit, timeout, provider unavailable, partial extraction, unsupported format, unsafe content, policy block, internal failure or cancellation. Retry only transient/idempotent operations. Do not retry authorization failures as a workaround. For non-idempotent external actions, require idempotency or reconciliation before retry. Use bounded exponential backoff only where approved; numeric limits are operational configuration.

For partial success, return completed step references and failed steps. Do not label a workflow complete if required validation failed. A retry creates a linked run or resume event; it must not duplicate Canon changes or lose provenance.

## 7. File ingestion contract
Recommended initial support, subject to engineering validation: DOCX, text-extractable PDF, TXT and Markdown; common image formats only where OCR/vision is explicitly available. Preserve original uploads, link derived text and summaries to source version, expose OCR/extraction confidence, and make unsupported/password-protected/corrupt/oversized files recoverable. Exact limits are not specified until representative workload and cost testing. Uploaded content is untrusted and should undergo applicable malware/content checks.

## 8. External research tool requirements
Do not invent endpoints or claim universal web access. The deployment must configure approved source/search providers, allowed domains, rate limits, access rights and handling of robots/paywall/blocked content. A source card should retain title, publisher/owner, stable URL/locator, excerpt/claim, retrieval date, source tier, rights metadata where known, extraction confidence, and conflict links. The model cannot fabricate a source reference; the runtime verifies returned source IDs.

## 9. Audit and observability
For material runs, capture input/intent references, context manifest, model/provider route, prompt/schema versions, tools and outcomes, validations, candidate references, human actions, approval, Canon mutation, latency/cost, retry and failure. Minimize raw content duplication and restrict access according to data class. Audit retention is policy-controlled and must not be promised until approved.

## 10. Validation and unresolved items
Engineering validates concrete API schemas, provider/search/OCR capabilities, timeouts, idempotency implementation, storage and audit technology. Security/Legal approve provider allowlists, sensitive-data routing, retention, residency and export policy. Product confirms supported file formats with writers/researchers. Tool contracts are actionable logical specifications, not deployed API claims.

## 12. Refinement — tool contract, side effects and recovery

### 12.1 Common tool envelope
`tool_id`, `tool_version`, `run_id`, `actor_id`, `project_id`, `action_scope`, `input_schema_version`, `idempotency_key`, `deadline`, `budget`, `authorization_decision_ref`, `correlation_id`. The server derives identity and checks authorization; tool descriptions and model requests do not confer permission.

### 12.2 Tool classes
- Read-only domain tools: retrieve project state, versions, approved decisions and dependency references.
- Research tools: search or fetch allowed external sources and return source metadata; results are untrusted.
- Ingestion tools: validate file type/size against configurable policy, malware-scan where supported, extract text/OCR, preserve original reference and extraction quality.
- Analysis tools: compare versions, compute dependency impact, validate package completeness.
- Candidate-write tools: persist candidate artifacts and branches, never Canon.
- Canon command tools: only deterministic, server-side domain commands after explicit approval, permission and optimistic-version checks.
- Administrative tools: manage users, policies and deletion; unavailable to general creative agents.

### 12.3 Tool response envelope
Return `status`, `result_ref`, `warnings[]`, `source_refs[]`, `retryable`, `retry_after` when known, `partial_result`, `error_code`, `safe_user_message`, `correlation_id`, and `side_effect_summary`. Avoid returning raw secrets or protected data in errors.

### 12.4 Tool safety
Every tool has a least-privilege allowlist and typed schema. External network access is policy-controlled. Read and write tools are distinct. No arbitrary shell/code execution is exposed to a model. Side-effecting tools require idempotency, bounded retries and audit. A tool failure cannot trigger a hidden fallback that changes data classification, provider policy or approval requirements.

### 12.5 Ingestion and source lineage
Preserve the original file/source reference, uploader, project scope, detected type, processing version, extraction/OCR method where applicable, extraction warnings, page/segment locators, checksum and access policy. If extraction is partial or low confidence, label it and prevent unsupported conclusions from appearing fully verified.
