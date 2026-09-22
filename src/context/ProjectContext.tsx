import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  TattavaProject, 
  Character, 
  ImpactAnalysisState, 
  ImpactChangeItem, 
  StoryDirection,
  ApprovalStatus,
  TreatmentData,
  ScreenplayLine,
  SceneItem
} from '../types/project';
import { seedProject, secondaryProjects } from '../data/seedProject';
import { askCopilot } from '../services/geminiService';

export type ScreenId = 
  | 'home' 
  | 'create-project' 
  | 'intake' 
  | 'research' 
  | 'story-exploration' 
  | 'format-template' 
  | 'characters' 
  | 'world' 
  | 'structure' 
  | 'treatment' 
  | 'scene-outline' 
  | 'screenplay' 
  | 'dialogue' 
  | 'qa' 
  | 'visual-dev' 
  | 'production' 
  | 'package';

export interface StepMeta {
  step: number;
  id: ScreenId;
  label: string;
  shortLabel: string;
}

export const PIPELINE_STEPS: StepMeta[] = [
  { step: 1, id: 'create-project', label: 'Create Project', shortLabel: 'Project' },
  { step: 2, id: 'intake', label: 'Project Intake', shortLabel: 'Intake' },
  { step: 3, id: 'research', label: 'Research', shortLabel: 'Research' },
  { step: 4, id: 'story-exploration', label: 'Story Exploration', shortLabel: 'Story' },
  { step: 5, id: 'format-template', label: 'Format & Template', shortLabel: 'Format' },
  { step: 6, id: 'characters', label: 'Characters', shortLabel: 'Characters' },
  { step: 7, id: 'world', label: 'World Building', shortLabel: 'World' },
  { step: 8, id: 'structure', label: 'Story Structure', shortLabel: 'Structure' },
  { step: 9, id: 'treatment', label: 'Treatment & Beat Sheet', shortLabel: 'Treatment' },
  { step: 10, id: 'scene-outline', label: 'Scene Outline', shortLabel: 'Beats' },
  { step: 11, id: 'screenplay', label: 'Screenplay', shortLabel: 'Script' },
  { step: 12, id: 'dialogue', label: 'Dialogue Development', shortLabel: 'Dialogue' },
  { step: 13, id: 'qa', label: 'Continuity & Creative QA', shortLabel: 'Continuity' },
  { step: 14, id: 'visual-dev', label: 'Visual Development', shortLabel: 'Visual Dev' },
  { step: 15, id: 'production', label: 'Production Planning', shortLabel: 'Production' },
  { step: 16, id: 'package', label: 'Package & Delivery', shortLabel: 'Package' }
];

interface ProjectContextType {
  projects: TattavaProject[];
  currentProject: TattavaProject;
  activeScreen: ScreenId;
  currentStepIndex: number; // 1-16 or 0 for home
  isCopilotOpen: boolean;
  impactState: ImpactAnalysisState;
  
  // Navigation
  setActiveScreen: (screen: ScreenId) => void;
  goToStep: (stepNumber: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  openProject: (projectId: string, targetScreen?: ScreenId) => void;
  createNewProject: (data: Partial<TattavaProject>) => string;
  duplicateProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;

  // Project Mutators
  updateCurrentProject: (updater: (prev: TattavaProject) => TattavaProject) => void;
  updateCharacter: (charId: string, updates: Partial<Character>) => void;
  selectStoryDirection: (dirId: string) => void;
  combineDirections: (dirAId: string, dirBId: string, combinedTitle: string) => void;
  selectFormat: (formatId: string) => void;
  selectTemplate: (templateId: string) => void;
  applyDialogueAlternative: (suggestionText: string, characterName: string) => void;
  resolveQAIssue: (issueId: string) => void;
  toggleChecklistItem: (checklistName: 'treatment' | 'package' | 'visual', itemIndex: number) => void;
  submitGreenlight: () => void;
  
  // Impact Engine
  triggerChangeImpact: (charIdOrDescription?: string, field?: string, oldVal?: any, newVal?: any) => void;
  closeImpactModal: () => void;
  approveAndPropagateImpact: () => void;
  
  // Specific Screen Helper Methods
  setProjectFormat: (format: string) => void;
  setProjectTemplate: (template: string) => void;
  updateTreatment: (updates: Partial<TreatmentData>) => void;
  resolveQAInconsistency: (issueId: string) => void;
  updateScreenplayLine: (lineId: string, content: string) => void;
  addScreenplayLine: (line: ScreenplayLine) => void;
  swapDialogueSuggestion: (sugId: string, text: string) => void;
  updateScene: (sceneId: string, updates: Partial<SceneItem>) => void;
  submitForGreenlight: () => void;

  // UI Helpers
  toggleCopilot: () => void;
  setCopilotOpen: (open: boolean) => void;
  copilotMessages: Array<{ sender: 'user' | 'tattava'; text: string; time: string }>;
  sendCopilotMessage: (text: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'tattava_projects_v1';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<TattavaProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    }
    return [seedProject, ...secondaryProjects];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>(seedProject.id);
  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'user' | 'tattava'; text: string; time: string }>>([
    { sender: 'tattava', text: 'Welcome to Tattava! I am your contextual film intelligence partner. Ask me anything about The Last Monsoon, explore directions, or test change impact.', time: '10:24 AM' }
  ]);

