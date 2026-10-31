import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Plus, RotateCcw, Sparkles, Trash2, X } from 'lucide-react';
import type { TattavaProject } from '../../types/project';
import {
  ApiError,
  apiClient,
  type CoverageArea,
  type ResearchBrief,
  type ResearchPlanDetail,
  type ResearchTask,
} from '../../services/apiClient';
import { COVERAGE_AREAS, PARAMETER_LABELS, buildResearchBrief } from '../../services/researchBrief';
import { isUuid } from '../../context/useProjectSync';

interface ResearchPlanPanelProps {
  project: TattavaProject;
  planId?: string;
  onPlanSaved: (planId: string) => void;
  onClose: () => void;
}

const AREA_LABEL: Record<string, string> = {
  ...Object.fromEntries(COVERAGE_AREAS.map(a => [a.id, a.label])),
  user_question: 'Your questions',
  open_question: 'Open questions in the project',
};

const FREEDOM = [
  { id: 'FACTUAL', label: 'Factual', hint: 'Deep coverage of chronology, people and places.' },
  { id: 'GROUNDED_HYBRID', label: 'Grounded drama', hint: 'Documented facts plus texture for drama.' },
  { id: 'CREATIVE', label: 'Creative', hint: 'Texture first: places, daily life, language.' },
] as const;

const EVIDENCE = [
  { id: 'STANDARD', label: 'Standard', hint: 'Any approved source can verify a documented fact.' },
  { id: 'HIGH', label: 'High', hint: 'Government preferred; otherwise two independent open sources.' },
  { id: 'STRICT', label: 'Strict', hint: 'Only government or UNESCO sources verify documented facts.' },
] as const;

const describe = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 404 && error.message === 'Project not found') {
      return 'This project has not been saved to your account yet. Wait a few seconds and try again.';
    }
    return error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
};

const inputClass =
  'w-full bg-[#0a0c12] border border-white/[0.1] rounded-xl px-3 py-1.5 text-sm text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-2">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">{title}</h3>
    {children}
  </section>
);

