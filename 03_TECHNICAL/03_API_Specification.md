# 03_TECHNICAL — 03_API_Specification

**Status:** Proposed API contracts for engineering review; not evidence of deployed endpoints  
**Contract style:** Resource-oriented HTTPS JSON API plus asynchronous run resources; optional streaming is a presentation transport, not the source of truth

## 1. Purpose and contract principles

This specification proposes a consistent interface between the experience layer and the domain/AI runtime, and between internal modules where an API boundary is justified. No endpoint in this document is claimed to exist. Exact paths, authentication mechanism, gateway, rate limits, and versioning policy must be confirmed by engineering/security.


## Document conventions and authority

This specification is the technical execution baseline for Tattava Copilot V1 — Narrative Intelligence. It is derived from the Product Strategy, consolidated PRD, BRD, approved product scope, approved System Architecture baseline, Requirements Traceability, Experience package, and `02_AI_INTELLIGENCE` specifications available in the working source set.

**Decision labels:** **CONFIRMED** = supported by the source baseline or approved architecture gate; **PROPOSED** = implementation contract recommended here but not evidence of a deployed system; **ASSUMPTION** = working assumption to validate; **OPEN DECISION** = requires an accountable owner; **NOT EVIDENCED** = available materials do not establish the fact. This document does not claim that proposed APIs, tables, cloud resources, integrations, or controls are already implemented.

**Authority and conflict handling:** current Product Strategy and updated PRD govern product intent; approved System Architecture governs the technical baseline and approved architecture gates; AI Intelligence specifications govern AI runtime behaviour; Experience and Traceability packages govern interaction contracts and verification mapping; BRD supports business context and scope history. Where evidence is incomplete, retain an explicit open decision rather than inventing a policy or implementation fact.

**Product invariants:** the project is the primary context; conversation is an interaction surface. Canon is authoritative, typed, versioned, permission-controlled, and stored outside model memory, vector indexes, and agent scratchpads. Evidence, interpretation, candidate content, creative decision, and Canon are distinct. Unknown remains unknown unless supplied, appropriately researched/verified, or explicitly accepted as a creative choice by an authorized person. AI-generated content is non-canonical until governed approval and a deterministic domain command commit it. Failed, cancelled, stale, or partial AI runs must not silently mutate authoritative state. Optimize for project progress and a Human-Approved Story Development Package, not prompt count, token volume, agent count, or generation count.

**Role vocabulary:** Producer; Content Head; Creative Director; Writer; Researcher; AI. Creative Director and Content Head are parallel authority domains under Producer, not a strict reporting chain. Exact action-level permissions and approval routing remain configurable/open until approved. Never infer a person's identity from a role title.

## 2. API boundary model

| Interface | Consumer → provider | Contract purpose | Trust rule |
|---|---|---|---|
| Experience API | Browser → application API | Project queries, input, artifacts, candidates, decisions, run status | Authenticate every request; authorize project/object access server-side |
| Domain commands | API/application module → domain core | State transitions, candidate acceptance, Canon commit, artifact version creation | Validate schema, policy, expected version and audit atomically |
| Run API | Experience/domain → orchestrator | Start, inspect, cancel and resume allowed AI runs | Enforce run scope, budgets and cancellation semantics |
| Tool API | Orchestrator → tool registry/executor | Invoke declared tools under capability-specific allowlist | Never accept arbitrary tool names or raw executable code from model output |
| Provider adapter | Model Gateway → approved provider | Model request, structured output, usage and error normalization | Provider selection governed by policy and data handling rules |
| Event/webhook boundary | Internal producer → subscribed consumer | Async state-change notification if needed | Signed/authenticated, idempotent consumers; no sensitive content in event by default |

## 3. Common HTTP conventions (proposed)

- Base path: `/api/v1` is a proposed versioned path, not a confirmed deployed base URL.
- Content type: `application/json; charset=utf-8`; binary upload should use a separately approved upload flow or signed object-storage upload contract.
- Correlation: accept or create `X-Correlation-ID`; return it in every response. Do not trust it as an authorization identity.
- Idempotency: commands with possible duplicate side effects accept `Idempotency-Key`; server binds key to actor, route, and request hash for a bounded configured period.
- Concurrency: canonical mutations require `If-Match` or an explicit `expectedVersion` field; stale writes return `409 VERSION_CONFLICT`.
- Time: ISO 8601 UTC timestamps for transport; preserve source-local dates separately when semantically important.
- Pagination: cursor pagination for potentially large collections; stable sort key; never expose another tenant's cursor data.
- Errors: stable machine-readable `code`, safe human-readable `message`, optional field errors, `retryable`, and correlation ID. Do not leak provider prompts, secrets, stack traces or unauthorized resource existence.
- Rate limits: per-user/tenant/project and per expensive capability should be configurable. Numeric limits are open decisions and must not be implied by examples.

