import { describe, expect, it } from 'vitest';
import type { ResearchFinding } from '../types/project';
import type { BackendEvidence, SourceDocument } from './apiClient';
import { formatCitation, sourceTierLabel, verifyFindingWithAttestation, verifyFindingWithSource } from './researchVerification';

const finding: ResearchFinding = {
  id: 'f1',
  topic: 'Sindhudurg',
  claim: 'Sindhudurg was built between 1664 and 1667',
  evidence: 'Check: tourism department records',
  source: 'Check: Maharashtra tourism',
  sourceType: 'Academic',
  date: '01/10/2026',
  confidence: 0,
  status: 'Needs Review',
  usedIn: [],
};

const document: SourceDocument = {
  id: 'doc-1',
  project_id: 'p1',
  provider: 'web',
  source_tier: 'primary',
  url: 'https://maharashtratourism.gov.in/fort/sindhudurg',
  title: 'Sindhudurg - Department of Tourism Maharashtra',
  language: null,
  publisher: 'maharashtratourism.gov.in',
  revision_id: null,
  revised_at: null,
  content_hash: 'abc',
  text_length: 8892,
  extraction_method: 'html',
  file_name: null,
  retrieved_at: '2026-10-28T09:00:00',
};

const evidence: BackendEvidence = {
  id: 'ev-1',
  project_id: 'p1',
  document_id: 'doc-1',
  source_url: document.url,
  publisher: document.publisher,
  claim: finding.claim,
  supporting_excerpt: 'constructed between 1664 and 1667 under Chhatrapati Shivaji Maharaj',
  excerpt_start: 120,
  excerpt_end: 188,
  validation_status: 'quote_found',
  source_kind: null,
  source_tier: null,
  citation: null,
  attested_by: null,
  attested_at: null,
  created_at: '2026-10-28T09:01:00',
};

const now = new Date('2026-10-28T10:00:00Z');

describe('verifyFindingWithSource', () => {
  it('verifies the finding with the real source, quote, tier and verifier', () => {
    const result = verifyFindingWithSource(finding, { document, evidence, verifier: 'writer@tattvaco.com', confirmed: true }, now);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.finding).toMatchObject({
      status: 'Verified',
      source: document.title,
      sourceType: 'Government',
      sourceUrl: document.url,
      evidenceQuote: evidence.supporting_excerpt,
      sourceTier: 'primary',
      sourceDocumentId: 'doc-1',
      evidenceId: 'ev-1',
      verifiedBy: 'writer@tattvaco.com',
      verifiedAt: now.toISOString(),
    });
  });

  it('requires the person to confirm the quote supports the claim', () => {
    const result = verifyFindingWithSource(finding, { document, evidence, verifier: 'w@t.com', confirmed: false }, now);
    expect(result.ok).toBe(false);
  });

  it('requires a known verifier', () => {
    const result = verifyFindingWithSource(finding, { document, evidence, verifier: ' ', confirmed: true }, now);
    expect(result.ok).toBe(false);
  });

  it('refuses evidence whose quote the server has not found in the source', () => {
    const unchecked = { ...evidence, validation_status: 'unverified' as const };
    expect(verifyFindingWithSource(finding, { document, evidence: unchecked, verifier: 'w@t.com', confirmed: true }, now).ok).toBe(false);
  });

  it('refuses evidence checked against a different source', () => {
    const other = { ...evidence, document_id: 'doc-2' };
    expect(verifyFindingWithSource(finding, { document, evidence: other, verifier: 'w@t.com', confirmed: true }, now).ok).toBe(false);
  });

  it('labels open reference sources as secondary', () => {
    const wiki = { ...document, source_tier: 'secondary' as const };
    const result = verifyFindingWithSource(finding, { document: wiki, evidence, verifier: 'w@t.com', confirmed: true }, now);
    expect(result.ok && result.finding.sourceType).toBe('Established Publication');
    expect(sourceTierLabel('primary')).toBe('Government source');
    expect(sourceTierLabel('secondary')).toBe('Open source');
  });
});

describe('verifyFindingWithSource with an uploaded document', () => {
  it('records the upload, with no web link', () => {
    const uploaded: SourceDocument = {
      ...document,
      provider: 'upload',
      url: null,
      file_name: 'ratnagiri-gazetteer.pdf',
      extraction_method: 'ocr',
    };
    const result = verifyFindingWithSource(finding, { document: uploaded, evidence, verifier: 'w@t.com', confirmed: true }, now);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.finding.sourceUrl).toBeUndefined();
    expect(result.finding.provenance).toContain('ratnagiri-gazetteer.pdf');
    expect(result.finding.provenance).toContain('OCR');
  });
});

describe('offline sources', () => {
  const attested: BackendEvidence = {
    ...evidence,
    document_id: null,
    validation_status: 'attested',
    supporting_excerpt: 'molten lead was poured between the foundation blocks',
    source_kind: 'book',
    source_tier: 'secondary',
    citation: {
      kind: 'book', title: 'Sea Forts of the Konkan', author: 'R. V. Gadre', page: '112-113',
      publisher: 'Maharashtra Rajya Sahitya Sanskriti Mandal', year: '1978',
    },
    attested_by: 'user-1',
    attested_at: '2026-10-28T10:00:00',
  };

  it('formats each kind of citation for people to read', () => {
    expect(formatCitation(attested.citation!)).toBe(
      'R. V. Gadre, Sea Forts of the Konkan (Maharashtra Rajya Sahitya Sanskriti Mandal, 1978), p. 112-113'
    );
    expect(formatCitation({
      kind: 'interview', informant: 'Fisherman, Malvan jetty', date: '2026-09-14', place: 'Malvan',
      interviewer: 'A. Kulkarni', consent_confirmed: true,
    })).toBe('Interview with Fisherman, Malvan jetty, Malvan, 2026-09-14 (by A. Kulkarni)');
    expect(formatCitation({ kind: 'field_visit', place: 'Sindhudurg Fort', date: '2026-09-15', observer: 'A. Kulkarni' }))
      .toBe('Field visit to Sindhudurg Fort, 2026-09-15 (observed by A. Kulkarni)');
    expect(formatCitation({
      kind: 'archive_visit', archive: 'Maharashtra State Archives', record_reference: 'Peshwa Daftar, Rumal 214', folio: '17', date: '2026-08-02',
    })).toBe('Maharashtra State Archives, Peshwa Daftar, Rumal 214, folio 17 (seen 2026-08-02)');
  });

  it('verifies a finding as attested, never as quote-checked', () => {
    const result = verifyFindingWithAttestation(finding, { evidence: attested, verifier: 'w@t.com' }, now);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.finding).toMatchObject({
      status: 'Verified',
      verificationMethod: 'attested',
      sourceTier: 'secondary',
      evidenceQuote: attested.supporting_excerpt,
      exactCitation: 'R. V. Gadre, Sea Forts of the Konkan (Maharashtra Rajya Sahitya Sanskriti Mandal, 1978), p. 112-113',
      verifiedBy: 'w@t.com',
    });
    expect(result.finding.provenance).toContain('not machine-checked');
  });

  it('refuses evidence the server has not recorded as attested', () => {
    const result = verifyFindingWithAttestation(finding, { evidence: { ...attested, validation_status: 'unverified' }, verifier: 'w@t.com' }, now);
    expect(result.ok).toBe(false);
  });

  it('labels field research', () => {
    expect(sourceTierLabel('field')).toBe('Field research');
  });
});