/** Plan research from the project's parameters: review the brief, then review and approve the plan. */
export const ResearchPlanPanel: React.FC<ResearchPlanPanelProps> = ({ project, planId, onPlanSaved, onClose }) => {
  const [brief, setBrief] = useState<ResearchBrief>(() => buildResearchBrief(project));
  const [areas, setAreas] = useState<Set<CoverageArea>>(() => new Set(COVERAGE_AREAS.map(a => a.id)));
  const [newPlace, setNewPlace] = useState('');
  const [plan, setPlan] = useState<ResearchPlanDetail | null>(null);
  const [newTask, setNewTask] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const synced = isUuid(project.id);
  const editable = plan?.status === 'proposed';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!planId || !synced) return;
    apiClient.getResearchPlanDetail(project.id, planId).then(setPlan).catch(() => setPlan(null));
  }, [planId, project.id, synced]);

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

  const generate = () =>
    run('generate', async () => {
      const created = await apiClient.generateResearchPlan(project.id, brief, [...areas]);
      setPlan(created);
      onPlanSaved(created.id);
    });

  const replaceTask = (task: ResearchTask) =>
    setPlan(p => (p ? { ...p, tasks: p.tasks.map(t => (t.id === task.id ? task : t)) } : p));

  const updateTask = (task: ResearchTask, changes: Parameters<typeof apiClient.updateResearchTask>[2]) =>
    run(`task-${task.id}`, async () => replaceTask(await apiClient.updateResearchTask(project.id, task.id, changes)));

  const addTask = () =>
    run('add', async () => {
      if (!plan) return;
      const task = await apiClient.addResearchTask(project.id, plan.id, { area: 'user_question', question: newTask.trim(), priority: 'high' });
      setPlan(p => (p ? { ...p, tasks: [...p.tasks, task] } : p));
      setNewTask('');
    });

  const approve = () =>
    run('approve', async () => {
      if (!plan) return;
      setPlan(await apiClient.approveResearchPlan(project.id, plan.id));
    });

  const grouped = useMemo(() => {
    const groups = new Map<string, ResearchTask[]>();
    for (const task of plan?.tasks ?? []) {
      groups.set(task.area, [...(groups.get(task.area) ?? []), task]);
    }
    return [...groups.entries()];
  }, [plan]);
  const activeCount = plan?.tasks.filter(t => t.status !== 'removed').length ?? 0;

  const setPerson = (index: number, historical: boolean) =>
    setBrief(b => ({ ...b, people: b.people.map((p, i) => (i === index ? { ...p, historical } : p)) }));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="plan-title">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/[0.1] bg-[#0e1119] shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-white/[0.08]">
          <div className="min-w-0 space-y-1">
            <h2 id="plan-title" className="text-base font-bold text-[#fbf8f3]">
              {plan ? 'Review the research plan' : 'Research brief'}
            </h2>
            <p className="text-xs text-stone-400">
              {plan
                ? 'Each task says why it was proposed. Edit, remove or add tasks, then approve. Nothing is searched before approval.'
                : 'The plan is built from all of this, not only your questions. Check it, mark which people are historical, and choose what to cover.'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
          {!synced ? (
            <p className="text-sm text-stone-300">Research plans run on projects saved to your account. This project is not saved (for example, the demo project).</p>
          ) : !plan ? (
            <>
              <Section title="What">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1 min-w-0">
                    <label htmlFor="brief-subject" className="text-[11px] text-stone-400">Subject</label>
                    <input id="brief-subject" className={inputClass} value={brief.subject ?? ''} onChange={e => setBrief(b => ({ ...b, subject: e.target.value }))} placeholder="Construction of Sindhudurg fort" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <label htmlFor="brief-themes" className="text-[11px] text-stone-400">Themes (comma separated)</label>
                    <input id="brief-themes" className={inputClass} value={brief.themes.join(', ')} onChange={e => setBrief(b => ({ ...b, themes: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} />
                  </div>
                </div>
                {brief.premise && <p className="text-xs text-stone-400 break-words">Premise: {brief.premise}</p>}
              </Section>

              <Section title="Where and when">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1 min-w-0">
                    <label htmlFor="brief-era" className="text-[11px] text-stone-400">Era</label>
                    <input id="brief-era" className={inputClass} value={brief.setting.era ?? ''} onChange={e => setBrief(b => ({ ...b, setting: { ...b.setting, era: e.target.value } }))} placeholder="17th century Maratha period" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <label htmlFor="brief-range" className="text-[11px] text-stone-400">Years</label>
                    <input id="brief-range" className={inputClass} value={brief.setting.time_range ?? ''} onChange={e => setBrief(b => ({ ...b, setting: { ...b.setting, time_range: e.target.value } }))} placeholder="1664-1667" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {brief.setting.places.map((place, i) => (
                    <span key={`${place.name}-${i}`} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs text-stone-200">
                      {place.name}
                      <button aria-label={`Remove ${place.name}`} onClick={() => setBrief(b => ({ ...b, setting: { ...b.setting, places: b.setting.places.filter((_, j) => j !== i) } }))} className="text-stone-500 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <form
                  className="flex gap-2"
                  onSubmit={e => {
                    e.preventDefault();
                    if (!newPlace.trim()) return;
                    setBrief(b => ({ ...b, setting: { ...b.setting, places: [...b.setting.places, { name: newPlace.trim() }] } }));
                    setNewPlace('');
                  }}
                >
                  <label htmlFor="brief-place" className="sr-only">Add a place</label>
                  <input id="brief-place" className={inputClass} value={newPlace} onChange={e => setNewPlace(e.target.value)} placeholder="Add a place" />
                  <button type="submit" className="px-3 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white">Add</button>
                </form>
              </Section>

              <Section title="Who">
                {brief.people.length === 0 ? (
                  <p className="text-xs text-stone-500">No characters yet.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {brief.people.map((person, i) => (
                      <li key={`${person.name}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <span className="text-sm text-stone-200 min-w-0 truncate">
                          {person.name}{person.role ? <span className="text-stone-500"> · {person.role}</span> : null}
                        </span>
                        <label className="inline-flex items-center gap-1.5 text-xs text-stone-300 shrink-0 cursor-pointer">
                          <input type="checkbox" checked={person.historical} onChange={e => setPerson(i, e.target.checked)} className="accent-amber-400" />
                          Real historical person
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Section title="Creative freedom">
                  <div className="space-y-1.5">
                    {FREEDOM.map(f => (
                      <label key={f.id} className="flex items-start gap-2 text-xs text-stone-300 cursor-pointer">
                        <input type="radio" name="freedom" checked={brief.narrative_freedom === f.id} onChange={() => setBrief(b => ({ ...b, narrative_freedom: f.id }))} className="mt-0.5 accent-amber-400" />
                        <span><strong className="text-stone-100">{f.label}</strong>: {f.hint}</span>
                      </label>
                    ))}
                  </div>
                </Section>
                <Section title="Evidence level">
                  <div className="space-y-1.5">
                    {EVIDENCE.map(f => (
                      <label key={f.id} className="flex items-start gap-2 text-xs text-stone-300 cursor-pointer">
                        <input type="radio" name="evidence" checked={brief.evidence_requirement === f.id} onChange={() => setBrief(b => ({ ...b, evidence_requirement: f.id }))} className="mt-0.5 accent-amber-400" />
                        <span><strong className="text-stone-100">{f.label}</strong>: {f.hint}</span>
                      </label>
                    ))}
                  </div>
                </Section>
              </div>

              <Section title="Language">
                <label htmlFor="brief-language" className="sr-only">Project languages</label>
                <input id="brief-language" className={inputClass} value={brief.language ?? ''} onChange={e => setBrief(b => ({ ...b, language: e.target.value }))} placeholder="Marathi / Hindi / English" />
                <p className="text-[11px] text-stone-500">Searches run in English and in these languages.</p>
              </Section>

              <Section title="Also used from the project">
                <p className="text-xs text-stone-400">
                  {brief.known_facts.length} known facts (not re-researched) · {brief.open_questions.length} open questions ·{' '}
                  {brief.user_questions.length} of your questions · {brief.suggested_areas.length} suggested areas
                  {brief.uploaded_material ? ' · your uploaded material' : ''}
                </p>
              </Section>

              <Section title="Cover these areas">
                <div className="flex flex-wrap gap-1.5">
                  {COVERAGE_AREAS.map(area => {
                    const on = areas.has(area.id);
                    return (
                      <button
                        key={area.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setAreas(prev => {
                          const next = new Set(prev);
                          if (on) next.delete(area.id); else next.add(area.id);
                          return next;
                        })}
                        className={`px-2.5 py-1 rounded-full text-[11px] border ${on ? 'bg-amber-400/20 text-amber-200 border-amber-400/50' : 'bg-white/[0.03] text-stone-500 border-white/[0.08] hover:text-white'}`}
                      >
                        {area.label}
                      </button>
                    );
                  })}
                </div>
              </Section>
            </>
          ) : (
            <>
              {plan.policy && (
                <div className="text-xs text-stone-300 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 space-y-1">
                  <p><strong className="text-stone-100">Search order:</strong> government and UNESCO sites first, then open sources.</p>
                  <p><strong className="text-stone-100">Documented facts:</strong> {plan.policy.documented_fact_rule}</p>
                  <p><strong className="text-stone-100">Search languages:</strong> {plan.policy.search_languages.join(', ')}</p>
                </div>
              )}

              {plan.status === 'approved' && (
                <p className="text-sm text-emerald-300 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Plan approved with {activeCount} tasks. It is ready for the research run.
                </p>
              )}

              {grouped.map(([area, tasks]) => (
                <Section key={area} title={AREA_LABEL[area] ?? area}>
                  <ul className="space-y-2">
                    {tasks.map(task => {
                      const removed = task.status === 'removed';
                      return (
                        <li key={task.id} className={`p-3 rounded-2xl border space-y-2 ${removed ? 'border-white/[0.04] opacity-50' : 'border-white/[0.08] bg-[#0a0c12]/70'}`}>
                          <div className="flex items-start gap-2">
                            {editable && !removed ? (
                              <>
                                <label htmlFor={`task-${task.id}`} className="sr-only">Research question</label>
                                <textarea
                                  id={`task-${task.id}`}
                                  defaultValue={task.question}
                                  rows={2}
                                  onBlur={e => {
                                    const value = e.target.value.trim();
                                    if (value && value !== task.question) updateTask(task, { question: value });
                                  }}
                                  className="flex-1 min-w-0 bg-transparent border border-transparent hover:border-white/[0.1] focus:border-amber-500/60 rounded-lg px-2 py-1 text-sm text-[#fbf8f3] focus:outline-none resize-none"
                                />
                              </>
                            ) : (
                              <p className={`flex-1 min-w-0 text-sm text-[#fbf8f3] ${removed ? 'line-through' : ''}`}>{task.question}</p>
                            )}
                            {editable && (
                              <div className="flex items-center gap-1 shrink-0">
                                {!removed && (
                                  <select
                                    aria-label="Priority"
                                    value={task.priority}
                                    onChange={e => updateTask(task, { priority: e.target.value as ResearchTask['priority'] })}
                                    className="bg-[#0a0c12] border border-white/[0.1] rounded-lg text-[11px] text-stone-300 px-1.5 py-1"
                                  >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                  </select>
                                )}
                                <button
                                  aria-label={removed ? 'Restore task' : 'Remove task'}
                                  onClick={() => updateTask(task, { status: removed ? 'proposed' : 'removed' })}
                                  disabled={busy !== null}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
                                >
                                  {removed ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            )}
                          </div>
                          {task.rationale && <p className="text-xs text-stone-400">Why: {task.rationale}</p>}
                          <div className="flex flex-wrap gap-1">
                            {task.triggered_by.map(param => (
                              <span key={param} className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/30">
                                {PARAMETER_LABELS[param] ?? param}
                              </span>
                            ))}
                            {!editable && <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.04] text-stone-400 border border-white/[0.08]">{task.priority} priority</span>}
                          </div>
                          {(task.people.length > 0 || task.places.length > 0 || task.period) && (
                            <p className="text-[11px] text-stone-500 break-words">
                              {[task.people.join(', '), task.places.join(', '), task.period].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <p className="text-[11px] text-stone-500 break-words">
                            Searches: {task.queries.map(q => `“${q.text}” (${q.language})`).join(', ')}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </Section>
              ))}

              {editable && (
                <form
                  className="flex gap-2"
                  onSubmit={e => {
                    e.preventDefault();
                    if (newTask.trim().length >= 5) addTask();
                  }}
                >
                  <label htmlFor="new-task" className="sr-only">Add a research question</label>
                  <input id="new-task" className={inputClass} value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add your own research question" />
                  <button type="submit" disabled={busy !== null || newTask.trim().length < 5} className="px-3 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white disabled:opacity-50 inline-flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </form>
              )}
            </>
          )}

          {error && (
            <p role="alert" className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{error}</p>
          )}
        </div>

        {synced && (
          <div className="p-4 border-t border-white/[0.08] flex flex-wrap justify-between gap-2">
            {plan ? (
              <>
                <button onClick={() => setPlan(null)} className="px-4 py-2 rounded-full text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/10">
                  Start a new plan
                </button>
                {editable && (
                  <button
                    onClick={approve}
                    disabled={busy !== null || activeCount === 0}
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-400 hover:bg-emerald-300 text-stone-950 disabled:opacity-40 inline-flex items-center gap-1.5"
                  >
                    {busy === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve plan ({activeCount} tasks)
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={generate}
                disabled={busy !== null || areas.size === 0}
                className="ml-auto px-4 py-2 rounded-full text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-stone-950 disabled:opacity-40 inline-flex items-center gap-1.5"
              >
                {busy === 'generate' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {busy === 'generate' ? 'Building plan…' : 'Build research plan'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