## 4. Common response and error envelopes

```json
{
  "data": {},
  "meta": {
    "correlationId": "corr_example",
    "requestId": "req_example"
  }
}
```

```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "The project changed after this candidate was created.",
    "retryable": false,
    "details": {
      "expectedVersion": 12,
      "currentVersion": 13
    }
  },
  "meta": { "correlationId": "corr_example" }
}
```

The examples are illustrative. Error details must be reviewed for data leakage. A conflict response may return only fields the actor is authorized to see.

## 5. Proposed endpoint inventory

| Operation ID | Method / path | Purpose | Auth / authorization | Concurrency / idempotency |
|---|---|---|---|---|
| API-PROJ-001 | `POST /api/v1/projects` | Create project from accepted intake | Authenticated actor; tenant create permission | Idempotency key recommended |
| API-PROJ-002 | `GET /api/v1/projects/{projectId}` | Read project overview/current state | Project membership and read permission | Cache only with scope/version awareness |
| API-INPUT-001 | `POST /api/v1/projects/{projectId}/inputs` | Submit user input/intake to project | Project write permission | Idempotency key; returns run or intake record |
| API-RUN-001 | `POST /api/v1/projects/{projectId}/runs` | Start a named AI capability | Capability permission, project scope, budget policy | Idempotency key; asynchronous accepted response |
| API-RUN-002 | `GET /api/v1/runs/{runId}` | Read run status and safe result metadata | Actor may access run's project/tenant | Read-only |
| API-RUN-003 | `POST /api/v1/runs/{runId}/cancel` | Request cancellation | Run owner or permitted project role | Idempotent cancellation request |
| API-CAND-001 | `GET /api/v1/projects/{projectId}/candidates` | List candidates for review | Project read/review policy | Cursor pagination |
| API-CAND-002 | `POST /api/v1/projects/{projectId}/candidates/{candidateId}/decision` | Accept/reject/defer candidate | Consequence-based review permission | Idempotency + expected version |
| API-CANON-001 | `GET /api/v1/projects/{projectId}/canon` | Read canonical state/revision | Project read permission | Versioned response |
| API-CANON-002 | `POST /api/v1/projects/{projectId}/canon/commands` | Commit approved Canon change | Action-level permission and required approval | Expected version; idempotent command |
| API-RES-001 | `POST /api/v1/projects/{projectId}/research` | Start research workflow | Project capability permission and source/tool policy | Idempotency key; async run |
| API-ART-001 | `GET /api/v1/projects/{projectId}/artifacts` | List artifacts and versions | Project read permission | Cursor pagination/filtering |
| API-PKG-001 | `POST /api/v1/projects/{projectId}/packages` | Assemble package candidate | Project write/capability permission | Idempotency key; schema version explicit |

These are proposed contracts to support known product capabilities. Endpoint granularity and naming may change during API review; no external/public customer API is implied.

## 6. Example contracts

### 6.1 Create project — proposed

`POST /api/v1/projects`

```json
{
  "title": "Rajyam",
  "initialInput": {
    "kind": "freeform",
    "text": "Develop a historically grounded series about..."
  },
  "formatHint": null,
  "genreHints": [],
  "sourceReferences": []
}
```

Proposed success: `201 Created` with `projectId`, initial state, and accepted intake/run reference if project understanding is asynchronous. Unknown metadata should remain absent/Unknown, not be silently inferred into Canon. Server derives tenant and actor from authenticated context.

### 6.2 Start AI run — proposed

`POST /api/v1/projects/{projectId}/runs`

```json
{
  "capability": "intent_understanding",
  "input": { "text": "Help me develop this concept..." },
  "contextPolicy": "project_default",
  "outputSchemaVersion": "intent-review.v1",
  "clientRequestId": "optional-client-generated-id"
}
```

`202 Accepted`:

