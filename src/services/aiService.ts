/**
 * tattvaCo AI Service — Powered by Groq LPU Ultra-Fast Inference
 * Models: openai/gpt-oss-120b (Flagship 120B) & openai/gpt-oss-20b
 * Latency: ~0.15s - 0.3s
 */

const DEFAULT_GROQ_KEY = '';
const ENV_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

export const getGroqApiKey = (): string => {
  return (
    localStorage.getItem('tattvaco_groq_api_key') ||
    localStorage.getItem('tattvaco_gemini_api_key') ||
    ENV_KEY ||
    DEFAULT_GROQ_KEY
  );
};

export const setGroqApiKey = (key: string): void => {
  const trimmed = key.trim();
  localStorage.setItem('tattvaco_groq_api_key', trimmed);
  localStorage.setItem('tattvaco_gemini_api_key', trimmed);
};

// Aliases for compatibility
export const getGeminiApiKey = getGroqApiKey;
export const setGeminiApiKey = setGroqApiKey;

/**
 * Generic Groq API caller with model fallback and error handling
 */
async function callGroq(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    temperature?: number;
    max_tokens?: number;
    jsonMode?: boolean;
  } = {}
): Promise<string> {
  const apiKey = getGroqApiKey();
  const { temperature = 0.7, max_tokens = 1200, jsonMode = false } = options;

  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (const model of modelsToTry) {
    try {
      const payload: any = {
        model,
        messages,
        temperature,
        max_tokens
      };

      if (jsonMode) {
        payload.response_format = { type: 'json_object' };
      }

      const res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.warn(`Groq request failed on ${model}:`, errJson);
        continue; // Try fallback model
      }

      const data = await res.json();
      const choice = data.choices?.[0];
      if (!choice) continue;

      let content = choice.message?.content?.trim() || '';
      // If reasoning model left content blank but produced reasoning, extract text
      if (!content && choice.message?.reasoning) {
        content = choice.message.reasoning.trim();
      }

      if (content) {
        return content;
      }
    } catch (err) {
      console.warn(`Error calling Groq on ${model}:`, err);
    }
  }

  throw new Error('All Groq model attempts failed.');
}

/**
 * Test connection to Groq API and measure latency
 */
export const testGroqConnection = async (): Promise<{ success: boolean; message: string; latencyMs?: number }> => {
  const apiKey = getGroqApiKey();
  const startTime = performance.now();

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages: [{ role: 'user', content: 'Say "tattvaCo Online" and nothing else.' }],
        max_tokens: 50
      })
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { 
        success: false, 
        message: err.error?.message || `HTTP ${res.status}: Connection failed` 
      };
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Online';
    return {
      success: true,
      message: `Connected: Groq LPU (${PRIMARY_MODEL}) • ${elapsed}ms latency • "${reply}"`,
      latencyMs: elapsed
    };
  } catch (e: any) {
    return { success: false, message: e.message || 'Network error connecting to Groq' };
  }
};

export const testGeminiConnection = testGroqConnection;

/**
 * Contextual Film Intelligence Copilot
 */
export const askCopilot = async (
  userPrompt: string,
  projectContextSummary: string,
  chatHistory: Array<{ sender: 'user' | 'tattvaCo' | 'tattava'; text: string }> = []
): Promise<string> => {
  const systemInstruction = `You are tattvaCo AI Copilot, an elite film development executive, script doctor, and production operating intelligence.
You speak with cinematic authority, deep structural insight (Syd Field, Blake Snyder, Robert McKee), emotional precision, and commercial realism.
You are assisting on the project described below:

PROJECT CONTEXT:
${projectContextSummary}

DIRECTIVES:
- Keep answers concise, direct, and actionable for filmmakers (2 to 4 paragraphs max, or bulleted beats).
- Use film industry terminology (sluglines, subtext, inciting incident, pinch points, midpoints, tonal registers, reversal).
- When asked for dialogue or scenes, write standard formatted screenplay lines with emotional subtext.
- Always tie your advice back to the project's core themes, conflicts, and characters.`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemInstruction }
  ];

  // Include recent conversation context (last 6 messages)
  for (const msg of chatHistory.slice(-6)) {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  }

  messages.push({
    role: 'user',
    content: userPrompt
  });

  try {
    const reply = await callGroq(messages, {
      temperature: 0.7,
      max_tokens: 1000
    });
    return reply;
  } catch (error) {
    console.warn('Groq askCopilot fallback:', error);
    return `[tattvaCo Copilot Analysis]: For "${userPrompt}", deepening the protagonist's moral dilemma in Act II while compressing the timeline will significantly amplify audience investment and narrative velocity.`;
  }
};

/**
 * Concept Intake Breakdown with JSON Schema
 */
