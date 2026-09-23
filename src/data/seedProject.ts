import { TattvaCoProject } from '../types/project';

export const seedProject: TattvaCoProject = {
  id: 'proj-the-last-monsoon',
  title: 'The Last Monsoon',
  tagline: 'Every rain reveals a truth.',
  posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop',
  contentType: 'Feature Film',
  language: 'Hindi',
  genre: 'Political Thriller',
  stage: 'In Development',
  progressPercent: 42,
  lastUpdated: 'Updated 2 days ago',
  owner: 'Kaustubh Deshmukh',
  visibility: 'Internal (Don Vanzara Team)',
  tags: ['Politics', 'Ambition', 'Truth', 'Redemption'],
  status: 'IN_REVIEW',
  teamMembers: [
    { id: 'u1', name: 'Kaustubh Deshmukh', role: 'AI Product Manager', initials: 'KD', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
    { id: 'u2', name: 'Aarav Mehta', role: 'Director', initials: 'AM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
    { id: 'u3', name: 'Rhea Kapoor', role: 'Producer', initials: 'RK', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
    { id: 'u4', name: 'Vikram Rao', role: 'DOP', initials: 'VR', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
    { id: 'u5', name: 'Priya Sen', role: 'Lead Writer', initials: 'PS', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' }
  ],
  intent: {
    premise: 'A young UPSC aspirant uncovers a political conspiracy.',
    protagonist: '24-year-old, from a small town',
    setting: 'Contemporary India',
    conflict: 'Choosing between a guaranteed prestigious career and exposing systemic deception.',
    stakes: 'Her future, her family safety, and the lives of thousands affected by administrative corruption.',
    themes: ['Ambition', 'Truth', 'Integrity', 'Power', 'Hope'],
    tone: 'Realistic, gripping, emotionally driven',
    contentType: 'Feature Film',
    language: 'Hindi',
    targetAudience: 'Adults (18+)',
    status: 'APPROVED',
    missingQuestions: [
      'Who is the main antagonist?',
      'What is the central conflict?',
      'What happens if she fails?',
      'What is the ending?',
      'Is this inspired by real events?',
      'Any specific time period?',
      'Target runtime (e.g. 120 mins)?',
      'Any key reference films?'
    ]
  },
  researchQuestions: [
    { id: 'rq1', title: 'UPSC examination process', category: 'Administrative', completed: true },
    { id: 'rq2', title: 'Life of a UPSC aspirant', category: 'Character', completed: true },
    { id: 'rq3', title: 'Coaching ecosystem in India', category: 'World', completed: true },
    { id: 'rq4', title: 'Political influence and bureaucracy', category: 'Conflict', completed: true },
    { id: 'rq5', title: 'Small-town to metro transition', category: 'Setting', completed: true },
    { id: 'rq6', title: 'Hostel and living conditions', category: 'Setting', completed: true },
    { id: 'rq7', title: 'Mental health and pressure', category: 'Psychology', completed: true },
    { id: 'rq8', title: 'Media and public perception', category: 'Socio-political', completed: true },
    { id: 'rq9', title: 'Relevant legal frameworks', category: 'Plot', completed: false },
    { id: 'rq10', title: 'Case studies (real or fictionalized)', category: 'Precedent', completed: false },
    { id: 'rq11', title: 'Whistleblower protection protocols', category: 'Plot', completed: false },
    { id: 'rq12', title: 'Inter-state river dispute politics', category: 'Conflict', completed: false }
  ],
  researchFindings: [
    {
      id: 'rf1',
      topic: 'Civil Services Examination Structure',
      claim: 'UPSC has three stages: Prelims, Mains and Interview',
      evidence: 'The civil services examination consists of a preliminary exam, a mains exam and a personality test (interview). The entire process takes approximately 12 to 14 months.',
      source: 'Union Public Service Commission Annual Report 2024',
      sourceType: 'Primary Source',
      date: '12 Jan 2024',
      confidence: 98,
      status: 'Verified',
      usedIn: ['Scene 1', 'Scene 5', 'Character: Aanya'],
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'rf2',
      topic: 'Preparation Cycles',
      claim: 'Average preparation time is 2–4 years',
      evidence: 'Most successful candidates prepare for 2 to 4 years, with multiple attempts being common. Many aspirants work or study parallelly, facing severe burnout.',
      source: 'Centre for Policy Studies Academic Monograph',
      sourceType: 'Academic',
      date: '10 Jan 2024',
      confidence: 94,
      status: 'Verified',
      usedIn: ['Character: Kabir', 'Scene 7'],
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'rf3',
      topic: 'Coaching Hub Realities',
      claim: 'Major coaching hubs: Delhi (Mukherjee Nagar), Prayagraj',
      evidence: 'Mukherjee Nagar and Old Rajinder Nagar host over 250,000 aspirants simultaneously. The ecosystem includes coaching centres, reading rooms, cramped basements, and informal mess halls.',
      source: 'The Hindu Investigative Series',
      sourceType: 'Established Publication',
      date: '8 Jan 2024',
      confidence: 96,
      status: 'Verified',
      usedIn: ['World: Delhi', 'Scene 5'],
      imageUrl: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'rf4',
      topic: 'Psychological Toll',
      claim: 'High psychological pressure and isolation are common',
      evidence: 'Studies indicate high levels of stress, anxiety and isolation among UPSC aspirants, often due to uncertainty, parental sacrifice, and societal expectations.',
      source: 'NIMHANS Youth Mental Health Survey',
      sourceType: 'Academic',
      date: '5 Jan 2024',
      confidence: 92,
      status: 'Verified',
      usedIn: ['Scene 1', 'Scene 14'],
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop'
    }
  ],
  storyDirections: [
    {
      id: 'sd-a',
      badgeLetter: 'A',
      title: 'Political Thriller',
      logline: 'A young UPSC aspirant uncovers a deep political conspiracy that forces her to choose between her career and the truth.',
      genre: 'Political Thriller / Procedural',
      narrativeEngine: 'Ticking clock investigation uncovering flood relief embezzlement.',
      protagonistArc: 'Naive dreamer forced into high-stakes whistleblowing.',
      conflict: 'Individual integrity vs institutional power brokers.',
      stakes: 'Exposing corrupt state machinery vs personal career destruction.',
      theme: 'Power, Conspiracy, Truth vs Silence',
      tone: 'Tense, Realistic, Gritty',
      audience: 'Urban, Young Adults, Cinema Purists',
      potential: 'High (Theatrical + OTT Premiere)',
      risks: 'May feel too overtly political for standard family viewers',
      strengths: 'Compelling procedural pace, high tension, powerful climax',
      tags: ['Power', 'Conspiracy', 'Truth'],
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop',
      isSelected: true
    },
    {
      id: 'sd-b',
      badgeLetter: 'B',
      title: 'Character Drama',
      logline: "A small-town girl's journey through the UPSC system becomes a deeply personal story of identity, sacrifice and what she truly wants.",
      genre: 'Coming-of-Age / Family Drama',
      narrativeEngine: 'Generational conflict and emotional self-reckoning.',
      protagonistArc: 'Struggling daughter finding her authentic moral voice.',
      conflict: 'Father’s middle-class dream vs her emerging self-determination.',
      stakes: 'Family relationship ruptures and loss of self-respect.',
      theme: 'Self-Discovery, Ambition, Family Legacy',
      tone: 'Emotional, Realistic, Heartfelt',
      audience: 'Wide (Family + Youth demographics)',
      potential: 'High (Both Theatrical + Long-tail OTT)',
      risks: 'May lack external plot stakes and urgency',
      strengths: 'Massive emotional resonance and relatable family dynamics',
      tags: ['Self-Discovery', 'Ambition', 'Family'],
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      isSelected: false
    },
    {
      id: 'sd-c',
      badgeLetter: 'C',
      title: 'Psychological Mystery',
      logline: 'As she prepares for the civil services, a series of strange events make her question what is real, what is being hidden, and who to trust.',
      genre: 'Psychological Noir / Mystery',
      narrativeEngine: 'Unreliable perceptions, paranoia, and secret files.',
      protagonistArc: 'Overwhelmed scholar questioning her own sanity before the breakthrough.',
      conflict: 'Her own memories and paranoia vs cold external facts.',
      stakes: 'Complete mental breakdown vs uncovering an assassin syndicate.',
      theme: 'Mystery, Psychological Fragility, Systemic Paranoia',
      tone: 'Dark, Intriguing, Atmospheric',
      audience: 'Niche (Prestige OTT Strong)',
      potential: 'High (Film Festivals + Curated Streaming)',
      risks: 'Complex non-linear puzzle might alienate casual audience',
      strengths: 'Deep psychological hook, visually inventive, auteur-driven',
      tags: ['Mystery', 'Psychological', 'Investigation'],
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
      isSelected: false
    }
  ],
  selectedDirectionId: 'sd-a',
  formats: [
    {
      id: 'fmt-feat',
      title: 'Feature Film',
      duration: '90–150 mins',
      description: 'Ideal for a focused, character-driven story with high emotional impact.',
      isRecommended: true,
      isSelected: true,
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'fmt-limited',
      title: 'Limited Series',
      duration: '4–8 Episodes',
      description: 'Best for layered storytelling with multiple perspectives and subplots.',
      isRecommended: false,
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'fmt-episodic',
      title: '8 Episodic Series',
      duration: '8 Episodes',
      description: 'Allows deeper character arcs and expanded political thriller subplots.',
      isRecommended: false,
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'fmt-vertical',
      title: 'Vertical Series',
      duration: '20–60 Episodes',
      description: 'Short-form, high-engagement bite-sized content for mobile digital platforms.',
      isRecommended: false,
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop'
    }
  ],
  templates: [
    {
      id: 'tmpl-script',
      title: 'Feature Film Script',
      description: 'Industry standard (PDF, Final Draft formatting with Three-Act breakdown)',
      tags: ['Screenplay', 'Cinematic'],
      isSelected: true,
      imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'tmpl-bible',
      title: 'Series Bible Template',
      description: 'Complete architecture for limited or episodic series world and seasons.',
      tags: ['Series', 'Detailed'],
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'tmpl-treatment',
      title: 'Treatment Template',
      description: 'Structured prose treatment with thematic beats and character arcs.',
      tags: ['Development', 'Pitch'],
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'tmpl-pitch',
      title: 'Pitch Deck Template',
      description: 'Investor and studio-ready visual deck with market comparisons.',
      tags: ['Pitch', 'Visual'],
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'tmpl-char',
      title: 'Character Bible',
      description: 'Deep psychology, relationship matrices, voice profiles, and arcs.',
      tags: ['Characters', 'World Building'],
      isSelected: false,
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
    }
  ],
  characters: [
    {
      id: 'char-aanya',
      name: 'Aanya',
      role: 'Protagonist',
      age: 24,
      gender: 'Female',
      occupation: 'UPSC Aspirant',
      location: 'Delhi / Hometown',
      tags: ['Ambitious', 'Idealistic', 'Resilient'],
      quote: 'Change is difficult, but not impossible.',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      status: 'APPROVED',
      want: 'Clear the UPSC examination and become a District Magistrate.',
      need: 'Accept that true change requires more than individual ambition—it demands standing for others.',
      fear: 'Becoming irrelevant, disappointing her parents, and surrendering to mediocrity.',
      flaw: 'Overthinks, holds onto rigid idealism, struggles to trust potential allies.',
      strength: 'Incisive analytical mind, stubborn moral resilience, empathy for the neglected.',
      secret: 'She discovered her father secretly mortgaged their ancestral house to pay her coaching fees.',
      arc: 'Idealism → Disillusionment → Moral Agency',
      voiceStyle: 'Intelligent, empathetic, determined. Speaks with clarity, warmth and quiet strength.',
      contradictions: 'Despises bureaucracy yet yearns to hold its highest seat.',
      relationships: [
        { targetCharacterId: 'char-raghav', targetCharacterName: 'Raghav Deshmukh', relationType: 'Father', dynamic: 'Loving reverence overshadowed by unstated financial debt' },
        { targetCharacterId: 'char-kabir', targetCharacterName: 'Kabir', relationType: 'Friend / Peer', dynamic: 'Shared struggle, banter, intellectual sparring' },
        { targetCharacterId: 'char-meera', targetCharacterName: 'Meera Sharma', relationType: 'Mentor', dynamic: 'Hero worship transitioning to shared ethical struggle' },
        { targetCharacterId: 'char-vikrant', targetCharacterName: 'Vikrant Rao', relationType: 'Antagonist', dynamic: 'Ideological confrontation: power vs conscience' }
      ],
      scenesAppeared: [1, 3, 5, 7, 12, 14, 18, 22, 26, 30, 32]
    },
    {
      id: 'char-raghav',
      name: 'Raghav Deshmukh',
      role: 'Father',
      age: 52,
      gender: 'Male',
      occupation: 'Govt. Employee (Retd.)',
      location: 'Allahabad',
      tags: ['Traditional', 'Principled', 'Supportive'],
      quote: 'Stability is also a form of success.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
      status: 'APPROVED',
      want: 'See his daughter secure a gazetted government post.',
      need: 'Learn to accept that his daughter must chart her own moral compass.',
      fear: 'Public dishonor and financial bankruptcy in old age.',
      flaw: 'Overprotective, risk-averse, blinded by bureaucratic prestige.',
      strength: 'Quiet dignity, profound sacrifice for family.',
      secret: 'Hides severe health symptoms to avoid spending medical money.',
      arc: 'Rigid protector → Vulnerable ally',
      voiceStyle: 'Measured, dignified, carries bureaucratic cadence and provincial proverbs.',
      contradictions: 'Claims money does not matter, yet terrified of poverty.',
      relationships: [
        { targetCharacterId: 'char-aanya', targetCharacterName: 'Aanya', relationType: 'Daughter', dynamic: 'Unconditional love, high unspoken pressure' }
      ],
      scenesAppeared: [1, 3, 7, 14, 28]
    },
    {
      id: 'char-kabir',
      name: 'Kabir',
      role: 'Friend',
      age: 25,
      gender: 'Male',
      occupation: 'UPSC Aspirant',
      location: 'Delhi (Mukherjee Nagar)',
      tags: ['Witty', 'Pragmatic', 'Loyal'],
      quote: 'Same struggle, different perspective.',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
      status: 'APPROVED',
      want: 'Clear the exam on his 3rd attempt to escape generational farming debt.',
      need: 'Find self-worth beyond exam marks and competitive percentiles.',
      fear: 'Aging out of eligibility without an alternate livelihood.',
      flaw: 'Cynical deflections and emotional avoidance.',
      strength: 'Unwavering loyalty, ground-level street smarts.',
      secret: 'Secretly considering taking a private corporate job behind his father’s back.',
      arc: 'Cynical survivor → Courageous whistleblower co-conspirator',
      voiceStyle: 'Casual Hindi with witty idioms, irreverent humor masking deep dread.',
      contradictions: 'Mocks the civil service exam while studying 14 hours a day.',
      relationships: [
        { targetCharacterId: 'char-aanya', targetCharacterName: 'Aanya', relationType: 'Close Confidant', dynamic: 'Comedic relief, unconfessed affection, emotional bedrock' }
      ],
      scenesAppeared: [2, 5, 8, 12, 19, 26]
    },
    {
      id: 'char-meera',
      name: 'Meera Sharma',
      role: 'Mentor',
      age: 38,
      gender: 'Female',
      occupation: 'IAS Officer (Special Secretary)',
      location: 'Delhi Secretariat',
      tags: ['Sharp', 'Empathetic', 'Inspiring'],
      quote: 'The system is tough, but so are you.',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
      status: 'APPROVED',
      want: 'Push clean governance reforms through hostile ministry corridors.',
      need: 'Inspire a new generation rather than growing completely cynical.',
      fear: 'Being transferred to a punitive powerless post.',
      flaw: 'Pragmatic compromises that occasionally compromise small truths.',
      strength: 'Mastery of administrative rules and political leverage.',
      secret: 'She possessed the leak dossier 6 months ago but was forced to bury it.',
      arc: 'Weary bureaucrat → Rekindled crusader',
      voiceStyle: 'Poised, articulate, authoritative with undertones of strategic restraint.',
      contradictions: 'Serves an unjust administration to protect the few honest officers within it.',
      relationships: [
        { targetCharacterId: 'char-aanya', targetCharacterName: 'Aanya', relationType: 'Protege', dynamic: 'Mentorship, moral mirror' }
      ],
      scenesAppeared: [6, 11, 15, 23, 31]
    },
    {
      id: 'char-vikrant',
      name: 'Vikrant Rao',
      role: 'Antagonist',
      age: 45,
      gender: 'Male',
      occupation: 'Political Strategist / Lobbyist',
      location: 'Delhi / Lucknow',
      tags: ['Influential', 'Calculating', 'Mysterious'],
      quote: "Power isn't given, it's taken.",
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
      status: 'APPROVED',
      want: 'Secure state irrigation contracts for his consortium without scrutiny.',
      need: 'Recognize that raw leverage cannot extinguish righteous outrage.',
      fear: 'Losing access to the ruling cabinet elite.',
      flaw: 'Hubris and absolute contempt for common citizens.',
      strength: 'Anticipates human weakness, infinite financial resources.',
      secret: 'Uses a network of coaching institutes as money laundering vehicles.',
      arc: 'Untouchable kingmaker → Desperately cornered manipulator',
      voiceStyle: 'Soft-spoken, polite threats cloaked in philosophical aphorisms.',
      contradictions: 'Donates millions to rural scholarships while stealing their drinking water.',
      relationships: [
        { targetCharacterId: 'char-aanya', targetCharacterName: 'Aanya', relationType: 'Adversary', dynamic: 'Predator to prey, until she outsmarts him' }
      ],
      scenesAppeared: [9, 17, 21, 27, 32]
    }
  ],
  selectedCharacterId: 'char-aanya',
  world: {
    title: 'Contemporary India',
    era: '2020 – 2026',
    primaryLocations: ['Delhi', 'Allahabad', 'Mumbai'],
    settingType: 'Realistic / Contemporary',
    themes: ['Ambition', 'Inequality', 'Identity', 'Power', 'Hope'],
    languageNote: 'Hindi (with regional Allahabad & Delhi dialects)',
    heroQuote: 'Same country. Different worlds.',
    locations: [
      {
        id: 'loc-delhi',
        name: 'Delhi',
        subtitle: 'Power, bureaucracy, opportunity',
        description: 'Lutyens granite avenues contrasted with dense Mukherjee Nagar reading rooms.',
        type: 'Urban',
        coordinates: { x: 42, y: 28 },
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=600&auto=format&fit=crop',
        isPrimary: true
      },
      {
        id: 'loc-allahabad',
        name: 'Allahabad',
        subtitle: 'Home, roots, emotional anchor',
        description: 'Ancient river ghats, colonial brick bungalows, and intense monsoon flooding.',
        type: 'Town',
        coordinates: { x: 62, y: 44 },
        imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop',
        isPrimary: false
      },
      {
        id: 'loc-mumbai',
        name: 'Mumbai',
        subtitle: 'Transition, struggle, new perspectives',
        description: 'Financial high-rises, coastal monsoons, media headquarters.',
        type: 'Coastal',
        coordinates: { x: 30, y: 72 },
        imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=600&auto=format&fit=crop',
        isPrimary: false
      },
      {
        id: 'loc-hub',
        name: 'Coaching Hub',
        subtitle: 'Aspirations, competition, friendships',
        description: 'Basement study halls, tea stalls, stacks of xeroxed exam notes.',
        type: 'Urban',
        coordinates: { x: 44, y: 30 },
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop',
        isPrimary: false
      }
    ],
    socioPolitical: 'A young generation navigating examinations, politics, corruption, and a rapidly changing India.',
    cultureLifestyle: 'Middle-class aspirations, coaching culture, intense family expectations, digital India.',
    institutions: 'UPSC, coaching centres, government machinery, investigative media, civil society.'
  },
  structure: {
    templateName: 'Classic Three Act',
    estimatedDurationMins: 142,
    totalSequences: 28,
    keyTurningPoints: 4,
    emotionalPeaks: 3,
    acts: {
      act1: {
        title: 'ACT I – SETUP',
        time: '~ 0–30 mins',
        beats: [
          { id: 'b1', number: 1, act: 'ACT I - SETUP', timeRange: '0-10 min', title: 'Opening Image', description: 'Establish world and tone: torrential monsoon rain over Delhi and Allahabad.', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop' },
          { id: 'b2', number: 2, act: 'ACT I - SETUP', timeRange: '10-20 min', title: 'Inciting Incident', description: 'A suspicious question paper leak and flood relief anomaly is discovered.', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop' },
          { id: 'b3', number: 3, act: 'ACT I - SETUP', timeRange: '20-30 min', title: 'End of Act I', description: 'Protagonist makes a dangerous choice to investigate rather than keep quiet.', imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=400&auto=format&fit=crop' }
        ]
      },
      act2: {
        title: 'ACT II – CONFRONTATION',
        time: '~ 30–90 mins',
        beats: [
          { id: 'b4', number: 4, act: 'ACT II - CONFRONTATION', timeRange: '30-55 min', title: 'Midpoint', description: 'A major shift in the story: Aanya connects the syndicate to cabinet ministry officials.', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop' },
          { id: 'b5', number: 5, act: 'ACT II - CONFRONTATION', timeRange: '55-75 min', title: 'Obstacles & Setbacks', description: 'Retaliation: Kabir is detained, Aanya faces disqualification threats.', imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop' },
          { id: 'b6', number: 6, act: 'ACT II - CONFRONTATION', timeRange: '75-90 min', title: 'All Is Lost', description: 'Lowest point: The key whistleblower recants, father is publicly humiliated.', imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=400&auto=format&fit=crop' }
        ]
      },
      act3: {
        title: 'ACT III – RESOLUTION',
        time: '~ 90–150 mins',
        beats: [
          { id: 'b7', number: 7, act: 'ACT III - RESOLUTION', timeRange: '90-120 min', title: 'Climax', description: 'Final confrontation during the monsoon parliamentary session.', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=400&auto=format&fit=crop' },
          { id: 'b8', number: 8, act: 'ACT III - RESOLUTION', timeRange: '120-135 min', title: 'Resolution', description: 'Truth is broadcast to the nation, justice begins its complex course.', imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=400&auto=format&fit=crop' },
          { id: 'b9', number: 9, act: 'ACT III - RESOLUTION', timeRange: '135-142 min', title: 'Closing Image', description: 'A transformed world: Aanya walks into the interview hall with unshakeable moral clarity.', imageUrl: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?q=80&w=400&auto=format&fit=crop' }
        ]
      }
    },
    timeline: [
      { label: 'Setup', timeMin: 0, act: 'ACT I' },
      { label: 'Inciting Incident (~ 20 min)', timeMin: 20, act: 'ACT I' },
      { label: 'Midpoint (~ 70 min)', timeMin: 70, act: 'ACT II' },
      { label: 'All Is Lost (~ 110 min)', timeMin: 110, act: 'ACT II' },
      { label: 'Resolution (142 min)', timeMin: 142, act: 'ACT III' }
    ]
  },
  treatment: {
    version: 'Version 1.2',
    wordCount: 1245,
    logline: 'A young UPSC aspirant in a small town uncovers a political conspiracy during a once-in-a-generation monsoon, forcing her to choose between her dreams and the truth.',
    synopsis: 'When an unusually intense monsoon hits a drought-prone district, Aaranya, a determined UPSC aspirant, discovers that the floods are tied to a larger political conspiracy involving land, livelihoods and lives. As she digs deeper, she must navigate family pressures, systemic corruption and personal loss, ultimately finding her voice in a fight bigger than herself.',
    themes: ['Truth vs Convenience', 'Youth & Idealism', 'System & Corruption', 'Identity & Belonging', 'Hope in Adversity'],
    tone: ['Realistic', 'Emotional', 'Thought-Provoking', 'Hopeful', 'Grounded'],
    status: 'APPROVED',
    plotBeats: [
      { id: 'pb1', number: 1, act: 'ACT I', title: 'Introduce Aaranya and her world', description: 'Establish her study sanctuary amidst the onset of an ominous monsoon.' },
      { id: 'pb2', number: 2, act: 'ACT I', title: 'Establish the town and its struggles', description: 'The town is facing water drainage failure; farmers whisper about diverted relief.' },
      { id: 'pb3', number: 3, act: 'ACT I', title: 'The monsoon arrives in force', description: 'Flash floods threaten the vulnerable lower colony.' },
      { id: 'pb4', number: 4, act: 'ACT I', title: 'Inciting incident: a suspicious event', description: 'Aaranya discovers doctored civil engineering clearance papers.' },
      { id: 'pb5', number: 5, act: 'ACT II', title: 'Aaranya investigates the paper trail', description: 'With peer Kabir, she traces kickbacks to a political strategist.' },
      { id: 'pb6', number: 6, act: 'ACT II', title: 'Faces resistance and personal risk', description: 'Hostel raided, study notes seized under false accusations.' },
      { id: 'pb7', number: 7, act: 'ACT II', title: 'Learns the bigger conspiracy', description: 'The dam release was intentional to seize bank collateral.' },
      { id: 'pb8', number: 8, act: 'ACT II', title: 'Personal loss and lowest point', description: 'Father is pressured; she faces exam debarment.' },
      { id: 'pb9', number: 9, act: 'ACT III', title: 'Gathers evidence and allies', description: 'IAS mentor Meera provides critical procedural leverage.' },
      { id: 'pb10', number: 10, act: 'ACT III', title: 'Confronts the truth', description: 'Live broadcast exposing the engineered flood contracts.' },
      { id: 'pb11', number: 11, act: 'ACT III', title: 'Makes a life-changing choice', description: 'Forfeits safe anonymity to testify in open court.' },
      { id: 'pb12', number: 12, act: 'ACT III', title: 'A new beginning for the town and herself', description: 'True service established before any official government title.' }
    ],
    checklist: [
      { item: 'Logline', completed: true },
      { item: 'Synopsis', completed: true },
      { item: 'Key Themes', completed: true },
      { item: 'Tone & Style', completed: true },
      { item: 'Target Audience', completed: true },
      { item: 'Visual References', completed: true }
    ]
  },
  scenes: [
    {
      id: 'sc-1',
      sceneNumber: 1,
      act: 'ACT I - SETUP',
      slugline: "INT. AARANYA'S ROOM - NIGHT",
      duration: '2:30 mins',
      location: "Aaranya's home",
      timeOfDay: 'NIGHT',
      intExt: 'INT.',
      characters: ['Aanya', 'Mother (O.S.)'],
      characterIds: ['char-aanya'],
      subheading: 'A dream, a decision',
      summary: 'Aaranya sits by the window as the first drops of an unusual monsoon hit the town. She looks at her UPSC notes, then out at the darkening sky. A voiceover reveals her inner conflict — duty, dreams and a restless question: "Is there a bigger purpose for me?"',
      purpose: "Establish Aaranya's inner world, her aspirations and the central conflict between personal dreams and family expectations.",
      emotionalBeat: 'Quiet longing shifting into tense resolve.',
      keyElements: 'Rain on window glass, desk lamp, UPSC thick syllabus books, tea mug, family framed photograph.',
      dialogueHighlights: 'AARANYA: "What if this is not just a dream... but the only way I truly feel alive?"',
      visualNotes: 'Warm intimate tungsten interior with cold monsoon blue shadows through the window.',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      insights: {
        storyRole: 'Inciting Incident setup',
        emotionalTone: 'Reflective, Hopeful',
        pacing: 'Slow',
        conflictLevel: 'Low',
        characterFocus: 'Aanya',
        theme: 'Identity & Purpose'
      },
      notes: [
        { id: 'n1', text: 'Show UPSC books with realistic titles', done: true },
        { id: 'n2', text: 'Keep lighting warm and intimate', done: true },
        { id: 'n3', text: 'Add subtle rain sound in background', done: false },
        { id: 'n4', text: 'Use minimal dialogue, strong voiceover', done: true }
      ]
    },
    {
      id: 'sc-2',
      sceneNumber: 2,
      act: 'ACT I - SETUP',
      slugline: 'EXT. SMALL TOWN - MORNING',
      duration: '2:10 mins',
      location: 'Town Market',
      timeOfDay: 'MORNING',
      intExt: 'EXT.',
      characters: ['Aanya', 'Kabir'],
      characterIds: ['char-aanya', 'char-kabir'],
      subheading: 'Life before the storm',
      summary: 'The town comes alive. School kids, farmers, a busy market. Life seems normal, unaware of the storm ahead.',
      purpose: 'Establish town socio-economic backdrop and community warmth.',
      emotionalBeat: 'Everyday vibrancy, unhurried pace.',
      keyElements: 'Market stalls, morning mist, tea stall debate, bicycles.',
      dialogueHighlights: 'KABIR: "Mukherjee Nagar awaits, Aanya. Time to conquer the capital."',
      visualNotes: 'Natural morning sunlight, vibrant earth tones.',
      imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop',
      insights: {
        storyRole: 'World Introduction',
        emotionalTone: 'Vibrant, Warm',
        pacing: 'Medium',
        conflictLevel: 'Low',
        characterFocus: 'Aanya, Kabir',
        theme: 'Roots & Belonging'
      },
      notes: [
        { id: 'n5', text: 'Capture authentic morning market sounds', done: true }
      ]
    },
    {
      id: 'sc-3',
      sceneNumber: 3,
      act: 'ACT I - SETUP',
      slugline: 'INT. FAMILY DINING - DAY',
      duration: '2:45 mins',
      location: 'Family Dining Room',
      timeOfDay: 'DAY',
      intExt: 'INT.',
      characters: ['Aanya', 'Raghav Deshmukh'],
      characterIds: ['char-aanya', 'char-raghav'],
      subheading: 'First signs of conflict',
      summary: 'Father questions the mounting costs of another year of Delhi coaching, revealing family economic strains.',
      purpose: 'Establish stakes and parental expectations.',
      emotionalBeat: 'Tension simmering under courteous silence.',
      keyElements: 'Steel thalis, old pension receipts, silence between words.',
      dialogueHighlights: 'RAGHAV: "Stability is also a form of success, beta."',
      visualNotes: 'Overcast window light, tight claustrophobic framing.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
      insights: {
        storyRole: 'Internal Conflict',
        emotionalTone: 'Strained, Vulnerable',
        pacing: 'Medium',
        conflictLevel: 'Medium',
        characterFocus: 'Raghav, Aanya',
        theme: 'Duty vs Freedom'
      },
      notes: []
    },
    {
      id: 'sc-4',
      sceneNumber: 4,
      act: 'ACT I - SETUP',
      slugline: 'EXT. RIVERBANK - EVENING',
      duration: '3:00 mins',
      location: 'Ghat / Riverbank',
      timeOfDay: 'EVENING',
      intExt: 'EXT.',
      characters: ['Aanya'],
      characterIds: ['char-aanya'],
      subheading: 'A moment of peace',
      summary: 'Aaranya sits by the rising river watching darkening storm clouds gathering over the barrage.',
      purpose: 'Symbolic reflection before the storm breaks.',
      emotionalBeat: 'Apprehension mixed with determination.',
      keyElements: 'River water lapping against concrete steps, distant thunder.',
      dialogueHighlights: 'AARANYA: (whisper) "Let it rain."',
      visualNotes: 'Golden hour fading into steel blue dusk.',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
      insights: {
        storyRole: 'Tone Transition',
        emotionalTone: 'Solemn, Atmospheric',
        pacing: 'Slow',
        conflictLevel: 'Low',
        characterFocus: 'Aanya',
        theme: 'Nature & Conscience'
      },
      notes: []
    }
  ],
  selectedSceneId: 'sc-1',
  screenplay: [
    { id: 'sp1', sceneNumber: 1, type: 'scene_heading', content: "INT. AARANYA'S ROOM - NIGHT" },
    { id: 'sp2', sceneNumber: 1, type: 'action', content: 'A dimly lit room. Rain taps against the window. AARANYA (24) sits at her desk, surrounded by UPSC books, a half-finished cup of chai, and a notebook filled with questions.' },
    { id: 'sp3', sceneNumber: 1, type: 'action', content: 'Outside, thunder rumbles. She looks out the window - the town lights flicker.' },
    { id: 'sp4', sceneNumber: 1, type: 'character', content: 'AARANYA' },
    { id: 'sp5', sceneNumber: 1, type: 'parenthetical', content: '(to herself)' },
    { id: 'sp6', sceneNumber: 1, type: 'dialogue', content: 'Is there a bigger purpose for me?' },
    { id: 'sp7', sceneNumber: 1, type: 'action', content: 'She closes her notebook, takes a deep breath, and looks at a photograph - her childhood in the same town, now changed.' },
    { id: 'sp8', sceneNumber: 2, type: 'scene_heading', content: 'EXT. SMALL TOWN - MORNING' },
    { id: 'sp9', sceneNumber: 2, type: 'action', content: 'The town comes alive. School kids, farmers, a busy market. Life seems normal, unaware of the storm ahead.' }
  ],
  dialogueSuggestions: [
    {
      id: 'ds1',
      character: 'AARANYA',
      label: 'more reflective',
      text: 'What if this is not just a dream... but the only way I truly feel alive?',
      tone: 'Reflective'
    },
    {
      id: 'ds2',
      character: 'MOTHER (O.S.)',
      label: 'warmer tone',
      text: "I know you're working hard, beta. Just take care of yourself too.",
      tone: 'Warm, Maternal'
    },
    {
      id: 'ds3',
      character: 'AARANYA',
      label: 'determined',
      text: "Sleep can wait, Maa. Some answers don't come easy.",
      tone: 'Determined'
    }
  ],
  qaIssues: [
    {
      id: 'qa-1',
      sceneNumber: 1,
      type: 'Prop Mismatch',
      title: 'Mug missing in Scene 1B Shot 7',
      description: 'The ceramic tea mug on the study table is missing in Shot 7, but clearly prominent in Shot 3. Maintain prop continuity or add a reason in the script.',
      status: 'Open',
      referenceShotLabel: 'Scene 1A - Shot 3 (Reference Shot Earlier)',
      currentShotLabel: 'Scene 1B - Shot 7 (Current Shot Later)',
      referenceShotImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      currentShotImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      fixAction: 'Insert action: "Aaranya sets the empty mug on the windowsill behind her." or flag art department.'
    },
    {
      id: 'qa-2',
      sceneNumber: 1,
      type: 'Spatial Direction',
      title: 'Window view skyline mismatch',
      description: 'Check skyline continuity with art team: water tower visible in background of Shot 3 disappears in Shot 6 angle.',
      status: 'Open',
      referenceShotLabel: 'Scene 1 - Angle A',
      currentShotLabel: 'Scene 1 - Angle B',
      referenceShotImg: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=600&auto=format&fit=crop',
      currentShotImg: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop',
      fixAction: 'Lock VFX matte painting layer for window composite.'
    }
  ],
  visualDev: {
    colorPalette: [
      { name: 'Monsoon Blue', hex: '#274052' },
      { name: 'Earth Brown', hex: '#6b4d37' },
      { name: 'Moss Green', hex: '#485c49' },
      { name: 'Rust Orange', hex: '#b45731' },
      { name: 'Sunset Gold', hex: '#e2973c' },
      { name: 'Charcoal Grey', hex: '#2c313a' }
    ],
    keyFrames: [
      { id: 'kf1', code: 'KF-01', title: 'Aaranya returns to her hometown', description: 'Arriving at dusty railway platform under gathering thunderheads.', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop' },
      { id: 'kf2', code: 'KF-02', title: 'The first rain', description: 'First torrential downpour over Delhi government secretariat.', imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=600&auto=format&fit=crop' },
      { id: 'kf3', code: 'KF-03', title: 'An unresolved past', description: 'Father and daughter in dim lamp light confronting unspoken debt.', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
      { id: 'kf4', code: 'KF-04', title: 'A new beginning', description: 'Sun breaking through flooded streets after truth is exposed.', imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop' }
    ],
    artDirectionNotes: [
      { author: 'Kaustubh Deshmukh', time: '5 mins ago', text: 'Keep the visual language rooted, real and emotional. Avoid over-stylisation. Let the monsoon be a living character.' }
    ],
    visualChecklist: [
      { label: 'Overall look & feel defined', done: true },
      { label: 'Key locations visualized', done: true },
      { label: 'Main characters designed', done: true },
      { label: 'Costume direction set', done: true },
      { label: 'Key frames generated', done: true },
      { label: 'Color palette finalized', done: true },
      { label: 'Props & set references', done: false },
      { label: 'Poster concept', done: false }
    ]
  },
  production: {
    shootDays: 62,
    keyLocationsCount: 8,
    crewCount: 120,
    budgetTotalCr: 12.5,
    tentativeStart: '15 Oct 2026',
    readinessStatus: 'On Track',
    schedulePhases: [
      { name: 'Pre-Production', dates: '1 Oct – 14 Oct', color: '#10b981', barStartPercent: 0, barWidthPercent: 12 },
      { name: 'Recce & Location Prep', dates: '10 Oct – 25 Oct', color: '#3b82f6', barStartPercent: 8, barWidthPercent: 14 },
      { name: 'Casting & Rehearsals', dates: '10 Oct – 5 Nov', color: '#8b5cf6', barStartPercent: 8, barWidthPercent: 20 },
      { name: 'Set Design & Art Prep', dates: '20 Oct – 15 Nov', color: '#ec4899', barStartPercent: 15, barWidthPercent: 22 },
      {
        name: 'Principal Photography',
        dates: '15 Nov – 15 Feb',
        color: '#f97316',
        barStartPercent: 25,
        barWidthPercent: 55,
        subUnits: [
          { name: 'Unit 1 – Mumbai', dates: '15 Nov – 10 Dec', barStartPercent: 25, barWidthPercent: 18, color: '#f59e0b' },
          { name: 'Unit 2 – Konkan', dates: '5 Dec – 5 Jan', barStartPercent: 35, barWidthPercent: 22, color: '#f59e0b' },
          { name: 'Unit 3 – Delhi', dates: '1 Jan – 25 Jan', barStartPercent: 48, barWidthPercent: 18, color: '#f59e0b' },
          { name: 'Unit 4 – Ladakh', dates: '20 Jan – 15 Feb', barStartPercent: 58, barWidthPercent: 18, color: '#f59e0b' }
        ]
      },
      { name: 'Post-Production', dates: '10 Feb – 31 Mar', color: '#14b8a6', barStartPercent: 65, barWidthPercent: 30 },
      { name: 'Marketing Assets (BTS)', dates: '1 Mar – 31 Mar', color: '#a855f7', barStartPercent: 78, barWidthPercent: 22 }
    ],
    budgetCategories: [
      { category: 'Cast & Crew', amountCr: 4.2, percent: 34, color: '#3b82f6' },
      { category: 'Locations', amountCr: 2.1, percent: 17, color: '#06b6d4' },
      { category: 'Production Design', amountCr: 1.8, percent: 14, color: '#10b981' },
      { category: 'Equipment', amountCr: 1.5, percent: 12, color: '#8b5cf6' },
      { category: 'Travel & Logistics', amountCr: 1.2, percent: 10, color: '#f59e0b' },
      { category: 'Post-Production', amountCr: 1.0, percent: 8, color: '#ec4899' },
      { category: 'Contingency', amountCr: 0.7, percent: 5, color: '#64748b' }
    ],
    resources: [
      { name: 'Aarav Mehta', role: 'Director', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Rhea Kapoor', role: 'Producer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
      { name: 'Vikram Rao', role: 'DOP', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Ananya Sen', role: 'Production Designer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' }
    ],
    locations: [
      { name: 'Mumbai', type: 'Urban', days: 18, imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=400&auto=format&fit=crop' },
      { name: 'Konkan', type: 'Coastal', days: 20, imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop' },
      { name: 'Delhi', type: 'Urban', days: 15, imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=400&auto=format&fit=crop' },
      { name: 'Ladakh', type: 'Mountain', days: 15, imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop' }
    ],
    milestones: [
      { name: 'Script Lock', date: '15 Aug 2026', completed: true },
      { name: 'Casting Lock', date: '30 Sep 2026', completed: true },
      { name: 'Location Final', date: '25 Oct 2026', completed: false },
      { name: 'Shoot Start', date: '15 Nov 2026', completed: false },
      { name: 'Shoot Complete', date: '15 Feb 2027', completed: false },
      { name: 'Post Complete', date: '31 Mar 2027', completed: false },
      { name: 'Final Delivery', date: '30 Apr 2027', completed: false }
    ],
    risks: [
      { name: 'Weather risk (Konkan heavy unseasonal rain)', severity: 'Medium', mitigation: 'Backup indoor sets identified and reserved' },
      { name: 'Location permit delays (Central Delhi administrative zone)', severity: 'Medium', mitigation: 'Advance protocol approval in progress with nodal officer' },
      { name: 'Schedule overrun due to multi-city equipment freight', severity: 'High', mitigation: '5 buffer travel days incorporated between schedules' }
    ],
    documents: [
      { name: 'Production Plan v1.0', format: 'PDF', size: '2.4 MB', date: '20 Sep 2026' },
      { name: 'Location Recce Report', format: 'PDF', size: '3.1 MB', date: '18 Sep 2026' },
      { name: 'Budget Sheet', format: 'XLS', size: '1.2 MB', date: '18 Sep 2026' },
      { name: 'Equipment List', format: 'XLS', size: '0.8 MB', date: '15 Sep 2026' }
    ]
  },
  package: {
    stepsCompleted: 15,
    totalSteps: 15,
    deliverablesCount: 18,
    stakeholdersCount: 5,
    deliveryDate: '30 Sep 2027',
    isGreenlit: false,
    checklist: [
      { name: 'Script (final draft)', completed: true },
      { name: 'Dialogue Bible', completed: true },
      { name: 'Character Bible', completed: true },
      { name: 'World & Setting Guide', completed: true },
      { name: 'Visual Lookbook & Moodboard', completed: true },
      { name: 'Production Plan & Budget', completed: true },
      { name: 'Shooting Schedule', completed: true },
      { name: 'Casting Suggestions', completed: true },
      { name: 'Location Recce Report', completed: true },
      { name: 'Technical Requirements', completed: true },
      { name: 'Marketing & Positioning Note', completed: true },
      { name: 'One-Liner, Logline, Synopsis', completed: true },
      { name: 'Full Pitch Deck', completed: true },
      { name: 'Trailer / Mood Teaser (optional)', completed: true },
      { name: 'Final Review & Sign-off', completed: true }
    ],
    deliverables: [
      { id: 'del-1', title: 'Final Script', type: 'PDF', version: 'v1.0', size: '2.4 MB', color: '#ef4444' },
      { id: 'del-2', title: 'Treatment & Beat Sheet', type: 'DOC', version: 'v1.2', size: '1.8 MB', color: '#3b82f6' },
      { id: 'del-3', title: 'Character Bible', type: 'PDF', version: 'v1.1', size: '3.6 MB', color: '#ef4444' },
      { id: 'del-4', title: 'Visual Lookbook', type: 'PDF', version: 'v1.0', size: '12 MB', color: '#ef4444' },
      { id: 'del-5', title: 'Production Plan', type: 'XLS', version: 'v1.1', size: '1.1 MB', color: '#10b981' },
      { id: 'del-6', title: 'Budget Sheet', type: 'XLS', version: 'v1.1', size: '0.9 MB', color: '#10b981' },
      { id: 'del-7', title: 'Pitch Deck', type: 'PPT', version: 'v1.0', size: '8.4 MB', color: '#f59e0b' },
      { id: 'del-8', title: 'Mood Teaser', type: 'MP4', version: 'v1.0', size: '120 MB', color: '#8b5cf6' },
      { id: 'del-9', title: 'Marketing Note', type: 'PDF', version: 'v1.0', size: '1.3 MB', color: '#ef4444' }
    ],
    stakeholders: [
      { id: 'sh1', name: 'Don Vanzara', role: 'Founder', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', status: 'Approved', date: '20 Sep 2027' },
      { id: 'sh2', name: 'Creative Director', role: 'Creative Head', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', status: 'Approved', date: '21 Sep 2027' },
      { id: 'sh3', name: 'Rhea Kapoor', role: 'Producer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', status: 'In Review' },
      { id: 'sh4', name: 'Mehta Finance Group', role: 'Finance Head', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', status: 'Pending' },
      { id: 'sh5', name: 'Singhania & Partners', role: 'Legal Counsel', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', status: 'Pending' }
    ]
  }
};

export const secondaryProjects: TattvaCoProject[] = [
  {
    id: 'proj-raaste',
    title: 'Raaste',
    tagline: 'Truth is rarely pure, never simple.',
    posterUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=900&auto=format&fit=crop',
    contentType: 'Web Series',
    language: 'Hindi',
    genre: 'Investigative Crime',
    stage: 'Research',
    progressPercent: 18,
    lastUpdated: 'Updated 5 days ago',
    owner: 'Kaustubh Deshmukh',
    visibility: 'Internal',
    tags: ['Journalism', 'Crime', 'Small Town'],
    status: 'DRAFT',
    teamMembers: seedProject.teamMembers.slice(0, 3),
    intent: { ...seedProject.intent, premise: 'A small town journalist uncovers secrets buried for decades.' },
    researchQuestions: seedProject.researchQuestions.slice(0, 4),
    researchFindings: seedProject.researchFindings.slice(0, 2),
    storyDirections: seedProject.storyDirections,
    selectedDirectionId: 'sd-b',
    formats: seedProject.formats,
    templates: seedProject.templates,
    characters: seedProject.characters.slice(0, 3),
    selectedCharacterId: 'char-aanya',
    world: seedProject.world,
    structure: seedProject.structure,
    treatment: seedProject.treatment,
    scenes: seedProject.scenes.slice(0, 2),
    selectedSceneId: 'sc-1',
    screenplay: seedProject.screenplay.slice(0, 4),
    dialogueSuggestions: seedProject.dialogueSuggestions,
    qaIssues: [],
    visualDev: seedProject.visualDev,
    production: seedProject.production,
    package: seedProject.package
  },
  {
    id: 'proj-operation-sandglass',
    title: 'Operation Sandglass',
    tagline: 'A covert mission. A buried truth. A nation at stake.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=900&auto=format&fit=crop',
    contentType: 'Feature Film',
    language: 'Hindi',
    genre: 'Military Thriller',
    stage: 'Ideation',
    progressPercent: 10,
    lastUpdated: 'Updated 1 week ago',
    owner: 'Kaustubh Deshmukh',
    visibility: 'Restricted',
    tags: ['Military', 'Espionage', 'Desert'],
    status: 'DRAFT',
    teamMembers: seedProject.teamMembers.slice(1, 4),
    intent: { ...seedProject.intent, premise: 'A covert mission across border territory uncovers an intelligence black op.' },
    researchQuestions: seedProject.researchQuestions.slice(0, 3),
    researchFindings: seedProject.researchFindings.slice(0, 2),
    storyDirections: seedProject.storyDirections,
    selectedDirectionId: 'sd-a',
    formats: seedProject.formats,
    templates: seedProject.templates,
    characters: seedProject.characters.slice(0, 2),
    selectedCharacterId: 'char-aanya',
    world: seedProject.world,
    structure: seedProject.structure,
    treatment: seedProject.treatment,
    scenes: seedProject.scenes.slice(0, 2),
    selectedSceneId: 'sc-1',
    screenplay: seedProject.screenplay.slice(0, 4),
    dialogueSuggestions: seedProject.dialogueSuggestions,
    qaIssues: [],
    visualDev: seedProject.visualDev,
    production: seedProject.production,
    package: seedProject.package
  }
];
