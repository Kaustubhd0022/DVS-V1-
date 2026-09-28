import { TattvaCoProject } from '../types/project';

export const seedProject: TattvaCoProject = {
  id: 'proj-the-last-monsoon',
  title: '[SAMPLE DEMO] The Last Monsoon',
  tagline: 'SAMPLE DEMO DATA — Pre-populated for pipeline inspection.',
  posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop',
  contentType: 'Feature Film',
  language: 'Hindi',
  genre: 'Political Thriller',
  stage: 'Pilot Ready / Story Development',
  progressPercent: 78,
  lastUpdated: 'Updated 10 mins ago',
  owner: 'Don Vanzara Story Team',
  visibility: 'Demo Project (Read-Only Template)',
  tags: ['Demo', 'Politics', 'Ambition', 'Truth', 'Redemption'],
  status: 'IN_REVIEW',
  canonicalVersion: 'v1.2-canonical',
  isDemo: true,

  // -------------------------------------------------------------
  // STORY BRAIN — THE PERSISTENT SYSTEM OF RECORD (PILOT BASELINE)
  // -------------------------------------------------------------
  storyBrain: {
    lastUpdated: '28 Sep 2026, 17:15 IST',
    activeEntitiesCount: 28,
    canonFacts: [
      {
        id: 'cf-1',
        statement: 'Aanya Deshmukh is 34 years old, sitting for her sixth and final permissible UPSC civil service attempt under General/EWS age-ceiling regulations.',
        category: 'Character Truth',
        entityIds: ['char-aanya'],
        source: 'Approved Character Psychometrics & Decision Log #CD-01',
        dateEstablished: '26 Sep 2026',
        isLocked: true,
        version: 'v1.2',
        tags: ['Protagonist', 'Age Ceiling', 'Stakes']
      },
      {
        id: 'cf-2',
        statement: 'Raghav Deshmukh mortgaged his ancestral printing press in Wardha in 2018 to finance Aanya’s initial preparation, creating an unstated 10-year family debt of ₹18 Lakhs.',
        category: 'Timeline',
        entityIds: ['char-raghav', 'char-aanya'],
        source: 'Family Dynamics Dossier & Scene 3 Canon',
        dateEstablished: '24 Sep 2026',
        isLocked: true,
        version: 'v1.1',
        tags: ['Backstory', 'Family Debt', 'Emotional Core']
      },
      {
        id: 'cf-3',
        statement: 'Vikrant Singhania holds no official cabinet portfolio; his political power operates through the chairmanship of the Vidarbha Agricultural Relief Trust (VART).',
        category: 'Institutional Reality',
        entityIds: ['char-vikrant'],
        source: 'Political Research Dossier & Legal Clearance',
        dateEstablished: '22 Sep 2026',
        isLocked: true,
        version: 'v1.0',
        tags: ['Antagonist', 'Power Dynamic', 'Bureaucracy']
      },
      {
        id: 'cf-4',
        statement: 'The 2024 Monsoon Flood in Wardha was not caused by precipitation anomalies alone, but by a 48-hour delayed sluice gate release at the Upper Penganga Barrage to protect private warehousing complexes.',
        category: 'Plot Law',
        entityIds: ['loc-wardha', 'char-vikrant'],
        source: 'Hydrological Telemetry Finding RF-05',
        dateEstablished: '23 Sep 2026',
        isLocked: true,
        version: 'v1.1',
        tags: ['Plot Engine', 'Corruption', 'Evidence']
      },
      {
        id: 'cf-5',
        statement: 'Kabir (25) is an RTI activist and investigative photojournalist who operates from an unmapped basement darkroom behind Old Rajinder Nagar market.',
        category: 'Character Truth',
        entityIds: ['char-kabir'],
        source: 'Character Bible: Kabir',
        dateEstablished: '21 Sep 2026',
        isLocked: true,
        version: 'v1.0',
        tags: ['Ally', 'RTI', 'Delhi Ecosystem']
      },
      {
        id: 'cf-6',
        statement: 'Under the Official Secrets Act and Central Civil Services Conduct Rules 1964, Rule 3(1), an aspirant caught accessing or leaking state telemetry faces permanent civil disqualification and non-bailable prosecution.',
        category: 'World Rule',
        entityIds: ['char-aanya'],
        source: 'Legal Research Finding RF-06',
        dateEstablished: '25 Sep 2026',
        isLocked: true,
        version: 'v1.0',
        tags: ['Legal Framework', 'High Stakes', 'Procedural']
      },
      {
        id: 'cf-7',
        statement: 'The physical logbook containing manual gate operation signatures is kept in the Irrigation Sub-Division Vault at Arvi, requiring dual-key biometric entry.',
        category: 'Plot Law',
        entityIds: ['loc-wardha'],
        source: 'Technical Field Research Notes',
        dateEstablished: '24 Sep 2026',
        isLocked: true,
        version: 'v1.0',
        tags: ['MacGuffin', 'Physical Proof', 'Climax Setup']
      },
      {
        id: 'cf-8',
        statement: 'The story climax takes place during the annual Vidarbha Development Council gala at the Nagpur Heritage Club, on the night before the final Mains merit list is gazetted.',
        category: 'Timeline',
        entityIds: ['char-aanya', 'char-vikrant'],
        source: 'Three-Act Structure Beat 15',
        dateEstablished: '25 Sep 2026',
        isLocked: true,
        version: 'v1.1',
        tags: ['Climax', 'Ticking Clock', 'Setting']
      }
    ],
    creativeDecisions: [
      {
        id: 'cd-1',
        title: 'Aanya Age Raised from 24 to 34 (Final Attempt Pressure)',
        rationale: 'Elevates stakes from wide-eyed student ambition to existential final attempt deadline, 10 years of family guilt, and irreversible adult urgency.',
        author: 'Kaustubh Deshmukh',
        role: 'AI Product Manager',
        date: '26 Sep 2026',
        status: 'Approved',
        impactedAreas: ['Protagonist Arc', 'Scene 1', 'Scene 26 Dialogue', 'Casting Profile']
      },
      {
        id: 'cd-2',
        title: 'Vikrant Antagonist Motivation Grounded in Commercial Real Estate',
        rationale: 'Avoids cartoon villainy; Vikrant genuinely argues industrial agro-warehousing delivers higher regional employment than subsistence cotton farming.',
        author: 'Aarav Mehta',
        role: 'Director',
        date: '24 Sep 2026',
        status: 'Approved',
        impactedAreas: ['Antagonist Arc', 'Scene 18', 'Theme']
      },
      {
        id: 'cd-3',
        title: 'Eliminate Weapons / Shootout from Act III Climax',
        rationale: 'Preserve authentic procedural realism; victory must be achieved through administrative telemetry, institutional RTI leverage, and live public broadcast.',
        author: 'Priya Sen',
        role: 'Lead Writer',
        date: '22 Sep 2026',
        status: 'Approved',
        impactedAreas: ['Act III Climax', 'Scene 28 Script', 'Tone']
      },
      {
        id: 'cd-4',
        title: 'Three-Act Classical Thriller Structure Selected',
        rationale: 'Provides the tightest commercial velocity and clear turning points for a 122-minute theatrical runtime.',
        author: 'Rhea Kapoor',
        role: 'Producer',
        date: '20 Sep 2026',
        status: 'Approved',
        impactedAreas: ['Structure', 'Scene Outline', 'Format']
      }
    ],
    dependencies: [
      {
        id: 'dep-1',
        sourceEntityId: 'char-aanya',
        sourceName: "Aanya's Age (34)",
        targetEntityId: 'sc-1',
        targetName: 'Scene 1: INT. AARANYA ROOM',
        dependencyType: 'Character -> Scene',
        description: 'Room set dressing and opening monologue must reflect a decade of struggle rather than fresh college notes.',
        isStale: false
      },
      {
        id: 'dep-2',
        sourceEntityId: 'char-aanya',
        sourceName: "Aanya's Age (34)",
        targetEntityId: 'sc-4',
        targetName: 'Scene 4: FLASHBACK - WARDHA COLLEGE',
        dependencyType: 'Character -> Scene',
        description: 'Flashback chronology must be calibrated to 2018 (when she was 26), not recent college graduation 2 years ago.',
        isStale: true,
        staleReason: 'Scene 4 still references college graduation from "last summer", conflicting with Canon Fact #CF-01.'
      },
      {
        id: 'dep-3',
        sourceEntityId: 'cf-4',
        sourceName: 'Barrage Gate Delay Fact (#CF-04)',
        targetEntityId: 'sc-14',
        targetName: 'Scene 14: TELEMETRY ANALYSIS',
        dependencyType: 'Canon -> Motivation',
        description: 'Kabir and Aanya inspect digital telemetry stamps matching Upper Penganga Barrage sensor logs.',
        isStale: false
      },
      {
        id: 'dep-4',
        sourceEntityId: 'char-vikrant',
        sourceName: 'Vikrant VART Trust Role (#CF-03)',
        targetEntityId: 'sc-26',
        targetName: 'Scene 26: CONFRONTATION',
        dependencyType: 'Character -> Scene',
        description: 'Dialogue confrontation must reference VART trust charter, not government ministry orders.',
        isStale: false
      }
    ]
  },

  // -------------------------------------------------------------
  // PILOT INSTRUMENTATION & METRICS
  // -------------------------------------------------------------
  pilotMetrics: {
    verificationRate: 88,
    continuityCatchRate: 94,
    candidateAcceptanceRate: 82,
    timeToPackageMins: 135,
    activeEntitiesCount: 28,
    canonicalFactsCount: 8,
    totalAiRuns: 52,
    averageLatencyMs: 195
  },

  // -------------------------------------------------------------
  // AI STORY EVALUATION HARNESS (RUBRIC-BASED QUALITY BENCHMARK)
  // -------------------------------------------------------------
  evaluation: {
    overallScore: 87.3,
    readinessStatus: 'Pilot Ready',
    evaluatorModel: 'Tattava Narrative Evaluator v1.0 (Groq LPU / GPT-OSS-120B)',
    evaluatedAt: '28 Sep 2026, 17:00 IST',
    dimensions: [
      {
        id: 'ev-1',
        name: 'Premise & Dramatic Hook',
        score: 93,
        weight: 0.20,
        diagnostic: 'Extremely strong commercial and thematic hook. The collision of high-stakes civil service aspiration with a regional climate crime creates instant visceral engagement.',
        strengths: ['Clear ticking clock (final attempt age ceiling)', 'Relatable Indian social reality', 'Original procedural mystery'],
        gaps: ['Logline needs a sharper phrase for the environmental conspiracy'],
        recommendation: 'Emphasize the artificial flood vs natural monsoon contrast in pitch collateral.'
      },
      {
        id: 'ev-2',
        name: 'Character Depth & Motivations',
        score: 90,
        weight: 0.20,
        diagnostic: 'Protagonist transformation from exhausted candidate (age 34) to strategic whistleblower is psychologically compelling. Father-daughter debt adds deep emotional weight.',
        strengths: ['Uncompromising moral friction', 'Flaw (hyper-rational isolation) creates real jeopardy', 'High emotional investment'],
        gaps: ['Kabir’s personal stakes could be elevated in Act II'],
        recommendation: 'Reveal that Kabir’s elder brother was an irrigation engineer who resigned mysteriously in 2020.'
      },
      {
        id: 'ev-3',
        name: 'Causal Logic & Narrative Drive',
        score: 84,
        weight: 0.20,
        diagnostic: 'Cause-and-effect progression holds strong throughout Act I and Act II. One critical temporal contradiction in Scene 4 flashback requires immediate resolution.',
        strengths: ['Each clue naturally raises institutional resistance', 'No unearned coincidences in investigative beats'],
        gaps: ['Scene 4 flashback has contradictory college graduate age timeline', 'Act II midpoint evidence transfer feels slightly rushed'],
        recommendation: 'Run Canon & Continuity Engine repair on Scene 4 to align with the 10-year backstory.'
      },
      {
        id: 'ev-4',
        name: 'Pacing & Dramatic Tension',
        score: 82,
        weight: 0.15,
        diagnostic: 'Strong momentum leading into midpoint. Act IIB between Scene 17 and Scene 21 needs tighter compression before the second pinch point.',
        strengths: ['Pulse-pounding opening sequence', 'High-tension climax confrontation at the Gala'],
        gaps: ['Study room procedural beats in Act IIB slightly drag pacing'],
        recommendation: 'Intercut Aanya’s study pressure with Vikram’s surveillance closing in on Kabir.'
      },
      {
        id: 'ev-5',
        name: 'Thematic Cohesion',
        score: 95,
        weight: 0.15,
        diagnostic: 'Exceptional thematic clarity. Explores whether individual integrity is possible inside compromised state machinery without becoming an agent of destruction.',
        strengths: ['Subtle visual and dialogue metaphors on "Monsoon / Truth"', 'Moral ambiguity maintained across both sides'],
        gaps: ['Ensure ending preserves complex bittersweet victory rather than easy Hollywood triumph'],
        recommendation: 'Keep the closing shot on Aanya walking into the examination hall, aware that exposing the truth cost her friends.'
      },
      {
        id: 'ev-6',
        name: 'Canon & World Rule Adherence',
        score: 86,
        weight: 0.10,
        diagnostic: 'World rules regarding UPSC codes and Maharashtra administrative structures are faithfully observed. Minor title drift flagged for Antagonist in Scene 16.',
        strengths: ['Rigorous legal grounding in RTI and Civil Service Conduct Rules', 'Realistic geographical topography (Wardha to Delhi)'],
        gaps: ['Scene 16 dialogue informally refers to Vikrant as "Minister", violating Canon Fact #CF-03'],
        recommendation: 'Replace "Minister Singhania" with "Trustee Singhania" in Scene 16.'
      }
    ],
    criticalRisks: [
      'Scene 4 flashback contains an active timeline contradiction with Aanya’s approved 34-year age (flags 24 vs 34).',
      'Telemetry retrieval in Scene 12 draft incorrectly mentions public Wi-Fi download instead of local SCADA data dump.'
    ],
    keyStrengths: [
      'Authentic procedural Indian political thriller without genre cliches.',
      'Emotionally devastating father-daughter dynamic anchoring high-concept conspiracy.',
      'High market readiness for prestige theatrical and top-tier streaming co-production.'
    ],
    actionItems: [
      'Resolve Continuity Issue #CONT-01 in Canon & Continuity Engine (Auto-repair Scene 4).',
      'Lock revised Scene 1 opening monologue with approved 34-year-old voiceover.',
      'Export final Story Development Package for Producer Sign-Off.'
    ],
    humanSignOff: {
      approvedBy: 'Rhea Kapoor',
      role: 'Creative Producer',
      date: '28 Sep 2026',
      comments: 'Script development is in the top decile of projects. Ready for director camera lock upon resolving Scene 4 timeline continuity.'
    }
  },

  // -------------------------------------------------------------
  // TEAM & CREATIVE COLLABORATORS
  // -------------------------------------------------------------
  teamMembers: [
    { id: 'u1', name: 'Kaustubh Deshmukh', role: 'AI Product Manager', initials: 'KD', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
    { id: 'u2', name: 'Aarav Mehta', role: 'Director', initials: 'AM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
    { id: 'u3', name: 'Rhea Kapoor', role: 'Producer', initials: 'RK', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
    { id: 'u4', name: 'Vikram Rao', role: 'DOP', initials: 'VR', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
    { id: 'u5', name: 'Priya Sen', role: 'Lead Writer', initials: 'PS', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' }
  ],

  // -------------------------------------------------------------
  // INTAKE & AMBIGUITY DETECTION
  // -------------------------------------------------------------
  intent: {
    premise: 'A 34-year-old UPSC aspirant on her final attempt uncovers an engineered flood catastrophe, forcing her to choose between achieving her lifelong civil service dream and exposing the state power brokers responsible for destroying her hometown.',
    protagonist: 'Aanya Deshmukh (34, weary, hyper-analytical, battling 10 years of family debt and systemic burnout)',
    setting: 'Contemporary Delhi coaching hub (Old Rajinder Nagar) and agrarian Vidarbha (Wardha district)',
    conflict: 'Individual civil service ambition vs public conscience and exposure of systemic deception.',
    stakes: 'Her final chance at legal rehabilitation and family dignity vs catastrophic displacement of 40,000 farmers.',
    themes: ['Cost of Ambition', 'State Complicity', 'Truth vs Self-Preservation', 'Generational Guilt'],
    tone: 'Realistic, Gripping, Atmospheric Noir, Deeply Emotional',
    contentType: 'Feature Film',
    language: 'Hindi',
    targetAudience: 'Adults (18+) • Four-Quadrant Theatrical & Prestige OTT',
    status: 'APPROVED',
    storyBrainProposed: true,
    ambiguitiesIdentified: [
      'Clarified: Antagonist is non-elected oligarch operating via public relief trust (Resolved #CD-02)',
      'Clarified: Protagonist age set to 34 to enforce irrevocable final attempt stakes (Resolved #CD-01)',
      'Under Validation: Flashback timeline calibration between 2018 and current day'
    ],
    missingQuestions: [
      'How does Aanya covertly smuggle the digital SCADA drive past the secretariat security checkpoint?',
      'What is the specific leverage Vikrant holds over Raghav Deshmukh’s printing press?',
      'Does the final scene confirm her selection in the revised merit list, or does she remain disqualified?'
    ]
  },

  // -------------------------------------------------------------
  // TRACEABLE RESEARCH DOSSIER WITH PROVENANCE & UNCERTAINTY
  // -------------------------------------------------------------
  researchQuestions: [
    { id: 'rq1', title: 'UPSC Civil Services Examination Rules & Attempt Limits', category: 'Administrative', completed: true },
    { id: 'rq2', title: 'Psychology of Long-Term Aspirants & Burnout Cycles', category: 'Character', completed: true },
    { id: 'rq3', title: 'Old Rajinder Nagar Coaching & Basement Ecosystem', category: 'Setting', completed: true },
    { id: 'rq4', title: 'Hydrological Gate Protocols & Barrage Water Discharge Regulations', category: 'Plot', completed: true },
    { id: 'rq5', title: 'Casualty Documentation: Official vs Grassroots Flood Registers', category: 'Conflict', completed: true },
    { id: 'rq6', title: 'Whistleblower Legal Protections under Central Civil Rules', category: 'Legal', completed: false }
  ],
  researchFindings: [
    {
      id: 'rf1',
      topic: 'Civil Services Attempt Limit & Age Ceilings',
      claim: 'General category aspirants are limited to 6 attempts up to age 32; EWS/OBC relaxations extend to age 35 with 9 attempts.',
      evidence: 'Under Civil Services Examination Rules 2024 (DoPT Notification 13018/1/2023), candidates exceeding 32 without relaxations are permanently debarred. This makes age 34 an absolute final-attempt cliff for candidates.',
      evidenceQuote: '"Candidates who have attained the age of 32 years on 1st August of examination year shall not be eligible, save for prescribed quota relaxations."',
      source: 'Union Public Service Commission Examination Gazette 2024',
      sourceType: 'Government',
      sourceUrl: 'https://upsc.gov.in/examinations/rules/cse-2024-gazette',
      date: '12 Jan 2024',
      confidence: 99,
      status: 'Verified',
      implicationForPlot: 'Validates Aanya’s existential pressure; failing or getting disqualified means total career termination with zero fallback.',
      usedIn: ['Story Brain #CF-01', 'Scene 1', 'Character: Aanya'],
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'rf2',
      topic: 'Psychological Toll & Multi-Year Isolation',
      claim: 'Long-term aspirants (5+ years) report clinical rates of social isolation, familial guilt, and identity foreclosure.',
      evidence: 'Clinical psychiatric evaluation of aspirants in Delhi coaching hubs shows that chronic exam repetition creates severe existential paralysis, where personal identity becomes entirely contingent on competitive rank.',
      evidenceQuote: '"The prolonged liminality of 5-8 years without economic independence produces profound intergenerational tension and unvoiced parental resentment."',
      source: 'NIMHANS Youth Psychiatric Study — Delhi Cohort',
      sourceType: 'Academic',
      sourceUrl: 'https://nimhans.ac.in/research/youth-studies/cse-aspirants-2023',
      date: '10 Feb 2024',
      confidence: 94,
      status: 'Verified',
      implicationForPlot: 'Grounds Aanya’s cynical, razor-sharp dialogue with her mother in Scene 1 and prevents romanticized student cliches.',
      usedIn: ['Character: Aanya', 'Scene 1 Monologue', 'Scene 3'],
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'rf3',
      topic: 'Coaching Hub Density & Subterranean Economy',
      claim: 'Over 250,000 aspirants inhabit 3 square kilometers in Old Rajinder Nagar and Mukherjee Nagar, with extensive unmapped basement libraries.',
      evidence: 'Investigations into urban coaching clusters reveal intense commercialization, basement reading rooms running 24-hour shifts with biometric access, and informal lending syndicates.',
      evidenceQuote: '"Reading halls function on 8-hour shift seat rentals where students sleep and study alternately in subterranean rooms with single access stairwells."',
      source: 'The Hindu Special Investigative Feature',
      sourceType: 'Established Publication',
      sourceUrl: 'https://thehindu.com/investigations/inside-the-delhi-coaching-factory-2024',
      date: '8 Jan 2024',
      confidence: 96,
      status: 'Verified',
      implicationForPlot: 'Provides rich atmospheric set pieces for Scene 5 and Scene 14 (Kabir’s underground darkroom).',
      usedIn: ['World: Delhi Hub', 'Scene 5', 'Scene 14'],
      imageUrl: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'rf4',
      topic: 'Dam Gate Standard Operating Procedures & SCADA Logging',
      claim: 'Dam discharge rules mandate phased releases based on inflow reservoir levels; sudden night discharges violate Central Water Commission manual.',
      evidence: 'The Central Water Commission Dam Safety Manual requires pre-release siren warnings and 6-hour advance notification to downstream revenue authorities. Automated SCADA sensors log every gate opening in non-resettable firmware.',
      evidenceQuote: '"Any non-routine discharge exceeding 15,000 cusecs without prior revenue commissioner clearance constitutes criminal negligence under Section 304A IPC."',
      source: 'Central Water Commission Dam Safety Operations Manual',
      sourceType: 'Primary Source',
      sourceUrl: 'https://cwc.gov.in/dam-safety-manual-2022',
      date: '15 Mar 2024',
      confidence: 97,
      status: 'Verified',
      implicationForPlot: 'The forensic core of the movie: Aanya and Kabir discover that the Upper Penganga gates were deliberately held shut until 3 AM to allow Vikrant’s private cargo trucks to evacuate.',
      usedIn: ['Story Brain #CF-04', 'Scene 14', 'Scene 26'],
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'rf5',
      topic: 'Disputed Flood Casualty Figures in Wardha',
      claim: 'Official state reports record 4 flood fatalities; local Gram Panchayat death registries document 47 drownings and 18 missing.',
      evidence: 'Field audits by independent journalist networks reveal severe discrepancies between district administration flood compensation logs and rural village cremation records.',
      evidenceQuote: '"District Collectorate bulletin listed 4 drowning incidents, while burial registers in Arvi and Hinganghat recorded 47 flood-related deaths within 72 hours."',
      source: 'Vidarbha People’s Audit Consortium Field Dossier',
      sourceType: 'Field Report',
      sourceUrl: 'https://vidarbha-audit.org/wardha-flood-2024-inquest',
      date: '20 Apr 2024',
      confidence: 76,
      status: 'Conflicting',
      implicationForPlot: 'The documentary smoking gun: Aanya finds her father’s printing press was coerced into printing the altered official casualty gazette.',
      usedIn: ['Scene 8', 'Scene 18', 'Story Brain #CF-04'],
      imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'rf6',
      topic: 'State Civil Whistleblower Immunity Precedents',
      claim: 'No definitive judicial precedent grants whistleblower immunity to probationary candidates or exam aspirants who leak confidential state telemetry.',
      evidence: 'Legal research across the Maharashtra Administrative Tribunal (MAT) and Supreme Court reports found zero case law protecting an aspirant who accesses restricted water telemetry before formal service induction.',
      evidenceQuote: '"The Whistleblowers Protection Act 2014 remains largely unenforced regarding non-gazetted applicants. Telemetry disclosure remains prosecutable under the Official Secrets Act."',
      source: 'Vidhi Centre for Legal Policy Briefing',
      sourceType: 'Academic',
      sourceUrl: 'https://vidhilegalpolicy.in/briefs/whistleblower-act-gaps',
      date: '2 May 2024',
      confidence: 42,
      status: 'Insufficient Evidence',
      implicationForPlot: 'System surfaces uncertainty: Aanya has no legal safety net. If she leaks the SCADA files, she will face non-bailable arrest.',
      usedIn: ['Scene 22', 'Scene 28'],
      imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=600&auto=format&fit=crop'
    }
  ],

  // -------------------------------------------------------------
  // STORY EXPLORATION — CANDIDATE DIRECTIONS & RATIONALE
  // -------------------------------------------------------------
  storyDirections: [
    {
      id: 'sd-a',
      badgeLetter: 'A',
      title: 'Procedural Political Thriller (Approved Canon)',
      logline: 'A 34-year-old UPSC aspirant on her final attempt uncovers an engineered flood catastrophe, forcing her to choose between achieving her civil service dream and exposing the state oligarchs responsible for destroying her hometown.',
      genre: 'Political Thriller / Investigative Noir',
      narrativeEngine: 'Ticking clock forensic investigation: telemetry disclosure vs final Mains examination cutoff.',
      protagonistArc: 'Exhausted exam survivor → Unyielding constitutional whistleblower.',
      conflict: 'Individual moral agency vs entrenched institutional power and parental debt.',
      stakes: 'Exposing systemic flood deception vs lifelong criminal blacklisting and family ruin.',
      theme: 'Power, Complicity, Truth vs Silence, The Cost of Survival',
      tone: 'Atmospheric, Tense, Visceral, Grounded Realism',
      audience: 'Urban, Young Adults (18-35), Film Purists, Prestige OTT Demographic',
      potential: 'Maximum (High Commercial Velocity + A-List Theatrical Appeal)',
      risks: 'Requires surgical procedural pacing to ensure technical telemetry remains thrilling for general audiences.',
      strengths: 'Razor-sharp stakes, relatable protagonist urgency, timely socio-political relevance.',
      tags: ['Whistleblower', 'High-Stakes', 'Systemic Truth', 'Canonical'],
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop',
      isSelected: true,
      candidateState: 'CANONICAL',
      rationale: 'Aligns perfectly with the core project premise and incorporates the approved age 34 transition from Decision #CD-01.',
      compTitles: 'Spotlight meets Chinatown set in Contemporary Delhi & Vidarbha'
    },
    {
      id: 'sd-b',
      badgeLetter: 'B',
      title: 'Family Guilt & Generational Drama',
      logline: 'An exhausted daughter navigates the bitter generational reckoning between her father’s bankrupt hopes and her own refusal to compromise her dignity in an elite civil service exam.',
      genre: 'Character Drama / Social Realism',
      narrativeEngine: 'Generational debt and the emotional toxicity of middle-class academic expectations.',
      protagonistArc: 'Guilt-ridden daughter finding authentic self-determination beyond parental validation.',
      conflict: 'Father’s middle-class dream vs daughter’s moral refusal to participate in corrupt selection.',
      stakes: 'Permanent family estrangement and internal self-respect.',
      theme: 'Self-Discovery, Ambition, Family Sacrifice, Generational Trauma',
      tone: 'Intimate, Emotional, Heartfelt, Melancholic',
      audience: 'Wide Family Demographic • Festival & Prestige OTT',
      potential: 'High Critical Acclaim • Moderate Commercial Theatrical',
      risks: 'Lacks external physical thriller urgency and procedural ticking clock.',
      strengths: 'Deep psychological empathy, high dialogue resonance, powerful acting showcase.',
      tags: ['Family Drama', 'Intimate', 'Character-Driven'],
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      isSelected: false,
      candidateState: 'CANDIDATE',
      rationale: 'Alternative direction focusing primarily on the domestic emotional axis rather than the flood conspiracy.',
      compTitles: 'All We Imagine As Light meets 12th Fail'
    },
    {
      id: 'sd-c',
      badgeLetter: 'C',
      title: 'Psychological Identity Noir',
      logline: 'As an aspirant nears her final civil service exam, sleep deprivation and state surveillance blur the lines between genuine investigative paranoia and actual systemic threat.',
      genre: 'Psychological Thriller / Kafkaesque Mystery',
      narrativeEngine: 'Unreliable protagonist perception versus invisible administrative surveillance.',
      protagonistArc: 'Meticulous scholar descending into intense investigative obsession.',
      conflict: 'Protagonist sanity vs state intelligence apparatus.',
      stakes: 'Loss of sanity, freedom, and identity.',
      theme: 'Surveillance, Institutional Gaslighting, Isolation',
      tone: 'Claustrophobic, Ominous, Disorienting',
      audience: 'Cinephiles, Psychological Thriller Enthusiasts',
      potential: 'Cult Critical Appeal • Niche Commercial Theatrical',
      risks: 'May alienate broad mainstream viewers seeking clear narrative resolution.',
      strengths: 'Unprecedented atmospheric dread and distinct cinematic auteur language.',
      tags: ['Psychological', 'Surveillance', 'Claustrophobic'],
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
      isSelected: false,
      candidateState: 'CANDIDATE',
      rationale: 'High-concept auteur route emphasizing psychological dread and state gaslighting.',
      compTitles: 'The Conversation meets Zodiac'
    }
  ],
  selectedDirectionId: 'sd-a',

  // -------------------------------------------------------------
  // FORMAT & TEMPLATES
  // -------------------------------------------------------------
  formats: [
    {
      id: 'fmt-feature',
      title: 'Feature Film',
      duration: '115 – 125 mins',
      description: 'Theatrical feature with tight three-act structure, high cinematic tension, and propulsive dramatic reversals.',
      isRecommended: true,
      isSelected: true,
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'fmt-series',
      title: 'Limited Web Series',
      duration: '6 Episodes × 45 mins',
      description: 'Deep investigative procedural exploring the multi-layered state machinery and character backstories across 6 hours.',
      isRecommended: false,
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=600&auto=format&fit=crop'
    }
  ],
  templates: [
    {
      id: 'tpl-three-act',
      title: 'Three-Act Classical Thriller',
      description: 'Syd Field / McKee classical framework with inciting incident at min 12, midpoint reversal at min 60, and climactic confrontation at min 105.',
      tags: ['Classical', 'High Velocity', 'Commercial'],
      isSelected: true,
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'tpl-heros-journey',
      title: 'The Hero’s Moral Crucible (Vogler)',
      description: 'Mythic structure adapted for modern civic heroism: separation from small town, descent into Delhi underworld, resurrection through truth.',
      tags: ['Character Transformation', 'Mythic', 'Moral Ordeal'],
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
    }
  ],

  // -------------------------------------------------------------
  // CHARACTER INTELLIGENCE (DEEP PSYCHOMETRIC SCHEMAS)
  // -------------------------------------------------------------
  characters: [
    {
      id: 'char-aanya',
      name: 'Aanya Deshmukh',
      role: 'Protagonist',
      age: 34,
      gender: 'Female',
      occupation: '6th-Attempt UPSC Aspirant / Former Junior Hydro-Analyst',
      location: 'Old Rajinder Nagar, Delhi (Origins: Wardha, Maharashtra)',
      tags: ['Resilient', 'Strategic', 'Battle-Tested', 'Hyper-Analytical'],
      quote: 'Ten years of waiting ends tonight. I will not let them drown my town twice.',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      status: 'APPROVED',
      candidateState: 'CANONICAL',
      want: 'To crack the UPSC Civil Services exam with an all-India top 50 rank to clear her father’s debt and claim administrative authority.',
      need: 'To realize that real integrity cannot be granted by an appointment letter, and that true power comes from truth over self-preservation.',
      fear: 'Aging out of eligibility into total economic irrelevance as a thirty-something failure in her provincial hometown.',
      flaw: 'Emotional detachment and excessive cynicism; she initially treats human lives as data points in an exam syllabus.',
      strength: 'Formidable pattern recognition, forensic analysis of administrative documents, and unshakeable psychological stamina under interrogation.',
      secret: 'Personally discovered the anomalous Upper Penganga water sensor reading in 2022 while working as an intern, but buried the report to preserve her candidate eligibility.',
      arc: 'Cynical survivalism → Reluctant investigation → Existential sacrifice for communal justice.',
      voiceStyle: 'Economical, clipped, dry Hindi-English mixed with technical administrative jargon; never raises her voice, but weaponizes quiet facts.',
      contradictions: 'Despises the corrupt bureaucracy while simultaneously spending a decade sacrificing her youth to wear its badge.',
      relationships: [
        {
          targetCharacterId: 'char-raghav',
          targetCharacterName: 'Raghav Deshmukh',
          relationType: 'Father',
          dynamic: 'Tense love poisoned by unspoken financial guilt and a mortgaged home.'
        },
        {
          targetCharacterId: 'char-kabir',
          targetCharacterName: 'Kabir',
          relationType: 'Investigative Ally',
          dynamic: 'Uneasy partnership; Kabir’s idealism irritates her survival instincts, but his RTI courage earns her respect.'
        },
        {
          targetCharacterId: 'char-vikrant',
          targetCharacterName: 'Vikrant Singhania',
          relationType: 'Systemic Antagonist',
          dynamic: 'Lethal intellectual confrontation; Vikrant respects her analytical intelligence and attempts to recruit her before trying to destroy her.'
        }
      ],
      scenesAppeared: [1, 2, 3, 5, 8, 12, 14, 18, 22, 26, 28]
    },
    {
      id: 'char-raghav',
      name: 'Raghav Deshmukh',
      role: 'Father',
      age: 63,
      gender: 'Male',
      occupation: 'Small Commercial Letterpress Printer (Bankrupt)',
      location: 'Wardha, Maharashtra',
      tags: ['Dignified', 'Burdened', 'Proud', 'Fragile'],
      quote: 'A father’s duty is to bleed so his child doesn’t have to beg.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
      status: 'APPROVED',
      candidateState: 'CANONICAL',
      want: 'To see his daughter arrive in Wardha in an official red-beacon government vehicle before he dies.',
      need: 'To forgive himself for failing commercially and to release Aanya from the crushing burden of his expectations.',
      fear: 'Dying as a disgraced bankrupt whose daughter sacrificed her entire youth for his dream.',
      flaw: 'Stubborn pride; refuses to acknowledge that the political world he revered is rotten to the core.',
      strength: 'Unwavering loyalty to the craft of printing and deep communal respect among old Wardha families.',
      secret: 'Coerced into printing the falsified 2024 flood casualty gazettes on his press to prevent bank foreclosure.',
      arc: 'Denial of complicity → Despair → Quiet act of defiance by handing over the original press proofs to Aanya.',
      voiceStyle: 'Poetic, deliberate Marathi-Hindi cadence; speaks in classical literary metaphors with pauses of heavy breathing.',
      contradictions: 'Demands absolute moral purity from Aanya while hiding his own compromised business dealings with Singhania.',
      relationships: [
        {
          targetCharacterId: 'char-aanya',
          targetCharacterName: 'Aanya Deshmukh',
          relationType: 'Daughter',
          dynamic: 'Adoration weighed down by a decade of mortgaged hopes.'
        }
      ],
      scenesAppeared: [3, 8, 18, 28]
    },
    {
      id: 'char-vikrant',
      name: 'Vikrant Singhania',
      role: 'Antagonist',
      age: 52,
      gender: 'Male',
      occupation: 'Chairman, Vidarbha Agricultural Relief Trust (VART) / Agro-Logistics Tycoon',
      location: 'Nagpur & Mumbai',
      tags: ['Pragmatic', 'Formidable', 'Patronizing', 'Powerful'],
      quote: 'Sentimental people write poetry about floods. Practical men build warehouses on high ground.',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
      status: 'APPROVED',
      candidateState: 'CANONICAL',
      want: 'To consolidate a ₹4,000 Crore dry-port logistics hub across the Upper Penganga flood basin with private equity backing.',
      need: 'To maintain the illusion that his ruthless corporate interventions are philanthropic development for a backward region.',
      fear: 'A public forensic audit of the 2024 dam gate telemetry that would void his international credit lines and land titles.',
      flaw: 'Contempt for lower-middle-class aspirants; believes every person has a price or an ideological breaking point.',
      strength: 'Mastery of bureaucratic patronage, flawless legal insulation, and calm, polite conversational menace.',
      secret: 'Authorized the midnight gate release order via personal encrypted satellite phone from a Dubai hotel room.',
      arc: 'Omnipotent patron → Tactical predator → Cornered institutional titan fighting for survival.',
      voiceStyle: 'Cultured, soft-spoken, authoritative Hindi; uses corporate developmental jargon to disguise land theft.',
      contradictions: 'Genuinely spends millions building local hospitals while callously displacing 40,000 villagers for logistics rail spurs.',
      relationships: [
        {
          targetCharacterId: 'char-aanya',
          targetCharacterName: 'Aanya Deshmukh',
          relationType: 'Adversary / Former Protege Prospect',
          dynamic: 'Paternalistic condescension shifting to lethal respect and panic.'
        }
      ],
      scenesAppeared: [16, 18, 26, 27]
    },
    {
      id: 'char-kabir',
      name: 'Kabir Sen',
      role: 'Friend',
      age: 25,
      gender: 'Male',
      occupation: 'RTI Activist & Independent Investigative Photojournalist',
      location: 'Old Rajinder Nagar, Delhi',
      tags: ['Idealistic', 'Tenacious', 'Reckless', 'Empathetic'],
      quote: 'If they can alter the water level on paper, they can alter whether we exist.',
      photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop',
      status: 'APPROVED',
      candidateState: 'CANONICAL',
      want: 'To expose the state water corruption and avenge his mentor who died under suspicious circumstances during the 2022 drought.',
      need: 'To learn that raw moral outrage without institutional tactical discipline simply gets whistleblowers killed.',
      fear: 'Being silenced before the documentary proof is permanently mirrored across public cloud servers.',
      flaw: 'Impulsive; prone to taking reckless physical risks without securing escape routes.',
      strength: 'Relentless investigative stamina, deep technical knowledge of open-source intelligence (OSINT) and satellite data.',
      secret: 'His brother was the junior hydro-engineer who originally documented the SCADA gate manual overrides.',
      arc: 'Impulsive activist → Hardened, disciplined forensic investigator.',
      voiceStyle: 'Rapid, passionate street-smart Hindi; laced with dark journalistic humor and technical GIS terminology.',
      contradictions: 'Passionate champion of the oppressed who frequently neglects his own physical safety and family.',
      relationships: [
        {
          targetCharacterId: 'char-aanya',
          targetCharacterName: 'Aanya Deshmukh',
          relationType: 'Co-Investigator',
          dynamic: 'Catalyst who forces Aanya out of her cynical exam-prepping shell into the fire.'
        }
      ],
      scenesAppeared: [5, 12, 14, 22, 28]
    }
  ],
  selectedCharacterId: 'char-aanya',

  // -------------------------------------------------------------
  // WORLD BUILDING & CANONICAL RULES
  // -------------------------------------------------------------
  world: {
    title: 'The Pressure Chamber: Delhi Coaching Factory & Vidarbha Agro-Hinterland',
    era: 'Contemporary India (2024–2026)',
    primaryLocations: ['Old Rajinder Nagar (Delhi)', 'Wardha District (Maharashtra)', 'Upper Penganga Barrage', 'Nagpur Heritage Club'],
    settingType: 'Urban High-Density & Agrarian Flood-Basin Contrast',
    themes: ['Bureaucratic Architecture', 'Monsoon as Weapon', 'Generational Debt', 'Surveillance'],
    languageNote: 'Multilingual realism: Hindi, Marathi, and Bureaucratic English.',
    heroQuote: 'In Delhi you memorize the laws of the republic. In Vidarbha you discover who owns the river.',
    socioPolitical: 'Deep contrast between Delhi’s abstract policymaking corridors and Vidarbha’s agrarian debt crisis. Administrative exams represent the singular escape hatch for middle-class provincial youth.',
    cultureLifestyle: 'Coaching centers, 24-hour reading rooms, cold street chai, biometric libraries, small printing presses, and rain-soaked administrative secretariat corridors.',
    institutions: 'Union Public Service Commission (UPSC), Central Water Commission (CWC), Vidarbha Agricultural Relief Trust (VART), Maharashtra State Police CID.',
    worldRules: [
      'Telemetry on the Upper Penganga Barrage is stored on an isolated SCADA network; remote extraction requires local terminal authorization.',
      'A civil services aspirant formally chargesheeted under the Official Secrets Act forfeits candidate eligibility immediately upon FIR filing.',
      'Monsoon flood relief disbursements in Maharashtra require dual certification from the District Collector and the authorized regional NGO partner (VART).'
    ],
    locations: [
      {
        id: 'loc-delhi',
        name: 'Old Rajinder Nagar Basement Library',
        subtitle: 'The 24-Hour Subterranean Incubator',
        description: 'Fluorescent-lit basement partitioned into 120 wooden study cubicles. Air smells of damp cement, instant coffee, and anxiety. A biometric turnstile monitors entry.',
        type: 'Urban',
        coordinates: { x: 35, y: 42 },
        imageUrl: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=600&auto=format&fit=crop',
        isPrimary: true
      },
      {
        id: 'loc-wardha',
        name: 'Upper Penganga Barrage & Sluice Gates',
        subtitle: 'The Sovereign Sluice',
        description: 'Brutal concrete monolith straddling the swollen river. Eight massive hydraulic radial gates operated from a central glassed control room. Downstream lies 40,000 hectares of farmland.',
        type: 'Coastal',
        coordinates: { x: 68, y: 72 },
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
        isPrimary: true
      },
      {
        id: 'loc-press',
        name: 'Deshmukh Letterpress Works',
        subtitle: 'The Mortgaged Legacy',
        description: 'An old two-story brick building in Arvi, Wardha. Heavy German Heidelberg cylinder presses covered in oilcloth. Stacks of unsold municipal forms and ancestral debt notices.',
        type: 'Town',
        coordinates: { x: 65, y: 75 },
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
        isPrimary: false
      }
    ]
  },

  // -------------------------------------------------------------
  // STORY STRUCTURE & BEAT SHEET (THREE-ACT THRILLER)
  // -------------------------------------------------------------
  structure: {
    templateName: 'Three-Act Classical Thriller',
    estimatedDurationMins: 122,
    totalSequences: 8,
    keyTurningPoints: 5,
    emotionalPeaks: 6,
    acts: {
      act1: {
        title: 'ACT I: THE FINAL ATTEMPT & THE FLOOD ANOMALY',
        time: '00:00 – 28:00',
        beats: [
          {
            id: 'b1',
            number: 1,
            act: 'ACT I - SETUP',
            timeRange: '00:00 - 10:00',
            title: 'Opening Image & The Pressure Chamber',
            description: 'Establish Aanya (34) in the Delhi basement library. The relentless rain. Calendar marks her 6th and final UPSC attempt. Phone call from her father Raghav reminding her of the family mortgage.',
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
          },
          {
            id: 'b2',
            number: 2,
            act: 'ACT I - SETUP',
            timeRange: '10:00 - 18:00',
            title: 'Inciting Incident: The Disputed Wardha File',
            description: 'Kabir shows Aanya satellite water telemetry for the Wardha flood that drowned 47 people. The official report claims sudden cloudburst, but CWC dam telemetry shows deliberate retention.',
            imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop'
          },
          {
            id: 'b3',
            number: 3,
            act: 'ACT I - SETUP',
            timeRange: '18:00 - 28:00',
            title: 'Plot Point 1: Crossing the Threshold',
            description: 'Aanya verifies the anomaly using her old hydro-engineering credentials. She realizes her father printed the fabricated casualty gazette. She commits to traveling to Wardha to obtain the physical logbook.',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop'
          }
        ]
      },
      act2: {
        title: 'ACT II: THE LABYRINTH & THE MIDPOINT CONFRONTATION',
        time: '28:00 – 85:00',
        beats: [
          {
            id: 'b4',
            number: 4,
            act: 'ACT II - CONFRONTATION',
            timeRange: '28:00 - 45:00',
            title: 'Descent into Wardha & Father’s Secret',
            description: 'Aanya confronts Raghav over the bank loan. He admits Vikrant’s trust paid off the interest in exchange for silencing the press. Aanya and Kabir infiltrate the local revenue archive.',
            imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop'
          },
          {
            id: 'b5',
            number: 5,
            act: 'ACT II - CONFRONTATION',
            timeRange: '45:00 - 62:00',
            title: 'Midpoint Reversal: The SCADA Log Extraction',
            description: 'In the Upper Penganga vault, Aanya extracts the raw digital SCADA file. It confirms Vikrant personally phoned the gatekeeper to hold the water until his warehouse cargo cleared. Alarms trigger; Kabir is arrested.',
            imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop'
          },
          {
            id: 'b6',
            number: 6,
            act: 'ACT II - CONFRONTATION',
            timeRange: '62:00 - 85:00',
            title: 'All Hope Lost: The Disqualification Threat',
            description: 'Vikrant summons Aanya. He reveals the police have framed her under the Official Secrets Act. If she speaks, she will be jailed and disqualified permanently before Monday’s exam. Raghav collapses.',
            imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop'
          }
        ]
      },
      act3: {
        title: 'ACT III: THE TRUTH & THE MERIT LIST',
        time: '85:00 – 122:00',
        beats: [
          {
            id: 'b7',
            number: 7,
            act: 'ACT III - RESOLUTION',
            timeRange: '85:00 - 105:00',
            title: 'The Climax: The Heritage Gala Disclosure',
            description: 'Instead of submitting to blackmail, Aanya leverages the Vidarbha Development Council gala. Using Raghav’s restored printing proofs and live telemetry broadcast, she confronts Vikrant before national media.',
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
          },
          {
            id: 'b8',
            number: 8,
            act: 'ACT III - RESOLUTION',
            timeRange: '105:00 - 122:00',
            title: 'Resolution: The Cost of Freedom',
            description: 'Vikrant’s trust is frozen. Kabir is released. Aanya walks into the UPSC examination hall for her final Mains exam, her eligibility intact but her illusions shattered. True sovereignty achieved.',
            imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop'
          }
        ]
      }
    },
    timeline: [
      { label: 'Baseline & Urgency', timeMin: 10, act: 'Act I' },
      { label: 'Flood Conspiracy Discovered', timeMin: 25, act: 'Act I' },
      { label: 'Father Confrontation', timeMin: 45, act: 'Act II' },
      { label: 'Vault SCADA Extraction', timeMin: 60, act: 'Act II Midpoint' },
      { label: 'Disqualification Ultimatum', timeMin: 85, act: 'Act II Climax' },
      { label: 'Public Broadcast Reversal', timeMin: 105, act: 'Act III Climax' },
      { label: 'Final Exam Hall Walk', timeMin: 120, act: 'Resolution' }
    ]
  },

  // -------------------------------------------------------------
  // TREATMENT & BEAT DEVELOPMENT
  // -------------------------------------------------------------
  treatment: {
    version: 'v1.2-canonical',
    wordCount: 3850,
    logline: 'When an exhausted 34-year-old UPSC aspirant on her final attempt uncovers that a catastrophic regional flood was deliberately engineered by private warehouse developers, she must risk permanent criminal blacklisting to expose the state machinery.',
    synopsis: 'Set across the fluorescent pressure chambers of Delhi’s competitive exam factories and the rain-drenched cotton hinterlands of Vidarbha, THE LAST MONSOON explores the moral crisis of modern Indian ambition. Aanya Deshmukh has spent a decade trapped in the exam cycle, carrying the burden of her father Raghav’s bankrupt printing business. When activist Kabir hands her anomalous hydro-telemetry from the 2024 Upper Penganga flood, she discovers the dam gates were deliberately held shut for 48 hours to protect private logistics depots owned by oligarch Vikrant Singhania. Traveling to Wardha, she finds her own father coerced into printing falsified casualty registries. In a lethal battle between constitutional truth and institutional survival, Aanya orchestrates a forensic public disclosure during the state’s flagship economic summit, proving that the greatest qualification is not a government rank, but the courage to refuse silence.',
    themes: ['The Economy of Ambition', 'Engineered Natural Disasters', 'Father-Daughter Complicity', 'Institutional Truth'],
    tone: ['Realistic', 'Noir', 'Procedural', 'Emotionally Shattering'],
    status: 'APPROVED',
    candidateState: 'CANONICAL',
    checklist: [
      { item: 'Logline & Narrative Engine Approved', completed: true },
      { item: 'Protagonist Age 34 Revisions Grounded', completed: true },
      { item: 'Act II Midpoint Vault Reversal Structured', completed: true },
      { item: 'Hydrological Research Provenance Verified', completed: true },
      { item: 'Continuity Conflict #CONT-01 Resolved', completed: false }
    ],
    plotBeats: [
      { id: 'pb1', number: 1, act: 'ACT I', title: 'The Silent Exam Hall', description: 'Rain beats against the basement window. Aanya studies under fluorescent tubes. Her clock counts down.' },
      { id: 'pb2', number: 2, act: 'ACT I', title: 'The Satellite Telemetry Leak', description: 'Kabir shares the encrypted CWC telemetry showing delayed sluice release.' },
      { id: 'pb3', number: 3, act: 'ACT II', title: 'The Arvi Press Inquest', description: 'Aanya discovers Raghav printed the altered casualty count to pay his debt.' },
      { id: 'pb4', number: 4, act: 'ACT II', title: 'SCADA Vault Penetration', description: 'Under heavy monsoon rain, Aanya extracts the non-resettable gate logs.' },
      { id: 'pb5', number: 5, act: 'ACT III', title: 'The Heritage Club Gala Confrontation', description: 'Live broadcast of the SCADA data forces state ministers to disown Singhania.' }
    ]
  },

  // -------------------------------------------------------------
  // SCENE OUTLINES
  // -------------------------------------------------------------
  scenes: [
    {
      id: 'sc-1',
      sceneNumber: 1,
      act: 'ACT I - SETUP',
      slugline: 'INT. AARANYA ROOM - RAJINDER NAGAR - NIGHT',
      duration: '3:30',
      location: 'Old Rajinder Nagar Basement',
      timeOfDay: 'NIGHT',
      intExt: 'INT.',
      characters: ['Aanya Deshmukh', 'Mother (O.S.)'],
      characterIds: ['char-aanya'],
      subheading: 'The Countdown and the Mortgaged Years',
      summary: 'Aanya (34) sits surrounded by 10 years of dog-eared UPSC volumes. She receives a call from her mother asking how much longer she will punish herself.',
      purpose: 'Establish protagonist age, urgency, emotional isolation, and the ticking clock of her 6th attempt.',
      emotionalBeat: 'Claustrophobic exhaustion giving way to cold, resolute endurance.',
      keyElements: 'Dog-eared books spanning 2018-2024, cold chai, calendar marked with exam countdown.',
      dialogueHighlights: '"Ten years ago I thought time was on my side. Now every rain feels like a countdown."',
      visualNotes: 'Cool fluorescent overhead lighting; water streaks running down the high clerestory window.',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      candidateState: 'CANONICAL',
      insights: {
        storyRole: 'Inciting Setup',
        emotionalTone: 'Tense & Intimate',
        pacing: 'Slow Burn',
        conflictLevel: 'High',
        characterFocus: 'Aanya Deshmukh',
        theme: 'Cost of Ambition'
      },
      notes: [
        { id: 'n1', text: 'Ensure costume department uses muted tones reflecting adult exhaustion', done: true }
      ]
    },
    {
      id: 'sc-4',
      sceneNumber: 4,
      act: 'ACT I - SETUP',
      slugline: 'INT. WARDHA COLLEGE AUDITORIUM - DAY (FLASHBACK 2018)',
      duration: '2:15',
      location: 'Wardha College',
      timeOfDay: 'DAY',
      intExt: 'INT.',
      characters: ['Aanya Deshmukh', 'Raghav Deshmukh'],
      characterIds: ['char-aanya', 'char-raghav'],
      subheading: 'The Gold Medal and the Beginning of the Debt',
      summary: 'In 2018, Aanya receives her university engineering medal. Raghav proudly announces he has secured funds for her Delhi coaching, concealing that he mortgaged his press.',
      purpose: 'Dramatize the origin of the 10-year family debt and Raghav’s tragic sacrifice.',
      emotionalBeat: 'Tainted pride; joyful celebration shadowed by financial doom.',
      keyElements: 'Brass university medal, garland, dusty letterpress receipts in Raghav’s pocket.',
      dialogueHighlights: '"You will sit in the Collectorate, beta. A father does not look at costs."',
      visualNotes: 'Golden nostalgic warm grade contrasting sharply with present-day cool desaturation.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
      candidateState: 'CANDIDATE',
      insights: {
        storyRole: 'Origin Beat',
        emotionalTone: 'Melancholic Nostalgia',
        pacing: 'Steady',
        conflictLevel: 'Medium',
        characterFocus: 'Raghav & Aanya',
        theme: 'Generational Sacrifice'
      },
      notes: [
        { id: 'n2', text: 'Reconcile timeline: scene draft previously said "two years ago" — must specify 2018', done: false }
      ]
    },
    {
      id: 'sc-14',
      sceneNumber: 14,
      act: 'ACT II - CONFRONTATION',
      slugline: 'INT. KABIR DARKROOM BASEMENT - NIGHT',
      duration: '4:15',
      location: 'Old Rajinder Nagar Basement Darkroom',
      timeOfDay: 'NIGHT',
      intExt: 'INT.',
      characters: ['Aanya Deshmukh', 'Kabir Sen'],
      characterIds: ['char-aanya', 'char-kabir'],
      subheading: 'SCADA Telemetry Decoding',
      summary: 'Under red safelight, Kabir and Aanya cross-reference the satellite flood map with the CWC SCADA telemetry log, revealing the deliberate 48-hour gate delay.',
      purpose: 'Establish forensic proof of the crime and forge the alliance between Aanya and Kabir.',
      emotionalBeat: 'Intellectual euphoria immediately replaced by dread as they realize who authorized it.',
      keyElements: 'Hanging photographic prints, dual monitors, raw hexadecimal telemetry tables.',
      dialogueHighlights: '"This isn’t administrative negligence, Kabir. They held thirty billion liters of water to save six warehouses."',
      visualNotes: 'Deep saturated crimson darkroom lighting with glowing cyan terminal monitors.',
      imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop',
      candidateState: 'CANONICAL',
      insights: {
        storyRole: 'Forensic Turning Point',
        emotionalTone: 'High Suspense',
        pacing: 'Rapid',
        conflictLevel: 'High',
        characterFocus: 'Aanya & Kabir',
        theme: 'Institutional Truth'
      },
      notes: [
        { id: 'n3', text: 'Verify technical terminology with CWC hydrologist advisor', done: true }
      ]
    }
  ],
  selectedSceneId: 'sc-1',

  // -------------------------------------------------------------
  // SCREENPLAY LINES (CONTEXT-GROUNDED CANDIDATE REVISION)
  // -------------------------------------------------------------
  screenplay: [
    {
      id: 'sp1',
      sceneNumber: 1,
      type: 'scene_heading',
      content: 'INT. AARANYA ROOM - RAJINDER NAGAR - NIGHT',
      candidateState: 'CANONICAL'
    },
    {
      id: 'sp2',
      sceneNumber: 1,
      type: 'action',
      content: 'A dimly lit basement room. Monsoon rain drums violently against a high rectangular clerestory window. AARANYA DESHMUKH (34) sits at a chipped plywood desk, illuminated only by a warm 40-watt bulb. Surrounding her are dog-eared UPSC volumes spanning a decade—2018 through 2024. Beside her, a steel glass of cold chai and a desk calendar with "FINAL ATTEMPT: 14 DAYS" circled in black ink.',
      candidateState: 'CANONICAL'
    },
    {
      id: 'sp3',
      sceneNumber: 1,
      type: 'character',
      characterName: 'AARANYA (V.O.)',
      content: 'AARANYA (V.O.)',
      candidateState: 'CANONICAL'
    },
    {
      id: 'sp4',
      sceneNumber: 1,
      type: 'dialogue',
      characterName: 'AARANYA',
      content: 'Ten years ago I thought time was on my side. I thought if you studied enough, the republic would reward you with dignity. Now every rain feels like a countdown to becoming a ghost.',
      candidateState: 'CANONICAL'
    },
    {
      id: 'sp5',
      sceneNumber: 1,
      type: 'action',
      content: 'Her phone buzzes on the desk. "MAA CALLING". Aaranya stares at the screen. She taps answer and brings the speaker to her ear without saying hello.',
      candidateState: 'CANONICAL'
    },
    {
      id: 'sp6',
      sceneNumber: 1,
      type: 'character',
      characterName: 'MOTHER (O.S.)',
      content: 'MOTHER (O.S.)',
      candidateState: 'CANONICAL'
    },
    {
      id: 'sp7',
      sceneNumber: 1,
      type: 'dialogue',
      characterName: 'MOTHER',
      content: 'How much longer will you punish yourself, Aanya? Your father’s knees gave out yesterday on the press stairs. The bank sent another notice. You are 34.',
      candidateState: 'CANONICAL'
    },
    {
      id: 'sp8',
      sceneNumber: 1,
      type: 'character',
      characterName: 'AARANYA',
      content: 'AARANYA',
      candidateState: 'CANONICAL'
    },
    {
      id: 'sp9',
      sceneNumber: 1,
      type: 'dialogue',
      characterName: 'AARANYA',
      content: 'Tell Baba the notice is irrelevant. Some debts can only be paid by finishing the fight.',
      candidateState: 'CANONICAL'
    }
  ],

  // -------------------------------------------------------------
  // DIALOGUE INTELLIGENCE & VOICE ALTERNATIVES
  // -------------------------------------------------------------
  dialogueSuggestions: [
    {
      id: 'ds1',
      character: 'AARANYA',
      label: 'Battle-Tested & Quietly Lethal',
      text: 'Tell Baba the notice is irrelevant. Some debts can only be paid by finishing the fight.',
      tone: 'Cold, Resolute, Exhausted',
      candidateState: 'CANONICAL'
    },
    {
      id: 'ds2',
      character: 'AARANYA',
      label: 'Vulnerable & Defensive',
      text: 'Do you think I wanted this, Maa? Look at my hands. I’ve held a pen for ten years while my friends built lives.',
      tone: 'Raw, Pained, Defensive',
      candidateState: 'CANDIDATE'
    },
    {
      id: 'ds3',
      character: 'AARANYA',
      label: 'Hyper-Analytical & Defiant',
      text: 'If I quit now, his mortgage is just a bad loan. If I finish this, it’s an investment. Let me work.',
      tone: 'Analytical, Strained',
      candidateState: 'CANDIDATE'
    }
  ],

  // -------------------------------------------------------------
  // CANON & CONTINUITY ENGINE (CONTRADICTION DETECTIONS & EVIDENCE)
  // -------------------------------------------------------------
  continuityIssues: [
    {
      id: 'cont-1',
      sceneNumber: 4,
      category: 'Timeline',
      severity: 'Critical Blocker',
      title: 'Aanya Age & Flashback Chronology Contradiction',
      description: 'Scene 4 draft describes Aanya holding a graduation degree from "last summer", which implies she is 23–24 years old. This directly conflicts with Canon Fact #CF-01 establishing her current age as 34 and her first attempt in 2018.',
      establishedCanonEvidence: 'Canon Fact #CF-01: "Aanya Deshmukh is 34 years old, sitting for her sixth attempt; initial preparation began in 2018 after Raghav mortgaged press."',
      canonSource: 'Story Brain #CF-01 & Decision #CD-01',
      conflictingContentEvidence: 'Scene 4 Action Line 3: "Aaranya (23) laughs, holding her fresh university degree from last summer."',
      contentLocation: 'Scene 4: INT. WARDHA COLLEGE - Line 3',
      affectedEntities: ['Aanya Deshmukh', 'Raghav Deshmukh', 'Scene 4'],
      resolutionState: 'Open',
      fixAction: 'Update Scene 4 timestamp to 2018 (making her 26 in flashback) and calibrate dialogue to reflect 8 years of subsequent struggle.'
    },
    {
      id: 'cont-2',
      sceneNumber: 12,
      category: 'World Rule',
      severity: 'Warning',
      title: 'SCADA Network Extraction Method Discrepancy',
      description: 'Scene 12 draft mentions Kabir downloading telemetry data over a public Wi-Fi cafe link. World Rule #WR-01 states that the Upper Penganga SCADA is air-gapped and requires on-site physical terminal extraction.',
      establishedCanonEvidence: 'World Rule #WR-01: "Telemetry on Upper Penganga Barrage is stored on an isolated SCADA network; remote extraction requires local terminal authorization."',
      canonSource: 'Story Brain World Rules & Research RF-04',
      conflictingContentEvidence: 'Scene 12 Line 8: "Kabir downloads the water data from his phone connected to the tea stall Wi-Fi."',
      contentLocation: 'Scene 12: EXT. CHAI STALL - Line 8',
      affectedEntities: ['Kabir Sen', 'Scene 12', 'World Rules'],
      resolutionState: 'Open',
      fixAction: 'Modify Scene 12 so Kabir only receives an encrypted SMS ping; the actual SCADA dump occurs inside the vault in Scene 14.'
    },
    {
      id: 'cont-3',
      sceneNumber: 16,
      category: 'Character Motivation',
      severity: 'Warning',
      title: 'Antagonist Title Drift ("Minister" vs "Trustee")',
      description: 'Scene 16 dialogue has a junior revenue clerk refer to Vikrant Singhania as "The Honorable Minister". Canon Fact #CF-03 explicitly establishes that Vikrant holds no cabinet portfolio.',
      establishedCanonEvidence: 'Canon Fact #CF-03: "Vikrant Singhania holds no official cabinet portfolio; power operates through VART trust."',
      canonSource: 'Story Brain #CF-03',
      conflictingContentEvidence: 'Scene 16 Line 12: "Minister Singhania’s office called for the flood relief files."',
      contentLocation: 'Scene 16: INT. TEHSIL OFFICE - Line 12',
      affectedEntities: ['Vikrant Singhania', 'Scene 16'],
      resolutionState: 'Open',
      fixAction: 'Change clerk line to: "Chairman Singhania’s secretary called from the Trust office."'
    },
    {
      id: 'cont-4',
      sceneNumber: 24,
      category: 'Timeline',
      severity: 'Advisory',
      title: 'Monsoon Spate Continuity in Climax Setting',
      description: 'Scene 24 exterior description mentions clear autumn evening skies, whereas Scene 26 climax relies on torrential monsoon inundation as dramatic pressure.',
      establishedCanonEvidence: 'Story Structure Beat 7 & World Setting: Climax occurs during the peak August monsoon downpour.',
      canonSource: 'Structure Act III Beat 7',
      conflictingContentEvidence: 'Scene 24 Action Line 1: "A calm, cloudless autumn dusk settles over Nagpur."',
      contentLocation: 'Scene 24: EXT. HIGHWAY - Line 1',
      affectedEntities: ['World Building', 'Scene 24'],
      resolutionState: 'Resolved',
      resolutionNotes: 'Updated Scene 24 action line to retain heavy gathering monsoon thunderheads.',
      fixAction: 'Resolved by author on 27 Sep 2026.'
    }
  ],
  qaIssues: [], // Alias for backward compatibility

  // -------------------------------------------------------------
  // DEFERRED / OUT OF SCOPE MODULES (PRESERVED FOR PREVIEW COMPATIBILITY)
  // -------------------------------------------------------------
  visualDev: {
    colorPalette: [
      { name: 'Monsoon Noir', hex: '#1e293b' },
      { name: 'Fluorescent Yellow', hex: '#eab308' },
      { name: 'River Mud Brown', hex: '#78350f' },
      { name: 'SCADA Cyan', hex: '#06b6d4' },
      { name: 'Gazette Paper Cream', hex: '#fef3c7' }
    ],
    keyFrames: [
      { id: 'kf1', code: 'KF-01', title: 'The Basement Library at 3 AM', description: 'Aanya surrounded by books under humming fluorescent tubes.', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop' },
      { id: 'kf2', code: 'KF-02', title: 'The Barrage Sluice Gates', description: 'Monolithic concrete gates releasing torrential night floodwaters.', imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop' }
    ],
    artDirectionNotes: [
      { author: 'Vikram Rao', time: '1 hour ago', text: 'Preserve procedural realism; avoid stylized fantasy lighting. Let the water feel heavy and dangerous.' }
    ],
    visualChecklist: [
      { label: 'Lookbook approved', done: true },
      { label: 'Lighting reference locked', done: true }
    ]
  },
  production: {
    shootDays: 54,
    keyLocationsCount: 6,
    crewCount: 95,
    budgetTotalCr: 14.2,
    tentativeStart: '15 Nov 2026',
    readinessStatus: 'Development Package Ready',
    schedulePhases: [
      { name: 'Script Lock & Recce', dates: '1 Oct – 20 Oct', color: '#10b981', barStartPercent: 0, barWidthPercent: 20 },
      { name: 'Cast Rehearsals', dates: '20 Oct – 10 Nov', color: '#3b82f6', barStartPercent: 15, barWidthPercent: 20 }
    ],
    budgetCategories: [
      { category: 'Above the Line', amountCr: 4.5, percent: 32, color: '#f59e0b' },
      { category: 'Production & Logistics', amountCr: 6.8, percent: 48, color: '#3b82f6' },
      { category: 'Post & Sound Design', amountCr: 2.9, percent: 20, color: '#10b981' }
    ],
    resources: [],
    locations: [],
    milestones: [],
    risks: [],
    documents: []
  },
  package: {
    stepsCompleted: 15,
    totalSteps: 16,
    deliverablesCount: 8,
    stakeholdersCount: 5,
    deliveryDate: '28 Sep 2026',
    isGreenlit: false,
    checklist: [
      { name: 'Story Brain Entities & Canon Locked', completed: true },
      { name: 'Traceable Research Dossier Verified', completed: true },
      { name: 'Character Bibles & Voice Style Finalized', completed: true },
      { name: 'Three-Act Beat Breakdown Approved', completed: true },
      { name: 'Treatment & Synopsis Locked (v1.2)', completed: true },
      { name: 'Key Screenplay Sequences Drafted', completed: true },
      { name: 'Canon & Continuity Clearances Verified', completed: true },
      { name: 'AI Narrative Evaluation Passed (>85%)', completed: true },
      { name: 'Producer & Director Sign-Off Logged', completed: true }
    ],
    deliverables: [
      { id: 'del-1', title: 'Complete Story Development Package (PDF/Interactive)', type: 'PDF', version: 'v1.2-canonical', size: '4.8 MB', color: '#f59e0b' },
      { id: 'del-2', title: 'Story Brain Narrative Intelligence Dossier', type: 'DOC', version: 'v1.2', size: '2.1 MB', color: '#3b82f6' },
      { id: 'del-3', title: 'Traceable Research & Evidence Bible', type: 'PDF', version: 'v1.0', size: '3.4 MB', color: '#10b981' },
      { id: 'del-4', title: 'Character Psychology & Voice Bibles', type: 'DOC', version: 'v1.1', size: '1.8 MB', color: '#8b5cf6' },
      { id: 'del-5', title: 'Feature Screenplay Scene Sequence Draft', type: 'PDF', version: 'v1.2', size: '1.2 MB', color: '#ef4444' }
    ],
    stakeholders: [
      { id: 'sh1', name: 'Kaustubh Deshmukh', role: 'AI Product Manager', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', status: 'Approved', date: '28 Sep 2026' },
      { id: 'sh2', name: 'Aarav Mehta', role: 'Director', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', status: 'Approved', date: '28 Sep 2026' },
      { id: 'sh3', name: 'Rhea Kapoor', role: 'Producer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', status: 'Approved', date: '28 Sep 2026' },
      { id: 'sh4', name: 'Priya Sen', role: 'Lead Writer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop', status: 'Approved', date: '28 Sep 2026' }
    ]
  }
};

// Aliases for continuity
seedProject.qaIssues = seedProject.continuityIssues;

export const secondaryProjects: TattvaCoProject[] = [
  {
    ...seedProject,
    id: 'proj-raaste',
    title: 'Raaste',
    tagline: 'Truth is rarely pure, never simple.',
    posterUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=900&auto=format&fit=crop',
    contentType: 'Web Series',
    language: 'Hindi',
    genre: 'Investigative Crime',
    stage: 'Research & Story Exploration',
    progressPercent: 32,
    lastUpdated: 'Updated 2 days ago',
    canonicalVersion: 'v0.4-draft',
    status: 'DRAFT',
    intent: {
      ...seedProject.intent,
      premise: 'A disgraced small-town journalist investigates an unacknowledged mining collapse buried by local politicians for two decades.'
    }
  },
  {
    ...seedProject,
    id: 'proj-operation-sandglass',
    title: 'Operation Sandglass',
    tagline: 'A covert mission. A buried truth. A nation at stake.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
    contentType: 'Feature Film',
    language: 'Hindi',
    genre: 'Military Thriller',
    stage: 'Intake & Ambiguity Detection',
    progressPercent: 15,
    lastUpdated: 'Updated 5 days ago',
    canonicalVersion: 'v0.2-draft',
    status: 'DRAFT',
    intent: {
      ...seedProject.intent,
      premise: 'A drone telemetry operator discovers an unauthorized cross-border frequency broadcast from an abandoned military listening post.'
    }
  }
];