  const [impactState, setImpactState] = useState<ImpactAnalysisState>({
    isOpen: false,
    sourceTrigger: '',
    totalAffected: 12,
    summary: {
      characters: 1,
      story: 2,
      scenes: 8,
      dialogue: 3,
      visuals: 4,
      production: 2
    },
    items: []
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const rawProject = projects.find(p => p.id === currentProjectId) || projects[0] || seedProject;
  const currentProject: TattavaProject = {
    ...rawProject,
    format: rawProject.format || rawProject.formats?.find(f => f.isSelected)?.title || 'Feature Film',
    template: rawProject.template || rawProject.templates?.find(t => t.isSelected)?.title || 'Three-Act Classical Thriller',
    screenplayLines: rawProject.screenplayLines || rawProject.screenplay,
    qaInconsistencies: rawProject.qaInconsistencies || rawProject.qaIssues,
    productionPlan: rawProject.productionPlan || rawProject.production,
    packageData: rawProject.packageData || rawProject.package
  };

  const currentStepIndex = (() => {
    const found = PIPELINE_STEPS.find(s => s.id === activeScreen);
    return found ? found.step : 0;
  })();

  const updateCurrentProject = (updater: (prev: TattavaProject) => TattavaProject) => {
    setProjects(prevProjects =>
      prevProjects.map(p => (p.id === currentProjectId ? updater(p) : p))
    );
  };

  const openProject = (projectId: string, targetScreen: ScreenId = 'intake') => {
    setCurrentProjectId(projectId);
    setActiveScreen(targetScreen);
  };

  const goToStep = (stepNumber: number) => {
    const found = PIPELINE_STEPS.find(s => s.step === stepNumber);
    if (found) {
      setActiveScreen(found.id);
    }
  };

  const nextStep = () => {
    const currentIndex = PIPELINE_STEPS.findIndex(s => s.id === activeScreen);
    if (currentIndex >= 0 && currentIndex < PIPELINE_STEPS.length - 1) {
      setActiveScreen(PIPELINE_STEPS[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = PIPELINE_STEPS.findIndex(s => s.id === activeScreen);
    if (currentIndex > 0) {
      setActiveScreen(PIPELINE_STEPS[currentIndex - 1].id);
    } else if (currentIndex === 0) {
      setActiveScreen('home');
    }
  };

  const createNewProject = (data: Partial<TattavaProject>): string => {
    const newId = 'proj-' + Date.now();
    const newProj: TattavaProject = {
      ...seedProject,
      id: newId,
      title: data.title || 'Untitled Project',
      tagline: data.tagline || 'A new cinematic journey.',
      contentType: data.contentType || 'Feature Film',
      language: data.language || 'Hindi',
      genre: data.genre || 'Drama',
      stage: 'Intake',
      progressPercent: 5,
      lastUpdated: 'Just now',
      tags: data.tags || ['Original'],
      status: 'DRAFT',
      ...data
    };
    setProjects(prev => [newProj, ...prev]);
    setCurrentProjectId(newId);
    setActiveScreen('intake');
    return newId;
  };

  const duplicateProject = (projectId: string) => {
    const target = projects.find(p => p.id === projectId);
    if (!target) return;
    const duplicated: TattavaProject = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'proj-' + Date.now(),
      title: `${target.title} (Copy)`,
      lastUpdated: 'Just now',
      status: 'DRAFT'
    };
    setProjects(prev => [duplicated, ...prev]);
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProjectId === projectId) {
      setCurrentProjectId(projects[0]?.id || seedProject.id);
      setActiveScreen('home');
    }
  };

  // CHANGE IMPACT ENGINE
  const triggerChangeImpact = (
    charIdOrDesc: string = 'char-aanya',
    field: string = 'age',
    oldVal: any = 24,
    newVal: any = 34
  ) => {
    const isCustomText = charIdOrDesc.includes('(') || charIdOrDesc.includes('→') || charIdOrDesc.includes(':');
    const sourceTrigger = isCustomText
      ? charIdOrDesc
      : `Changed Aanya's ${field}: ${oldVal} → ${newVal}`;

    const items: ImpactChangeItem[] = [
      {
        id: 'imp-1',
        category: 'Characters',
        objectName: 'Aanya',
        field: 'Age & Psychosocial Stage',
        oldValue: `${oldVal || 24} years old (Fresh aspirant)`,
        newValue: `${newVal || 34} years old (Mature, battle-tested)`,
        reason: 'Shifts character from wide-eyed student idealism to seasoned urgency and systemic burnout.',
        severity: 'High',
        approved: true
      },
      {
        id: 'imp-2',
        category: 'Story',
        objectName: 'Core Narrative Engine',
        field: 'Central Motivation & Stakes',
        oldValue: 'College ambition vs parental expectations',
        newValue: 'Final attempt eligibility limit & existential time pressure',
        reason: 'At 34, civil service age-bars make this her absolute final attempt. Stakes are life-or-death for her career.',
        severity: 'High',
        approved: true
      },
      {
        id: 'imp-3',
        category: 'Story',
        objectName: 'Family Dynamic',
        field: 'Raghav Deshmukh Relationship',
        oldValue: 'Paternal protection of young daughter',
        newValue: 'Peer-level adult confrontation over 10 lost years',
        reason: 'Her father mortgaged the house a decade ago; unstated guilt has fermented into acute family friction.',
        severity: 'High',
        approved: true
      },
      {
        id: 'imp-4',
        category: 'Scenes',
        objectName: 'Scene 1: INT. AARANYA ROOM',
        field: 'Set Dressing & Props',
        oldValue: 'Fresh UPSC textbooks and college notes',
        newValue: 'Dog-eared books from 2018-2024, corporate resignation letter, medicine for father',
        reason: 'Visual environment must convey an adult who sacrificed corporate opportunities to return to the exam.',
        severity: 'High',
        approved: true
      },
      {
        id: 'imp-5',
        category: 'Scenes',
        objectName: 'Scene 3: INT. FAMILY DINING',
        field: 'Dialogue & Subtext',
        oldValue: 'Father offering gentle advice to a novice',
        newValue: 'Strained silence over marriage proposals rejected and family debts',
        reason: 'Cultural context in India shifts dramatically for an unmarried 34-year-old woman in provincial cities.',
        severity: 'High',
        approved: true
      },
      {
        id: 'imp-6',
        category: 'Scenes',
        objectName: 'Scenes 7, 12, 14, 18, 22, 26',
        field: 'Action & Conflict Tone',
        oldValue: 'Student-led protests & hostel camaraderie',
        newValue: 'Seasoned mentor figure to younger batchmates; high risk of blacklisting',
        reason: 'Aanya is now 9 years older than Kabir (25); she naturally functions as the elder strategist of the group.',
        severity: 'Medium',
        approved: true
      },
      {
        id: 'imp-7',
        category: 'Dialogue',
        objectName: 'Scene 1 Voiceover',
        field: 'Opening Monologue',
        oldValue: '"Is there a bigger purpose for me?"',
        newValue: '"Ten years ago I thought time was on my side. Now every rain feels like a countdown."',
        reason: 'Voiceover needs gravitas and awareness of lost years.',
        severity: 'High',
        approved: true
      },
      {
        id: 'imp-8',
        category: 'Dialogue',
        objectName: 'Mother (O.S.) Interaction',
        field: 'Mother Dialogue Tone',
        oldValue: '"Your dreams can wait, beta."',
        newValue: '"How much longer will you punish yourself, Aanya? You are 34."',
        reason: 'Parental concern pivots from student fatigue to matrimonial and biological clock anxieties.',
        severity: 'Medium',
        approved: true
      },
      {
        id: 'imp-9',
        category: 'Dialogue',
        objectName: 'Scene 26 Confrontation with Vikrant',
        field: 'Power Dynamic with Antagonist',
        oldValue: 'Vulnerable victim cornered by power broker',
        newValue: 'Intellectual equal; Vikrant cannot patronize her as a child',
        reason: 'The power dynamic becomes much more lethal when the protagonist has 10 years of analytical endurance.',
        severity: 'High',
        approved: true
      },
      {
        id: 'imp-10',
        category: 'Visuals',
        objectName: 'Character Lookbook (KF-01)',
        field: 'Costume & Makeup Styling',
        oldValue: 'College backpack, bright student kurtis',
        newValue: 'Muted earth tones, understated hair styling, subtle tired eye makeup',
        reason: 'Costume department must reflect a decade of intense study and emotional sacrifice.',
        severity: 'Medium',
        approved: true
      },
      {
        id: 'imp-11',
        category: 'Visuals',
        objectName: 'Visual Color Grading',
        field: 'Palette Shift',
        oldValue: 'Warm golden nostalgic student tones',
        newValue: 'Cooler desaturated monsoon contrast',
        reason: 'Emphasizes noir realism over romantic youth drama.',
        severity: 'Low',
        approved: true
      },
      {
        id: 'imp-12',
        category: 'Production',
        objectName: 'Lead Casting Brief',
        field: 'Casting Age Bracket & Profile',
        oldValue: 'Target Actor Age: 22–25',
        newValue: 'Target Actor Age: 30–36 (e.g., Radhika Apte, Tillotama Shome archetype)',
        reason: 'Requires immediate revision of casting shortlist and audition scripts sent to talent agencies.',
        severity: 'High',
        approved: true
      }
    ];

    setImpactState({
      isOpen: true,
      sourceTrigger: `Changed Aanya's ${field}: ${oldVal} → ${newVal}`,
      totalAffected: 12,
      summary: {
        characters: 1,
        story: 2,
        scenes: 8,
        dialogue: 3,
        visuals: 4,
        production: 2
      },
      items
    });
  };

  const closeImpactModal = () => {
    setImpactState(prev => ({ ...prev, isOpen: false }));
  };

  const approveAndPropagateImpact = () => {
    // Apply changes downstream into the current project state
    updateCurrentProject(prev => {
      const updatedChars = prev.characters.map(c => {
        if (c.name === 'Aanya' || c.id === 'char-aanya') {
          return {
            ...c,
            age: 34,
            tags: ['Resilient', 'Strategic', 'Battle-tested'],
            arc: 'Exhaustion → Critical Breakthrough → Decisive Agency',
            quote: 'Ten years of waiting ends tonight.'
          };
        }
        return c;
      });

      // Update Screenplay Scene 1 heading & action
      const updatedScreenplay = prev.screenplay.map(line => {
        if (line.id === 'sp2') {
          return {
            ...line,
            content: 'A dimly lit room. Rain taps against the window. AARANYA (34) sits at her desk, surrounded by dog-eared UPSC volumes spanning a decade, cold chai, and a countdown marked on her calendar.'
          };
        }
        if (line.id === 'sp6') {
          return {
            ...line,
            content: 'Ten years ago I thought time was on my side. Now every rain feels like a countdown.'
          };
        }
        return line;
      });

      // Update Dialogue suggestions
      const updatedDialogue = [
        {
          id: 'ds1',
          character: 'AARANYA',
          label: 'battle-tested & urgent',
          text: 'This is my final attempt, Maa. If I don’t stand for the truth now, what was the point of 10 years of sacrifice?',
          tone: 'Urgent, Resolute'
        },
        {
          id: 'ds2',
          character: 'MOTHER (O.S.)',
          label: 'deep parental anxiety',
          text: 'How much longer will you punish yourself, Aanya? The town talks. You are 34.',
          tone: 'Strained, Fearful'
        },
        {
          id: 'ds3',
          character: 'AARANYA',
          label: 'quiet certainty',
          text: 'Let them talk. Some debts can only be paid by finishing the fight.',
          tone: 'Cold Determination'
        }
      ];

      return {
        ...prev,
        characters: updatedChars,
        screenplay: updatedScreenplay,
        dialogueSuggestions: updatedDialogue,
        lastUpdated: 'Updated just now (Impact Propagated)'
      };
    });

    setImpactState(prev => ({ ...prev, isOpen: false }));
  };

  const updateCharacter = (charId: string, updates: Partial<Character>) => {
    const char = currentProject.characters.find(c => c.id === charId);
    if (!char) return;

    // Check if age or crucial trait is changing on Aanya
    if (char.name === 'Aanya' && updates.age !== undefined && updates.age !== char.age) {
      triggerChangeImpact(charId, 'age', char.age, updates.age);
      return;
    }

    updateCurrentProject(prev => ({
      ...prev,
      characters: prev.characters.map(c => (c.id === charId ? { ...c, ...updates } : c))
    }));
  };

  const selectStoryDirection = (dirId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      selectedDirectionId: dirId,
      storyDirections: prev.storyDirections.map(d => ({
        ...d,
        isSelected: d.id === dirId
      }))
    }));
  };