```json
{
  "data": {
    "runId": "run_example",
    "status": "Queued",
    "statusUrl": "/api/v1/runs/run_example",
    "createdAt": "2026-10-06T10:00:00Z"
  },
  "meta": { "correlationId": "corr_example" }
}
```

`contextPolicy` is a named, server-approved policy, not a client instruction to bypass authorization. Unknown capability names are rejected. Budgets and allowed tools are server-side policy, not caller-controlled overrides unless explicitly granted.

### 6.3 Run status — proposed

`GET /api/v1/runs/{runId}`

```json
{
  "data": {
    "runId": "run_example",
    "projectId": "proj_example",
    "capability": "research_synthesis",
    "status": "Partially succeeded",
    "progress": { "completedSteps": 3, "totalSteps": 4 },
    "awaiting": null,
    "candidateIds": ["cand_example"],
    "provenanceSummary": { "sources": 5, "claimsSupported": 7, "claimsConflicted": 1 },
    "validationFindings": [{ "code": "SOURCE_CONFLICT", "severity": "warning" }],
    "startedAt": "2026-10-06T10:00:00Z",
    "completedAt": "2026-10-06T10:00:12Z"
  },
  "meta": { "correlationId": "corr_example" }
}
```

Progress counts are examples only. Do not expose chain-of-thought or hidden reasoning. Return concise rationale, evidence references, uncertainty, validation findings, and actionable status rather than private model internals.

### 6.4 Candidate decision — proposed

`POST /api/v1/projects/{projectId}/candidates/{candidateId}/decision`

Headers: `If-Match: "project-version-13"`, `Idempotency-Key: decision_example`

```json
{
  "decision": "accepted",
  "rationale": "Accepted after editorial review.",
  "proposedCanonCommands": [
    { "operation": "upsert", "targetType": "character", "targetId": "char_example", "candidateValueRef": "candidate-fragment-1" }
  ]
}
```

The candidate decision and Canon mutation may be separate operations if policy requires separate approval. The server must not interpret `decision: accepted` as blanket permission to mutate all related Canon. It re-checks the current role/action policy, approval references, expected version, candidate validation and target scope. Return the decision record, committed revision if any, and impact summary; otherwise return a safe conflict/policy error.

### 6.5 Canon command — proposed

`POST /api/v1/projects/{projectId}/canon/commands`

```json
{
  "commandId": "cmd_example",
  "expectedCanonVersion": 13,
  "decisionId": "decision_example",
  "operations": [
    { "op": "set", "entryId": "entry_example", "value": { "name": "Aarav" }, "schemaVersion": "character.v1" }
  ]
}
```

Server checks authorization, approval requirement, expected version, entry schema, lock state, project scope, candidate lineage and idempotency before an atomic commit. Unsupported operations or partial application are rejected. Exact patch vocabulary should be finalized by the domain/API owners.

## 7. AI output contract

An AI-facing result should expose content plus state/provenance—not only a text string.

```json
{
  "candidateId": "cand_example",
  "contentType": "research_summary",
  "content": {},
  "epistemicItems": [
    { "itemRef": "claim-1", "status": "Conflicting", "reason": "Sources disagree", "evidenceRefs": ["ev-1", "ev-2"] }
  ],
  "provenance": [{ "sourceId": "src-1", "locator": "section 2", "retrievedAt": "2026-10-06T09:00:00Z" }],
  "validation": { "status": "warning", "findings": ["SOURCE_CONFLICT"] },
  "review": { "required": true, "reason": "Creative/factual decision requires human review" },
  "lineage": { "runId": "run_example", "contextManifestId": "ctx_example", "schemaVersion": "research-summary.v1" }
}
```

This is a proposed common envelope; capability-specific schemas must define their actual content. No fabricated confidence percentage should be shown without calibrated semantics. Citations must point to persisted source/evidence records rather than model-authored URLs alone.

## 8. Error taxonomy

