import type { ResearchFinding } from '../types/project';
import type { BackendEvidence, OfflineCitation, SourceDocument } from './apiClient';

/**
 * A finding becomes 'Verified' only when both hold:
 * - the server found the quoted excerpt in a stored source from an approved site
 *   (evidence.validation_status === 'quote_found'), and
 * - a named person confirmed that the excerpt supports the claim.
 */
export interface SourceVerification {
  document: SourceDocument;
  evidence: BackendEvidence;
  verifier: string;
  /** The person confirmed the quoted passage supports the claim. */
  confirmed: boolean;
}

export type VerificationResult =
  | { ok: true; finding: ResearchFinding }
  | { ok: false; error: string };

export const verifyFindingWithSource = (
  finding: ResearchFinding,
  { document, evidence, verifier, confirmed }: SourceVerification,
  now: Date
): VerificationResult => {
  if (!verifier.trim()) {
    return { ok: false, error: 'Sign in to verify findings, so the verification is recorded against your name.' };
  }
  if (!confirmed) {
    return { ok: false, error: 'Confirm that the quoted passage supports the claim.' };
  }
  if (evidence.validation_status !== 'quote_found' || evidence.document_id !== document.id || !evidence.supporting_excerpt) {
    return { ok: false, error: 'The quote has not been checked against this source yet.' };
  }

  return {
    ok: true,
    finding: {
      ...finding,
      status: 'Verified',
      source: document.title,
      sourceType: document.source_tier === 'primary' ? 'Government' : 'Established Publication',
      sourceUrl: document.url ?? undefined,
      authorPublisher: document.publisher ?? undefined,
      evidenceQuote: evidence.supporting_excerpt,
      exactCitation: '',
      sourceTier: document.source_tier,
      verificationMethod: 'quote_checked',
      sourceDocumentId: document.id,
      evidenceId: evidence.id,
      verifiedBy: verifier.trim(),
      verifiedAt: now.toISOString(),
      date: now.toLocaleDateString(),
      provenance:
        document.provider === 'upload'
          ? `Quote found in the uploaded document "${document.file_name ?? document.title}" (uploaded ${document.retrieved_at.slice(0, 10)}${document.extraction_method === 'ocr' ? ', text read with OCR' : ''}).`
          : `Quote found in the stored copy of this source (retrieved ${document.retrieved_at.slice(0, 10)}).`,
    },
  };
};

/** A human-readable citation for an offline source. */
export const formatCitation = (citation: OfflineCitation): string => {
  switch (citation.kind) {
    case 'book': {
      const imprint = [citation.publisher, citation.year].filter(Boolean).join(', ');
      return `${citation.author}, ${citation.title}${imprint ? ` (${imprint})` : ''}, p. ${citation.page}`;
    }
    case 'interview':
      return `Interview with ${citation.informant}, ${citation.place}, ${citation.date} (by ${citation.interviewer})`;
    case 'field_visit':
      return `Field visit to ${citation.place}, ${citation.date} (observed by ${citation.observer})`;
    case 'archive_visit':
      return `${citation.archive}, ${citation.record_reference}, folio ${citation.folio} (seen ${citation.date})`;
  }
};

const KIND_LABEL: Record<OfflineCitation['kind'], string> = {
  book: 'book',
  interview: 'interview',
  field_visit: 'field visit',
  archive_visit: 'archive record',
};

/**
 * An offline source recorded and attested on the server becomes a 'Verified' finding marked as
 * attested: the citation and quote are a researcher's word, not something the system checked.
 */
export const verifyFindingWithAttestation = (
  finding: ResearchFinding,
  { evidence, verifier }: { evidence: BackendEvidence; verifier: string },
  now: Date
): VerificationResult => {
  if (!verifier.trim()) {
    return { ok: false, error: 'Sign in to record sources, so the record is kept against your name.' };
  }
  if (evidence.validation_status !== 'attested' || !evidence.citation || !evidence.supporting_excerpt) {
    return { ok: false, error: 'The offline source has not been recorded yet.' };
  }
  const citation = formatCitation(evidence.citation);
  return {
    ok: true,
    finding: {
      ...finding,
      status: 'Verified',
      source: citation,
      sourceType: evidence.source_tier === 'primary' ? 'Government' : evidence.source_kind === 'book' ? 'Established Publication' : 'Field Report',
      sourceUrl: undefined,
      evidenceQuote: evidence.supporting_excerpt,
      exactCitation: citation,
      sourceTier: (evidence.source_tier ?? 'secondary') as ResearchFinding['sourceTier'],
      verificationMethod: 'attested',
      sourceDocumentId: undefined,
      evidenceId: evidence.id,
      verifiedBy: verifier.trim(),
      verifiedAt: now.toISOString(),
      date: now.toLocaleDateString(),
      provenance: `Attested offline source (${KIND_LABEL[evidence.citation.kind]}), recorded by ${verifier.trim()}; not machine-checked.`,
    },
  };
};

/** How a source is labelled in the UI. */
export const sourceTierLabel = (tier: 'primary' | 'secondary' | 'field'): string =>
  tier === 'primary' ? 'Government source' : tier === 'field' ? 'Field research' : 'Open source';