  const combineDirections = (dirAId: string, dirBId: string, combinedTitle: string) => {
    const dirA = currentProject.storyDirections.find(d => d.id === dirAId) || currentProject.storyDirections[0];
    const dirB = currentProject.storyDirections.find(d => d.id === dirBId) || currentProject.storyDirections[1];

    const newDirection: StoryDirection = {
      id: 'sd-combined-' + Date.now(),
      badgeLetter: 'D',
      title: combinedTitle || `${dirA.title} × ${dirB.title}`,
      logline: `A high-stakes synthesis: ${dirA.protagonistArc} set against ${dirB.narrativeEngine}, fusing intense personal sacrifice with unyielding political confrontation.`,
      genre: `${dirA.genre} + ${dirB.genre}`,
      narrativeEngine: `Blends ${dirA.narrativeEngine} with the emotional intimacy of ${dirB.narrativeEngine}`,
      protagonistArc: `${dirA.protagonistArc} bolstered by profound family reconciliation`,
      conflict: `Double crucible: systemic state conspiracy and deep generational reckoning`,
      stakes: 'Exposing corrupt state machinery while preserving core family dignity',
      theme: `${dirA.theme} & ${dirB.theme}`,
      tone: 'Grounded, Emotionally Shattering, Tense',
      audience: 'Broad Four-Quadrant Theatrical + Prestige OTT',
      potential: 'Maximum (High Commercial + Critical Acclaim)',
      risks: 'Requires deft balancing of personal emotional beats and fast-paced investigative thriller rhythm',
      strengths: 'Combines the best of high plot urgency with deep character empathy',
      tags: ['Synthesized', 'High-Stakes', 'Character-Driven'],
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      isSelected: true
    };

    updateCurrentProject(prev => ({
      ...prev,
      selectedDirectionId: newDirection.id,
      storyDirections: [
        ...prev.storyDirections.map(d => ({ ...d, isSelected: false })),
        newDirection
      ]
    }));
  };