| HTTP | Code | Meaning | Client behaviour |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid field/schema/state transition | Show field-level message; do not auto-retry unchanged request |
| 401 | `UNAUTHENTICATED` | No valid authentication | Re-authenticate |
| 403 | `FORBIDDEN` | Actor lacks permission | Do not reveal hidden resource details; offer safe escalation path |
| 404 | `NOT_FOUND` | Missing or intentionally concealed resource | Treat as unavailable |
| 409 | `VERSION_CONFLICT` | Expected version stale | Refresh state and re-review candidate/impact |
| 409 | `IDEMPOTENCY_CONFLICT` | Same key used with different request | Client generates new key only for a genuinely new action |
| 413 | `PAYLOAD_TOO_LARGE` | Input exceeds approved limit | Explain limit once policy is set; do not claim support for unapproved formats |
| 422 | `POLICY_BLOCKED` | Valid syntax but disallowed action/content | Explain safe reason and allowed next step |
| 429 | `RATE_LIMITED` | Configured quota/rate exceeded | Honour `Retry-After` where supplied |
| 502/503 | `DEPENDENCY_UNAVAILABLE` | Provider/tool/downstream unavailable | Retry only when `retryable=true` and idempotent |
| 504 | `DEPENDENCY_TIMEOUT` | Downstream deadline exceeded | Poll run state; do not resubmit blindly |
| 500 | `INTERNAL_ERROR` | Unexpected server failure | Show correlation ID; do not expose stack or prompt payload |

## 9. Async, streaming, webhook and event contracts

Long-running research and generation use durable run resources. Polling is the baseline contract. Server-sent events or WebSocket streaming may be added for progress/tokens if required by UX, but events are ephemeral and must not replace `GET /runs/{id}`. Stream events should be typed: `run.started`, `run.progress`, `run.awaiting_input`, `run.candidate_ready`, `run.failed`, `run.cancelled`; every event carries run ID, sequence/version and correlation ID. Do not stream hidden chain-of-thought.

Webhooks are not required by confirmed V1 scope. If introduced, they require signed delivery, retry policy, replay protection, idempotent consumer guidance, secret rotation, delivery status and no unnecessary sensitive payload. Internal domain events are not automatically public webhooks.

## 10. Security, audit and privacy requirements

Authorization applies to project, run, candidate, artifact, source, evidence, package and nested object references. API handlers must prevent insecure direct object references and verify every relationship in scope. Avoid returning prompts or full retrieved passages to telemetry/clients unless the user is authorized and the product surface requires it. Tool and provider details should be minimized in client errors. Audit all consequential actions, permission denials where appropriate, Canon commits, approval decisions, exports, and security-sensitive changes.

## 11. Contract testing and traceability

Contract tests must validate schema, required/nullable fields, enum values, status transitions, error envelope, idempotency, expected-version handling, authorization on direct and indirect references, and compatibility. Generated OpenAPI should be the source of truth once approved; until then this document is a proposed contract baseline.

| Traceability | Relevant contract | Minimum verification |
|---|---|---|
| Project intake/context | API-PROJ-001, API-INPUT-001 | Arbitrary input accepted without forcing an unapproved template; unknown fields remain unknown |
| AI execution | API-RUN-001–003 | Run status persisted through disconnect, timeout, cancellation and partial completion |
| Research provenance | API-RES-001 + AI result envelope | Source and evidence references resolve within authorized project |
| Candidate review | API-CAND-001–002 | Review decision does not bypass Canon policy |
| Canon integrity | API-CANON-001–002 | Unauthorized/stale/malformed command fails without partial mutation |
| Package assembly | API-PKG-001 | Package reports missing/stale/approval-pending elements accurately |

## 12. Open API decisions

Confirm base URL and gateway; auth/session/OIDC details; public versus internal API boundary; endpoint names/granularity; upload protocol and file limits; exact role-action matrix; rate and concurrency limits; event/streaming need; idempotency retention; API compatibility policy; package schema; and whether any external customer API is in scope.


## References and related specifications

- Product Strategy (current approved strategic baseline).
- Consolidated Product Requirements Document, baseline v1.2.
- Business Requirements Document (business context and scope history).
- `03_Product_Scope.md` (final execution scope baseline).
- `03_TECHNICAL_01_System_Architecture_FINAL.docx` (approved architectural gates and system architecture baseline).
- `02_AI_INTELLIGENCE` comprehensive specification and companion capability, agent, prompt, context, memory, tool, guardrail and human-in-the-loop specifications.
- `01_EXPERIENCE_FINAL` user flows, UX specification, AI interaction specification and design system.
- `Requirements_Traceability/Requirements_Traceability.md` (requirement, gap and proposed test mapping).

The above sources are the traceability basis. Where exact requirement IDs are not repeated inline, implementation teams should resolve them against the traceability baseline before treating a proposed contract as formally approved. This document does not claim implementation or test completion.
