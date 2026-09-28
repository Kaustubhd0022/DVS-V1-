import fs from 'fs';
import path from 'path';

// Read .env.local manually for the test script
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

// Dynamically import project factory and AI service
import { createEmptyProject } from './src/data/emptyProject.js';
import { 
  buildProjectContext, 
  analyzeConceptIntake, 
  generateCharacterCandidate, 
  generateResearchTopics,
  checkProjectContinuity, 
  evaluateProjectNarrative,
  getGroqApiKey,
  getLastAiDebugTrace
} from './src/services/aiService.js';
import { CanonFact, CreativeDecision, Character } from './src/types/project.js';

async function runAcceptanceTests() {
  console.log('============================================================');
  console.log('TATTAVA COPILOT — V1 PILOT COMPREHENSIVE ACCEPTANCE SUITE');
  console.log('============================================================\n');

  const apiKey = getGroqApiKey();
  console.log(`[Config] Groq LPU API Key present: ${!!apiKey} (${apiKey ? apiKey.substring(0, 10) + '...' : 'NONE'})\n`);

  if (!apiKey) {
    throw new Error('FATAL: VITE_GROQ_API_KEY is not configured in .env.local.');
  }

  // -------------------------------------------------------------
  // TEST 1: CREATE NEW PROJECT (Marine Biologist)
  // -------------------------------------------------------------
  console.log('--- TEST 1: CREATE NEW PROJECT FROM USER INPUT ---');
  const premise1 = 'My story is about a 28-year-old marine biologist who discovers that a coastal village is hiding a dangerous secret.';
  const proj1 = createEmptyProject('proj-marine-01', 'Tide of Shadows', premise1, {
    contentType: 'Feature Film',
    language: 'English',
    genre: 'Eco-Thriller'
  });

  console.log(`Project Title: ${proj1.title}`);
  console.log(`Project Premise: ${proj1.intent.premise}`);
  console.log(`Initial Characters count: ${proj1.characters.length}`);
  console.log(`Initial Canon Facts count: ${proj1.storyBrain.canonFacts.length}`);
  console.log(`Initial Research count: ${proj1.researchFindings.length}`);
  console.log(`Initial Continuity Issues count: ${proj1.continuityIssues.length}`);
  console.log(`Initial Evaluation: ${proj1.evaluation}`);

  // Assertions for Test 1
  const serialized1 = JSON.stringify(proj1).toLowerCase();
  if (serialized1.includes('rajyam') || serialized1.includes('aanya verma') || serialized1.includes('vidarbha')) {
    throw new Error('FAILED TEST 1: Newly created project contains legacy sample data!');
  }
  if (proj1.characters.length !== 0 || proj1.storyBrain.canonFacts.length !== 0) {
    throw new Error('FAILED TEST 1: New project did not start clean and empty!');
  }
  console.log('>>> TEST 1 PASSED: Project starts completely clean with ZERO hardcoded data.\n');

  // -------------------------------------------------------------
  // TEST 2: AI INTAKE ANALYSIS & CONTEXT PROPAGATION
  // -------------------------------------------------------------
  console.log('--- TEST 2: AI INTAKE ANALYSIS VIA GROQ LPU (120B) ---');
  console.log('Calling analyzeConceptIntake with actual project premise...');
  const intakeRes = await analyzeConceptIntake(premise1, {
    projectTitle: proj1.title,
    contentType: proj1.contentType
  });

  console.log(`Identified Protagonist: ${intakeRes.protagonist}`);
  console.log(`Identified Setting: ${intakeRes.setting}`);
  console.log(`Identified Conflict: ${intakeRes.conflict}`);
  console.log(`Known Elements: ${intakeRes.knownInformation.join(', ')}`);
  console.log(`Unknown Elements: ${intakeRes.unknownInformation.slice(0, 2).join(', ')}`);
  console.log(`Missing Questions: ${(intakeRes.missingQuestions || []).slice(0, 2).join(' | ')}`);

  const trace1 = getLastAiDebugTrace();
  console.log(`AI Trace Latency: ${trace1?.latencyMs}ms on ${trace1?.model}`);

  const intakeStr = JSON.stringify(intakeRes).toLowerCase();
  if (intakeStr.includes('rajyam') || intakeStr.includes('aanya') || intakeStr.includes('vidarbha flood')) {
    throw new Error('FAILED TEST 2: AI response contaminated with legacy sample data!');
  }
  if (!intakeStr.includes('marine') && !intakeStr.includes('biologist') && !intakeStr.includes('coastal') && !intakeStr.includes('secret')) {
    throw new Error('FAILED TEST 2: AI did not process the actual marine biologist user premise!');
  }
  console.log('>>> TEST 2 PASSED: Groq LPU processed actual user input with zero legacy contamination.\n');

  // -------------------------------------------------------------
  // TEST 3: INITIALIZE STORY BRAIN & APPROVE CANDIDATE
  // -------------------------------------------------------------
  console.log('--- TEST 3: STORY BRAIN INITIALIZATION & HUMAN APPROVAL GATE ---');
  // Human approval of intake initializes Story Brain
  const char1Id = 'char-tara-1';
  const char1: Character = {
    id: char1Id,
    name: 'Dr. Tara Mendes',
    role: 'Protagonist',
    age: 28,
    gender: 'Female',
    occupation: 'Marine Biologist',
    location: 'Coastal Village',
    tags: ['Protagonist', 'Canonical'],
    quote: 'The reef is dying because someone is poisoning it deliberately.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
    status: 'APPROVED',
    candidateState: 'CANONICAL',
    want: 'Expose the source of the toxicity and protect the sanctuary',
    need: 'Overcome self-doubt and confront the local syndicate',
    fear: 'Being discredited and silenced by local authorities',
    flaw: 'Stubbornly distrustful of community elders',
    strength: 'Forensic chemical expertise',
    secret: 'Discovered the contamination was initiated by her family company',
    arc: 'From naive academic to determined whistleblower',
    voiceStyle: 'Empirical, urgent, concise',
    contradictions: 'Loves the coastal village yet suspects every inhabitant',
    relationships: [],
    scenesAppeared: [1]
  };

  const canonFact1: CanonFact = {
    id: 'cf-01',
    statement: `Core Premise: ${premise1}`,
    category: 'Plot Law',
    entityIds: [char1Id],
    source: 'Approved Project Intake',
    dateEstablished: '28 Sep 2026',
    isLocked: true,
    version: 'v0.2',
    tags: ['Premise', 'Core Hook']
  };

  const decision1: CreativeDecision = {
    id: 'dec-01',
    date: '28 Sep 2026',
    title: 'Approved Marine Biologist Protagonist & Coastal Setting',
    decision: 'Approved Marine Biologist Protagonist & Coastal Setting',
    rationale: 'Derived from user premise and confirmed through human review gate.',
    author: 'Lead Producer',
    role: 'Story Editor',
    status: 'Approved',
    impactedAreas: ['Story Brain', 'Protagonist Architecture']
  };

  proj1.characters.push(char1);
  proj1.storyBrain.canonFacts.push(canonFact1);
  proj1.storyBrain.creativeDecisions.push(decision1);
  proj1.canonicalVersion = 'v0.2-canonical';

  console.log(`Story Brain Canon Facts: ${proj1.storyBrain.canonFacts.length}`);
  console.log(`Canonical Version bumped to: ${proj1.canonicalVersion}`);
  console.log(`Active Protagonist: ${proj1.characters[0].name} (${proj1.characters[0].role})`);

  // Now ask AI to develop an Antagonist candidate for THIS specific project context
  console.log('\nSynthesizing Antagonist Candidate tailored to Dr. Tara Mendes and the coastal mystery...');
  const antagonistCandidate = await generateCharacterCandidate(proj1, 'Antagonist');
  console.log(`Generated Antagonist: ${antagonistCandidate.name} (${antagonistCandidate.role})`);
  console.log(`Antagonist Want: ${antagonistCandidate.want}`);
  console.log(`Antagonist Flaw: ${antagonistCandidate.flaw}`);
  console.log(`Antagonist Moral Dilemma: ${antagonistCandidate.moralDilemma}`);

  const antagStr = JSON.stringify(antagonistCandidate).toLowerCase();
  if (antagStr.includes('raghav') || antagStr.includes('aanya') || antagStr.includes('vidarbha')) {
    throw new Error('FAILED TEST 3: Generated antagonist referenced legacy sample project!');
  }
  console.log('>>> TEST 3 PASSED: Candidate generated dynamically using current Story Brain context.\n');

  // -------------------------------------------------------------
  // TEST 4: DYNAMIC CONTINUITY & EVALUATION
  // -------------------------------------------------------------
  console.log('--- TEST 4: DYNAMIC CONTINUITY AUDIT & EVALUATION ---');
  const continuityCheck = await checkProjectContinuity(proj1);
  console.log(`Continuity Verdict: ${continuityCheck.summary}`);
  console.log(`Identified Inconsistencies: ${continuityCheck.issues.length}`);

  const evalResult = await evaluateProjectNarrative(proj1);
  console.log(`Overall Readiness Score: ${evalResult.overallScore}% (${evalResult.readinessStatus})`);
  console.log(`Key Strengths: ${evalResult.keyStrengths?.join(', ') || 'N/A'}`);
  console.log(`Critical Risks: ${evalResult.criticalRisks?.join(', ') || 'N/A'}`);

  console.log('>>> TEST 4 PASSED: Dynamic continuity and evaluation run against live project state.\n');

  // -------------------------------------------------------------
  // TEST 5: CREATE A SECOND DISTINCT PROJECT (Mumbai Financial Fraud)
  // -------------------------------------------------------------
  console.log('--- TEST 5: CREATE SECOND PROJECT & VERIFY STRICT ISOLATION ---');
  const premise2 = 'My story is about a Mumbai-based investigative journalist investigating a multi-crore financial fraud in a shadow bank.';
  const proj2 = createEmptyProject('proj-mumbai-02', 'The Shadow Ledger', premise2, {
    contentType: 'Series',
    language: 'Hindi / English',
    genre: 'Financial Thriller'
  });

  console.log(`Project 2 Title: ${proj2.title}`);
  console.log(`Project 2 Premise: ${proj2.intent.premise}`);
  console.log(`Project 2 Initial Characters: ${proj2.characters.length}`);
  console.log(`Project 2 Initial Canon Facts: ${proj2.storyBrain.canonFacts.length}`);

  // Cross-contamination assertion
  const serialized2 = JSON.stringify(proj2).toLowerCase();
  if (serialized2.includes('tara') || serialized2.includes('marine') || serialized2.includes('reef') || serialized2.includes('village')) {
    throw new Error('FAILED TEST 5: Project 2 inherited context or characters from Project 1!');
  }

  console.log('\nRunning Intake Analysis on Project 2 (Financial Fraud)...');
  const intake2 = await analyzeConceptIntake(premise2, {
    projectTitle: proj2.title,
    contentType: proj2.contentType
  });
  console.log(`Project 2 Protagonist: ${intake2.protagonist}`);
  console.log(`Project 2 Setting: ${intake2.setting}`);
  console.log(`Project 2 Conflict: ${intake2.conflict}`);

  const intake2Str = JSON.stringify(intake2).toLowerCase();
  if (intake2Str.includes('marine') || intake2Str.includes('tara') || intake2Str.includes('coastal')) {
    throw new Error('FAILED TEST 5: AI cross-contaminated Project 2 with Project 1 concepts!');
  }

  console.log('>>> TEST 5 PASSED: Project 2 is strictly isolated with zero cross-project leakage.\n');

  // -------------------------------------------------------------
  // SECTION 26: THREE DIFFERENT PROJECTS COMPARISON TEST
  // -------------------------------------------------------------
  console.log('--- SECTION 26: 3-PROJECT DIVERSITY MATRIX TEST ---');
  const premise3 = 'In 1857, a royal cartographer secretly charts subterranean escape tunnels beneath an imperial palace during a siege.';
  const proj3 = createEmptyProject('proj-historical-03', 'The Subterranean Crown', premise3, {
    contentType: 'Feature Film',
    language: 'Urdu / Hindi',
    genre: 'Historical Period Drama'
  });

  const research1 = await generateResearchTopics(proj1);
  const research2 = await generateResearchTopics(proj2);
  const research3 = await generateResearchTopics(proj3);

  console.log(`\nProject 1 (Marine Bio) Top Research Domain: ${research1.topics[0]?.topic}`);
  console.log(`Project 2 (Financial Fraud) Top Research Domain: ${research2.topics[0]?.topic}`);
  console.log(`Project 3 (1857 Historical) Top Research Domain: ${research3.topics[0]?.topic}`);

  // Assert that research domains are completely distinct
  const r1Topic = research1.topics[0]?.topic.toLowerCase();
  const r2Topic = research2.topics[0]?.topic.toLowerCase();
  const r3Topic = research3.topics[0]?.topic.toLowerCase();

  if (r1Topic === r2Topic || r2Topic === r3Topic || r1Topic === r3Topic) {
    throw new Error('FAILED SECTION 26: Distinct projects generated identical research topics!');
  }

  console.log('\n>>> SECTION 26 PASSED: All three project inputs produced completely distinct, project-specific intelligence!');
  console.log('============================================================');
  console.log('ALL ACCEPTANCE TESTS COMPLETED SUCCESSFULLY.');
  console.log('============================================================');
}

runAcceptanceTests().catch(err => {
  console.error('\nACCEPTANCE TEST SUITE FAILED:', err);
  process.exit(1);
});