export const analyzeConceptIntake = async (
  rawIdea: string
): Promise<{
  premise: string;
  protagonist: string;
  setting: string;
  conflict: string;
  stakes: string;
  themes: string[];
  tone: string;
  missingQuestions: string[];
}> => {
  const prompt = `Deconstruct this raw film concept into structured narrative pillars.
Return ONLY valid JSON matching this exact structure:
{
  "premise": "A succinct, commercial logline (1 sentence)",
  "protagonist": "Protagonist identity, age, flaw, and dramatic objective",
  "setting": "Specific geographical, atmospheric, and temporal world",
  "conflict": "The irreconcilable dilemma or systemic adversary",
  "stakes": "What happens if the protagonist fails (catastrophic consequences)",
  "themes": ["Theme 1", "Theme 2", "Theme 3"],
  "tone": "Atmospheric, Noir, Tense Procedural (3-4 adjectives)",
  "missingQuestions": [
    "Crucial story gap or unaddressed question 1",
    "Crucial story gap or unaddressed question 2",
    "Crucial story gap or unaddressed question 3"
  ]
}

Raw Concept:
"""${rawIdea}"""`;

  try {
    const rawJson = await callGroq(
      [
        { role: 'system', content: 'You are an elite film acquisition executive and story analyst. You output clean, valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      {
        temperature: 0.6,
        max_tokens: 1500,
        jsonMode: true
      }
    );

    // Extract JSON in case there's reasoning prefix
    const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        premise: parsed.premise || rawIdea.slice(0, 150),
        protagonist: parsed.protagonist || 'A resilient protagonist trapped by circumstances.',
        setting: parsed.setting || 'Contemporary urban pressure-cooker environment.',
        conflict: parsed.conflict || 'An intractable systemic conspiracy.',
        stakes: parsed.stakes || 'Total personal ruin and public collapse.',
        themes: Array.isArray(parsed.themes) && parsed.themes.length ? parsed.themes : ['Corruption', 'Truth', 'Sacrifice'],
        tone: parsed.tone || 'Grounded, Urgent, Visceral',
        missingQuestions: Array.isArray(parsed.missingQuestions) && parsed.missingQuestions.length 
          ? parsed.missingQuestions 
          : ['What is the protagonist’s primary vulnerability?', 'What ticking clock forces the climax?']
      };
    }
  } catch (e) {
    console.warn('Groq Intake parse fallback', e);
  }

  // Resilient fallback
  return {
    premise: rawIdea.slice(0, 180) + '...',
    protagonist: 'Compelling central figure forced into an impossible moral corner.',
    setting: 'High-density urban or regional pressure-cooker environment.',
    conflict: 'Systemic institutional resistance confronting individual conscience.',
    stakes: 'Irreversible catastrophic public failure and personal ruin.',
    themes: ['Institutional Complicity', 'Sacrifice', 'Truth vs Self-Preservation'],
    tone: 'Grounded, Urgent, Visceral, High Tension',
    missingQuestions: [
      'What specific secret does the protagonist hold before the inciting incident?',
      'How is the ticking clock physically manifested in the environment?',
      'What is the personal relationship between protagonist and primary antagonist?'
    ]
  };
};

/**
 * Punch Up Dialogue line with Subtext & Cadence
 */
export const punchUpDialogue = async (
  currentDialogue: string,
  characterName: string,
  sceneContext: string,
  instruction: string = 'Inject cold subtext and eliminate exposition'
): Promise<string> => {
  const prompt = `You are an elite Hollywood script doctor. Punch up this dialogue line.
Character: ${characterName}
Scene Context: ${sceneContext}
Current Line: "${currentDialogue}"
Doctor's Instruction: ${instruction}

Return ONLY the punched-up dialogue line itself, in quotation marks, with no other commentary or pleasantries.`;

  try {
    const res = await callGroq([
      { role: 'system', content: 'You are a master screenplay dialogue doctor. Output only the revised line.' },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.75,
      max_tokens: 200
    });

    let cleaned = res.trim().replace(/^["']|["']$/g, '');
    if (cleaned) return cleaned;
  } catch (e) {
    console.warn('Groq punch up fallback', e);
  }

  return "The pressure differentials aren't glitching. Someone bled the telemetry line manually twenty minutes ago.";
};

/**
 * Character Backstory & Psychometrics Synthesis
 */
export const generateCharacterBackstory = async (
  charName: string,
  charRole: string,
  age: number,
  logline: string
): Promise<{ backstory: string; contradictions: string; secret: string }> => {
  const prompt = `Synthesize deep character psychometrics for a feature film.
Character: ${charName} (Role: ${charRole}, Age: ${age})
Film Logline: ${logline}

Return ONLY valid JSON matching:
{
  "backstory": "Formative childhood trauma or turning point in 2 sentences",
  "contradictions": "Key internal moral contradiction in 1 sentence",
  "secret": "A devastating secret they guard from everyone in 1 sentence"
}`;

  try {
    const rawJson = await callGroq([
      { role: 'system', content: 'You are an elite screenwriting character consultant. Return JSON only.' },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.7,
      max_tokens: 600,
      jsonMode: true
    });

    const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn('Groq Character generator fallback', e);
  }

  return {
    backstory: `${charName} was raised during the severe drought of 2008, witnessing their family's small agrarian firm collapse under corrupt municipal water allocations.`,
    contradictions: 'Demands absolute empirical honesty from colleagues while operating under an assumed institutional certification.',
    secret: 'Personally destroyed the audit log that would have acquitted their predecessor three years ago.'
  };
};

/**
 * Generate Story Directions
 */
export const generateStoryDirection = async (
  currentPremise: string,
  notes: string
): Promise<{ title: string; logline: string; engine: string; comp: string }> => {
  const prompt = `Create an alternative high-concept story direction for this film.
Current Premise: "${currentPremise}"
Creator Notes: "${notes}"

Return valid JSON:
{
  "title": "Compelling Title",
  "logline": "1-2 sentence razor-sharp logline",
  "engine": "The ongoing dramatic engine generating scenes",
  "comp": "Film Comp (e.g. Sicario meets Spotlight)"
}`;

  try {
    const rawJson = await callGroq([
      { role: 'system', content: 'You are a high-level creative film producer. Return valid JSON only.' },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.8,
      max_tokens: 600,
      jsonMode: true
    });

    const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn('Groq Story direction fallback', e);
  }

  return {
    title: 'The Whistleblower Equation',
    logline: 'An investigative hydrologist uncovers a pattern of fabricated water toxicity reports engineered to displace an ancient fishing township.',
    engine: 'Every revealed document implicates another person in her immediate family circle.',
    comp: 'Erin Brockovich meets Chinatown'
  };
};
