import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, FileUp, Landmark, Library, Link2, Loader2, Search, ShieldCheck, X } from 'lucide-react';
import type { ResearchFinding } from '../../types/project';
import {
  ApiError,
  OCR_LANGUAGES,
  apiClient,
  type OfflineCitation,
  type SourceDocument,
  type SourceHit,
  type SourceScope,
  type SourceTier,
} from '../../services/apiClient';
import { sourceTierLabel, verifyFindingWithAttestation, verifyFindingWithSource } from '../../services/researchVerification';
import { isUuid } from '../../context/useProjectSync';

interface SourceVerifyPanelProps {
  finding: ResearchFinding;
  projectId: string;
  verifier: string;
  onVerified: (finding: ResearchFinding) => void;
  onClose: () => void;
}

const SCOPES: Array<{ id: SourceScope; label: string; hint: string }> = [
  { id: 'primary', label: 'Government', hint: 'Central and state government sites and UNESCO' },
  { id: 'secondary', label: 'Open sources', hint: 'Open reference sites such as Oxford, archive.org and JSTOR' },
  { id: 'wikipedia', label: 'Wikipedia', hint: 'Wikipedia articles' },
];

type OfflineKind = OfflineCitation['kind'];

/** The details each kind of offline source must record (server/app/schemas.py). */
const OFFLINE_FIELDS: Record<OfflineKind, { label: string; fields: Array<{ key: string; label: string; required: boolean; placeholder: string }> }> = {
  book: {
    label: 'Book (not online)',
    fields: [
      { key: 'title', label: 'Book title', required: true, placeholder: 'Sea Forts of the Konkan' },
      { key: 'author', label: 'Author', required: true, placeholder: 'R. V. Gadre' },
      { key: 'page', label: 'Page(s)', required: true, placeholder: '112-113' },
      { key: 'publisher', label: 'Publisher', required: false, placeholder: 'Maharashtra Rajya Sahitya Sanskriti Mandal' },
      { key: 'year', label: 'Year', required: false, placeholder: '1978' },
    ],
  },
  interview: {
    label: 'Interview or oral history',
    fields: [
      { key: 'informant', label: 'Who was interviewed', required: true, placeholder: 'Name, or a description if the name is withheld' },
      { key: 'date', label: 'Date', required: true, placeholder: '2026-09-14' },
      { key: 'place', label: 'Place', required: true, placeholder: 'Malvan, Sindhudurg district' },
      { key: 'interviewer', label: 'Interviewer', required: true, placeholder: 'A. Kulkarni' },
      { key: 'recording_reference', label: 'Recording or notes reference', required: false, placeholder: 'Audio file MLV-014' },
      { key: 'language', label: 'Language', required: false, placeholder: 'Malvani' },
    ],
  },
  field_visit: {
    label: 'Field visit',
    fields: [
      { key: 'place', label: 'Place visited', required: true, placeholder: 'Sindhudurg Fort, north rampart' },
      { key: 'date', label: 'Date', required: true, placeholder: '2026-09-15' },
      { key: 'observer', label: 'Observer', required: true, placeholder: 'A. Kulkarni' },
      { key: 'notes', label: 'Notes', required: false, placeholder: 'Photos 112-140 on the project drive' },
    ],
  },
  archive_visit: {
    label: 'Archive visit',
    fields: [
      { key: 'archive', label: 'Archive', required: true, placeholder: 'Maharashtra State Archives, Pune' },
      { key: 'record_reference', label: 'Collection and record', required: true, placeholder: 'Peshwa Daftar, Rumal 214' },
      { key: 'folio', label: 'Folio or page', required: true, placeholder: '17' },
      { key: 'date', label: 'Date seen', required: true, placeholder: '2026-08-02' },
    ],
  },
};

const describe = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 404 && error.message === 'Project not found') {
      return 'This project has not been saved to your account yet. Wait a few seconds and try again.';
    }
    return error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
};