  const selectFormat = (formatId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      formats: prev.formats.map(f => ({
        ...f,
        isSelected: f.id === formatId
      }))
    }));
  };

  const selectTemplate = (templateId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      templates: prev.templates.map(t => ({
        ...t,
        isSelected: t.id === templateId
      }))
    }));
  };

  const applyDialogueAlternative = (suggestionText: string, characterName: string) => {
    updateCurrentProject(prev => {
      const updatedScreenplay = [...prev.screenplay];
      // Replace the dialogue line
      const targetIndex = updatedScreenplay.findIndex(l => l.type === 'dialogue' && (!characterName || characterName === 'AARANYA'));
      if (targetIndex >= 0) {
        updatedScreenplay[targetIndex] = {
          ...updatedScreenplay[targetIndex],
          content: suggestionText
        };
      }
      return {
        ...prev,
        screenplay: updatedScreenplay
      };
    });
  };

  const resolveQAIssue = (issueId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      qaIssues: prev.qaIssues.map(q => (q.id === issueId ? { ...q, status: 'Resolved' } : q))
    }));
  };

  const toggleChecklistItem = (checklistName: 'treatment' | 'package' | 'visual', itemIndex: number) => {
    updateCurrentProject(prev => {
      if (checklistName === 'treatment') {
        const list = [...prev.treatment.checklist];
        list[itemIndex] = { ...list[itemIndex], completed: !list[itemIndex].completed };
        return { ...prev, treatment: { ...prev.treatment, checklist: list } };
      } else if (checklistName === 'package') {
        const list = [...prev.package.checklist];
        list[itemIndex] = { ...list[itemIndex], completed: !list[itemIndex].completed };
        return { ...prev, package: { ...prev.package, checklist: list } };
      } else if (checklistName === 'visual') {
        const list = [...prev.visualDev.visualChecklist];
        list[itemIndex] = { ...list[itemIndex], done: !list[itemIndex].done };
        return { ...prev, visualDev: { ...prev.visualDev, visualChecklist: list } };
      }
      return prev;
    });
  };

  const submitGreenlight = () => {
    updateCurrentProject(prev => ({
      ...prev,
      status: 'APPROVED',
      package: {
        ...prev.package,
        isGreenlit: true,
        stakeholders: prev.package.stakeholders.map(s => ({
          ...s,
          status: 'Approved',
          date: '22 Sep 2026'
        }))
      }
    }));
  };

  const toggleCopilot = () => setIsCopilotOpen(prev => !prev);

  const sendCopilotMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = { sender: 'user' as const, text, time: 'Just now' };
    setCopilotMessages(prev => [...prev, userMsg]);

    const projectSummary = `
Title: ${currentProject.title} (${currentProject.contentType} • ${currentProject.genre} • ${currentProject.language})
Logline: ${currentProject.tagline || currentProject.intent?.premise}
Current Pipeline Stage: ${activeScreen}
Protagonist: ${currentProject.characters?.[0]?.name} (Age: ${currentProject.characters?.[0]?.age}, Role: ${currentProject.characters?.[0]?.role})
Want: ${currentProject.characters?.[0]?.want}
Need: ${currentProject.characters?.[0]?.need}
World Setting: ${currentProject.world?.era}, ${currentProject.world?.settingType}
Format: ${currentProject.format}
Budget Envelope: ₹${currentProject.production?.budgetTotalCr} Cr
    `.trim();

    try {
      const reply = await askCopilot(text, projectSummary, copilotMessages);
      setCopilotMessages(prev => [...prev, { sender: 'tattava', text: reply, time: 'Just now' }]);
    } catch (e) {
      setCopilotMessages(prev => [
        ...prev,
        {
          sender: 'tattava',
          text: `Analyzing "${text}": The narrative engine demonstrates strong commercial velocity and tension. Ensure character conflict peaks at the Midpoint reversal.`,
          time: 'Just now'
        }
      ]);
    }
  };

  const setProjectFormat = (formatTitle: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      format: formatTitle,
      formats: prev.formats.map(f => ({ ...f, isSelected: f.title === formatTitle }))
    }));
  };

  const setProjectTemplate = (templateTitle: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      template: templateTitle,
      templates: prev.templates.map(t => ({ ...t, isSelected: t.title === templateTitle }))
    }));
  };

  const updateTreatment = (updates: Partial<any>) => {
    updateCurrentProject(prev => ({
      ...prev,
      treatment: { ...prev.treatment, ...updates }
    }));
  };

  const resolveQAInconsistency = (issueId: string) => {
    resolveQAIssue(issueId);
  };

  const updateScreenplayLine = (lineId: string, content: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      screenplay: prev.screenplay.map(l => l.id === lineId ? { ...l, content } : l)
    }));
  };

  const addScreenplayLine = (line: any) => {
    updateCurrentProject(prev => ({
      ...prev,
      screenplay: [...prev.screenplay, line]
    }));
  };

  const swapDialogueSuggestion = (_sugId: string, text: string) => {
    applyDialogueAlternative(text, 'AARANYA');
  };

  const updateScene = (sceneId: string, updates: Partial<any>) => {
    updateCurrentProject(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, ...updates } : s)
    }));
  };

  const submitForGreenlight = () => {
    submitGreenlight();
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        activeScreen,
        currentStepIndex,
        isCopilotOpen,
        impactState,
        setActiveScreen,
        goToStep,
        nextStep,
        prevStep,
        openProject,
        createNewProject,
        duplicateProject,
        deleteProject,
        updateCurrentProject,
        updateCharacter,
        selectStoryDirection,
        combineDirections,
        selectFormat,
        selectTemplate,
        applyDialogueAlternative,
        resolveQAIssue,
        toggleChecklistItem,
        submitGreenlight,
        triggerChangeImpact,
        closeImpactModal,
        approveAndPropagateImpact,
        setProjectFormat,
        setProjectTemplate,
        updateTreatment,
        resolveQAInconsistency,
        updateScreenplayLine,
        addScreenplayLine,
        swapDialogueSuggestion,
        updateScene,
        submitForGreenlight,
        toggleCopilot,
        setCopilotOpen: setIsCopilotOpen,
        copilotMessages,
        sendCopilotMessage
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