const TierBadge: React.FC<{ tier: SourceTier }> = ({ tier }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${
      tier === 'primary'
        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
        : 'bg-sky-500/15 text-sky-300 border-sky-500/40'
    }`}
  >
    {tier === 'primary' ? <Landmark className="w-3 h-3" /> : <Library className="w-3 h-3" />}
    {sourceTierLabel(tier)}
  </span>
);

/**
 * Verify a finding against a real source: search approved sites (government first), store the
 * source, quote the passage that supports the claim, and let the server check the quote.
 */
export const SourceVerifyPanel: React.FC<SourceVerifyPanelProps> = ({ finding, projectId, verifier, onVerified, onClose }) => {
  const [scope, setScope] = useState<SourceScope>('primary');
  const [query, setQuery] = useState(finding.claim.slice(0, 200));
  const [results, setResults] = useState<SourceHit[] | null>(null);
  const [stored, setStored] = useState<SourceDocument[]>([]);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [upload, setUpload] = useState<{
    file: File | null; title: string; publisher: string; tier: SourceTier; languages: string[]; rights: boolean;
  }>({ file: null, title: '', publisher: '', tier: 'primary', languages: ['eng'], rights: false });

  const [offline, setOffline] = useState<{
    kind: OfflineKind; values: Record<string, string>; tier: SourceTier; consent: boolean; excerpt: string; attested: boolean;
  }>({ kind: 'book', values: {}, tier: 'secondary', consent: false, excerpt: '', attested: false });

  const [document, setDocument] = useState<(SourceDocument & { text: string }) | null>(null);
  const [excerpt, setExcerpt] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  const syncedProject = isUuid(projectId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!syncedProject) return;
    apiClient.listSources(projectId).then(setStored).catch(() => setStored([]));
  }, [projectId, syncedProject]);

  const run = async (label: string, action: () => Promise<void>) => {
    setBusy(label);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(null);
    }
  };

  const search = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length < 2) return;
    run('search', async () => setResults(await apiClient.searchSources(projectId, query.trim(), scope)));
  };

  const open = (load: () => Promise<SourceDocument>) =>
    run('open', async () => {
      const saved = await load();
      const full = await apiClient.getSource(projectId, saved.id);
      setStored(prev => (prev.some(d => d.id === saved.id) ? prev : [...prev, saved]));
      setDocument(full);
      setExcerpt('');
      setConfirmed(false);
    });

  const openHit = (hit: SourceHit) =>
    open(() =>
      scope === 'wikipedia'
        ? apiClient.fetchWikipediaSource(projectId, hit.title)
        : apiClient.fetchSourceUrl(projectId, hit.url)
    );

  const uploadReady =
    upload.file !== null && upload.title.trim() !== '' && upload.publisher.trim() !== '' && upload.rights && upload.languages.length > 0;

  const submitUpload = () => {
    if (!upload.file) return;
    const file = upload.file;
    open(() =>
      apiClient.uploadSource(projectId, {
        file,
        title: upload.title.trim(),
        publisher: upload.publisher.trim(),
        declaredTier: upload.tier,
        rightsConfirmed: upload.rights,
        ocrLanguages: upload.languages.join('+'),
      })
    );
  };

  const toggleLanguage = (code: string) =>
    setUpload(u => {
      if (u.languages.includes(code)) return { ...u, languages: u.languages.filter(c => c !== code) };
      return u.languages.length >= 4 ? u : { ...u, languages: [...u.languages, code] };
    });

  const offlineSpec = OFFLINE_FIELDS[offline.kind];
  const offlineReady =
    offlineSpec.fields.every(f => !f.required || (offline.values[f.key] ?? '').trim() !== '') &&
    offline.excerpt.trim().split(/\s+/).length >= 5 &&
    offline.attested &&
    (offline.kind !== 'interview' || offline.consent);

  const saveOffline = () =>
    run('offline', async () => {
      const values = Object.fromEntries(
        offlineSpec.fields
          .map(f => [f.key, (offline.values[f.key] ?? '').trim()] as const)
          .filter(([, value]) => value !== '')
      );
      const citation = {
        kind: offline.kind,
        ...values,
        ...(offline.kind === 'interview' ? { consent_confirmed: offline.consent } : {}),
      } as OfflineCitation;
      const evidence = await apiClient.createAttestedEvidence(projectId, {
        claim: finding.claim,
        excerpt: offline.excerpt.trim(),
        sourceTier: offline.tier,
        citation,
        attested: offline.attested,
      });
      const result = verifyFindingWithAttestation(finding, { evidence, verifier }, new Date());
      if (!result.ok) throw new Error(result.error);
      onVerified(result.finding);
    });

  const captureSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !readerRef.current) return;
    if (!readerRef.current.contains(selection.anchorNode)) return;
    const text = selection.toString().trim();
    if (text) setExcerpt(text);
  };

  const verify = () => {
    if (!document) return;
    run('verify', async () => {
      const evidence = await apiClient.createEvidence(projectId, {
        claim: finding.claim,
        documentId: document.id,
        supportingExcerpt: excerpt,
      });
      const result = verifyFindingWithSource(finding, { document, evidence, verifier, confirmed }, new Date());
      if (!result.ok) throw new Error(result.error);
      onVerified(result.finding);
    });
  };

  const activeScope = SCOPES.find(s => s.id === scope)!;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-verify-title"
    >
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-white/[0.1] bg-[#0e1119] shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-white/[0.08]">
          <div className="min-w-0 space-y-1">
            <h2 id="source-verify-title" className="text-base font-bold text-[#fbf8f3]">
              {document ? 'Quote the passage that supports the claim' : 'Find a source for this finding'}
            </h2>
            <p className="text-xs text-stone-400 break-words">“{finding.claim}”</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {!syncedProject ? (
            <p className="text-sm text-stone-300">
              Source checks run on your saved projects. This project is not saved to your account (for example, the demo project), so it cannot be verified here.
            </p>
          ) : !document ? (
            <>
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Where to search">
                {SCOPES.map(s => (
                  <button
                    key={s.id}
                    role="tab"
                    aria-selected={scope === s.id}
                    onClick={() => {
                      setScope(s.id);
                      setResults(null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      scope === s.id
                        ? 'bg-amber-400 text-stone-950 border-amber-400'
                        : 'bg-white/[0.04] text-stone-300 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-500">{activeScope.hint}. Government sources come first; use open sources where they have nothing.</p>

              <form onSubmit={search} className="flex gap-2">
                <label htmlFor="source-query" className="sr-only">Search query</label>
                <input
                  id="source-query"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 min-w-0 bg-[#0a0c12] border border-white/[0.1] rounded-full px-4 py-2 text-sm text-[#fbf8f3] focus:outline-none focus:border-amber-500/60"
                />
                <button
                  type="submit"
                  disabled={busy !== null}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-stone-950 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {busy === 'search' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Search
                </button>
              </form>

              {results && (
                <ul className="space-y-2">
                  {results.length === 0 && (
                    <li className="text-xs text-stone-400">No results on these sites. Try different words, or another source type.</li>
                  )}
                  {results.map(hit => (
                    <li key={hit.url} className="p-3 rounded-2xl border border-white/[0.08] bg-[#0a0c12]/70 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-[#fbf8f3] break-words min-w-0">{hit.title}</span>
                        <TierBadge tier={hit.source_tier} />
                      </div>
                      <p className="text-xs text-stone-400 break-words">{hit.snippet}</p>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <a href={hit.url} target="_blank" rel="noreferrer" className="text-[11px] text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 break-all">
                          <ExternalLink className="w-3 h-3 shrink-0" /> {hit.url}
                        </a>
                        <button
                          onClick={() => openHit(hit)}
                          disabled={busy !== null}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white disabled:opacity-50"
                        >
                          Read this source
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                <label htmlFor="source-link" className="text-xs font-semibold text-stone-300 inline-flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" /> Or add a link from a government or open reference site
                </label>
                <div className="flex gap-2">
                  <input
                    id="source-link"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    placeholder="https://asi.nic.in/..."
                    className="flex-1 min-w-0 bg-[#0a0c12] border border-white/[0.1] rounded-full px-4 py-2 text-sm text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60"
                  />
                  <button
                    onClick={() => open(() => apiClient.fetchSourceUrl(projectId, link.trim()))}
                    disabled={busy !== null || link.trim().length < 8}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white disabled:opacity-50"
                  >
                    Read link
                  </button>
                </div>
              </div>

              <details className="pt-3 border-t border-white/[0.06] group">
                <summary className="text-xs font-semibold text-stone-300 inline-flex items-center gap-1.5 cursor-pointer list-none">
                  <FileUp className="w-3.5 h-3.5" /> Or upload a document you are allowed to use (PDF, Word, text, or a scan)
                </summary>
                <div className="mt-3 space-y-3">
                  <input
                    id="upload-file"
                    type="file"
                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.tif,.tiff,.webp,application/pdf,text/plain,image/*"
                    onChange={e => setUpload(u => ({ ...u, file: e.target.files?.[0] ?? null }))}
                    aria-label="Document to upload"
                    className="block w-full text-xs text-stone-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-full file:border-0 file:bg-white/[0.1] file:text-white file:text-xs"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1 min-w-0">
                      <label htmlFor="upload-title" className="text-[11px] text-stone-400">Title (book, report or record)</label>
                      <input
                        id="upload-title"
                        value={upload.title}
                        onChange={e => setUpload(u => ({ ...u, title: e.target.value }))}
                        placeholder="Ratnagiri District Gazetteer (1962)"
                        className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-xl px-3 py-1.5 text-sm text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <label htmlFor="upload-publisher" className="text-[11px] text-stone-400">Publisher or author</label>
                      <input
                        id="upload-publisher"
                        value={upload.publisher}
                        onChange={e => setUpload(u => ({ ...u, publisher: e.target.value }))}
                        placeholder="Gazetteers Department, Government of Maharashtra"
                        className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-xl px-3 py-1.5 text-sm text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                  </div>
                  <fieldset className="space-y-1">
                    <legend className="text-[11px] text-stone-400">What kind of document is it?</legend>
                    <div className="flex flex-wrap gap-3 text-xs text-stone-300">
                      <label className="inline-flex items-center gap-1.5">
                        <input type="radio" name="upload-tier" checked={upload.tier === 'primary'} onChange={() => setUpload(u => ({ ...u, tier: 'primary' }))} className="accent-amber-400" />
                        Government or UNESCO publication
                      </label>
                      <label className="inline-flex items-center gap-1.5">
                        <input type="radio" name="upload-tier" checked={upload.tier === 'secondary'} onChange={() => setUpload(u => ({ ...u, tier: 'secondary' }))} className="accent-amber-400" />
                        Book, journal or other reference
                      </label>
                    </div>
                  </fieldset>
                  <fieldset className="space-y-1">
                    <legend className="text-[11px] text-stone-400">Languages in the document (used to read scans; up to 4)</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {OCR_LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          type="button"
                          aria-pressed={upload.languages.includes(lang.code)}
                          onClick={() => toggleLanguage(lang.code)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] border ${
                            upload.languages.includes(lang.code)
                              ? 'bg-amber-400/20 text-amber-200 border-amber-400/50'
                              : 'bg-white/[0.03] text-stone-400 border-white/[0.08] hover:text-white'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <label className="flex items-start gap-2 text-xs text-stone-300 cursor-pointer">
                    <input type="checkbox" checked={upload.rights} onChange={e => setUpload(u => ({ ...u, rights: e.target.checked }))} className="mt-0.5 accent-amber-400" />
                    <span>I am allowed to use this document for research (I own it, it is public, or I have permission).</span>
                  </label>
                  <button
                    onClick={submitUpload}
                    disabled={busy !== null || !uploadReady}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {busy === 'open' && upload.file ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                    Upload and read
                  </button>
                  <p className="text-[11px] text-stone-500">Scans are read with OCR, which can take a minute for long documents. Check the text before quoting it.</p>
                </div>
              </details>

              <details className="pt-3 border-t border-white/[0.06]">
                <summary className="text-xs font-semibold text-stone-300 inline-flex items-center gap-1.5 cursor-pointer list-none">
                  <BookOpen className="w-3.5 h-3.5" /> Or record an offline source (book, interview, field visit, archive visit)
                </summary>
                <div className="mt-3 space-y-3">
                  <p className="text-[11px] text-stone-500">
                    Offline sources cannot be checked by the system. They are saved as attested by you and labelled "not machine-checked".
                  </p>
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Kind of offline source">
                    {(Object.keys(OFFLINE_FIELDS) as OfflineKind[]).map(kind => (
                      <button
                        key={kind}
                        type="button"
                        role="radio"
                        aria-checked={offline.kind === kind}
                        onClick={() => setOffline(o => ({ ...o, kind, values: {} }))}
                        className={`px-2.5 py-1 rounded-full text-[11px] border ${
                          offline.kind === kind
                            ? 'bg-amber-400/20 text-amber-200 border-amber-400/50'
                            : 'bg-white/[0.03] text-stone-400 border-white/[0.08] hover:text-white'
                        }`}
                      >
                        {OFFLINE_FIELDS[kind].label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {offlineSpec.fields.map(field => (
                      <div key={`${offline.kind}-${field.key}`} className="space-y-1 min-w-0">
                        <label htmlFor={`offline-${field.key}`} className="text-[11px] text-stone-400">
                          {field.label}{field.required ? '' : ' (optional)'}
                        </label>
                        <input
                          id={`offline-${field.key}`}
                          value={offline.values[field.key] ?? ''}
                          onChange={e => setOffline(o => ({ ...o, values: { ...o.values, [field.key]: e.target.value } }))}
                          placeholder={field.placeholder}
                          className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-xl px-3 py-1.5 text-sm text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60"
                        />
                      </div>
                    ))}
                  </div>
                  {(offline.kind === 'book' || offline.kind === 'archive_visit') && (
                    <fieldset className="space-y-1">
                      <legend className="text-[11px] text-stone-400">Who published it?</legend>
                      <div className="flex flex-wrap gap-3 text-xs text-stone-300">
                        <label className="inline-flex items-center gap-1.5">
                          <input type="radio" name="offline-tier" checked={offline.tier === 'primary'} onChange={() => setOffline(o => ({ ...o, tier: 'primary' }))} className="accent-amber-400" />
                          Government or official record
                        </label>
                        <label className="inline-flex items-center gap-1.5">
                          <input type="radio" name="offline-tier" checked={offline.tier === 'secondary'} onChange={() => setOffline(o => ({ ...o, tier: 'secondary' }))} className="accent-amber-400" />
                          Other publisher
                        </label>
                      </div>
                    </fieldset>
                  )}
                  <div className="space-y-1">
                    <label htmlFor="offline-excerpt" className="text-[11px] text-stone-400">
                      {offline.kind === 'interview' ? 'What they said (quote, or a close paraphrase)' : offline.kind === 'field_visit' ? 'What was observed' : 'The passage, quoted exactly'}
                    </label>
                    <textarea
                      id="offline-excerpt"
                      value={offline.excerpt}
                      onChange={e => setOffline(o => ({ ...o, excerpt: e.target.value }))}
                      rows={3}
                      className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-2xl px-3 py-2 text-sm text-[#fbf8f3] focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                  {offline.kind === 'interview' && (
                    <label className="flex items-start gap-2 text-xs text-stone-300 cursor-pointer">
                      <input type="checkbox" checked={offline.consent} onChange={e => setOffline(o => ({ ...o, consent: e.target.checked }))} className="mt-0.5 accent-amber-400" />
                      <span>The interviewee agreed to be quoted for this project.</span>
                    </label>
                  )}
                  <label className="flex items-start gap-2 text-xs text-stone-300 cursor-pointer">
                    <input type="checkbox" checked={offline.attested} onChange={e => setOffline(o => ({ ...o, attested: e.target.checked }))} className="mt-0.5 accent-amber-400" />
                    <span>I attest this record is accurate and supports the claim. It is saved under {verifier || 'your account'}.</span>
                  </label>
                  <button
                    onClick={saveOffline}
                    disabled={busy !== null || !offlineReady}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {busy === 'offline' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    Save offline source and verify
                  </button>
                </div>
              </details>

              {stored.length > 0 && (
                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  <h3 className="text-xs font-semibold text-stone-300">Sources already in this project</h3>
                  <ul className="space-y-1.5">
                    {stored.map(doc => (
                      <li key={doc.id}>
                        <button
                          onClick={() => open(async () => doc)}
                          disabled={busy !== null}
                          className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] disabled:opacity-50"
                        >
                          <span className="text-xs text-stone-200 truncate min-w-0">{doc.title}</span>
                          <TierBadge tier={doc.source_tier} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0 space-y-1">
                  <button onClick={() => setDocument(null)} className="text-xs text-stone-400 hover:text-white inline-flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to search
                  </button>
                  <p className="text-sm font-semibold text-[#fbf8f3] break-words">{document.title}</p>
                  {document.url ? (
                    <a href={document.url} target="_blank" rel="noreferrer" className="text-[11px] text-sky-400 hover:text-sky-300 break-all">
                      {document.url}
                    </a>
                  ) : (
                    <p className="text-[11px] text-stone-400 break-words">
                      Uploaded file: {document.file_name}{document.publisher ? ` · ${document.publisher}` : ''}
                      {document.extraction_method === 'ocr' ? ' · text read with OCR, check it against the original' : ''}
                    </p>
                  )}
                </div>
                <TierBadge tier={document.source_tier} />
              </div>

              <p className="text-[11px] text-stone-500">Select the passage that supports the claim, or paste it below. It must match the source word for word.</p>
              <div
                ref={readerRef}
                onMouseUp={captureSelection}
                onKeyUp={captureSelection}
                tabIndex={0}
                aria-label="Source text"
                className="max-h-72 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-stone-300 bg-[#0a0c12]/80 border border-white/[0.08] rounded-2xl p-4 focus:outline-none focus:border-amber-500/50"
              >
                {document.text}
              </div>

              <label htmlFor="source-excerpt" className="text-xs font-semibold text-stone-300">Quoted passage</label>
              <textarea
                id="source-excerpt"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                rows={3}
                className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-2xl px-3 py-2 text-sm text-[#fbf8f3] focus:outline-none focus:border-amber-500/60"
              />
              <label className="flex items-start gap-2 text-xs text-stone-300 cursor-pointer">
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-0.5 accent-amber-400" />
                <span>This passage supports the claim. The verification is recorded under {verifier || 'your account'}.</span>
              </label>
            </>
          )}

          {error && (
            <p role="alert" className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {document && (
          <div className="p-4 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={verify}
              disabled={busy !== null || !confirmed || excerpt.trim().split(/\s+/).length < 5}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-400 hover:bg-emerald-300 text-stone-950 disabled:opacity-40 inline-flex items-center gap-1.5"
            >
              {busy === 'verify' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Check quote and verify
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
