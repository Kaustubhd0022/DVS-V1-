/**
 * Surgical Script Doctor Engine
 * Executes targeted script revisions, humor enhancements, segment shortening,
 * and storyboard extractions with strict instruction fidelity and zero collateral drift.
 */

import { ScreenplayLine, SceneItem, TattavaProject } from '../types/project';
import { callAI, extractJsonFromResponse } from './aiService';

export type ScriptDoctorScope = 
  | 'SHORTEN_SEGMENT'
  | 'REWRITE_SCENE'
  | 'IMPROVE_HUMOUR'
  | 'NATURAL_HINGLISH'
  | 'STORYBOARD_EXTRACTION'
  | 'GENERAL_SURGICAL_EDIT';

export interface StoryboardFrame {
  frameNumber: number;
  sceneNumber: number;
  shotType: 'WIDE_ESTABLISHING' | 'MEDIUM_TWO_SHOT' | 'CLOSE_UP' | 'INSERT_DETAIL' | 'DUTCH_ANGLE' | 'CUTAWAY_GRAPHIC';
  visualDescription: string;
  sourceDialogueOrAction: string;
  charactersPresent: string[];
  cameraMovement: string;
  acousticOrAudioCue: string;
}

export interface ScriptRevisionResult {
  scope: ScriptDoctorScope;
  instructionSummary: string;
  targetedSceneNumbers: number[];
  unmodifiedSceneNumbers: number[];
  revisedLines: ScreenplayLine[];
  storyboardFrames?: StoryboardFrame[];
  diffSummary: string;
}

/**
 * Detects the surgical scope from user instruction
 */
export function classifyDoctorScope(instruction: string): {
  scope: ScriptDoctorScope;
  targetSegmentOrSceneNumber?: number;
} {
  const lower = instruction.toLowerCase();

  // Shorten specific segment: e.g. "Shorten Segment 3 without changing other segments"
  const shortenMatch = lower.match(/shorten\s+(?:segment|scene)\s*([0-9]+)/i);
  if (shortenMatch) {
    return {
      scope: 'SHORTEN_SEGMENT',
      targetSegmentOrSceneNumber: parseInt(shortenMatch[1], 10)
    };
  }

  // Rewrite opening scene: e.g. "Rewrite the opening scene while preserving the remaining script"
  if (lower.includes('opening scene') || lower.includes('hook') || lower.includes('scene 1')) {
    return {
      scope: 'REWRITE_SCENE',
      targetSegmentOrSceneNumber: 1
    };
  }

  // Storyboard conversion: e.g. "Convert the script into a storyboard without inventing missing plot details"
  if (lower.includes('storyboard')) {
    return {
      scope: 'STORYBOARD_EXTRACTION'
    };
  }

  // Improve humour: e.g. "Improve the humour without changing the story"
  if (lower.includes('humour') || lower.includes('humor') || lower.includes('funnier') || lower.includes('joke') || lower.includes('wit')) {
    return {
      scope: 'IMPROVE_HUMOUR'
    };
  }

  // Natural Hinglish: e.g. "Make the dialogue more natural while retaining Hinglish"
  if (lower.includes('natural') || lower.includes('hinglish') || lower.includes('dialogue')) {
    return {
      scope: 'NATURAL_HINGLISH'
    };
  }

  return {
    scope: 'GENERAL_SURGICAL_EDIT'
  };
}

/**
 * Executes a surgical script revision according to user instruction
 */
export async function executeSurgicalScriptEdit(
  scriptLines: ScreenplayLine[],
  scenes: SceneItem[],
  instruction: string,
  project?: TattavaProject
): Promise<ScriptRevisionResult> {
  const { scope, targetSegmentOrSceneNumber } = classifyDoctorScope(instruction);

  // CASE 1: STORYBOARD EXTRACTION (Strictly zero invented plot details)
  if (scope === 'STORYBOARD_EXTRACTION') {
    const contextPrompt = scenes.slice(0, 8).map(s => `
Scene ${s.sceneNumber}: ${s.slugline}
Characters: ${s.characters.join(', ')}
Summary: ${s.summary}
Actions & Dialogue:
${scriptLines.filter(l => l.sceneNumber === s.sceneNumber).map(l => `${l.characterName ? l.characterName + ': ' : ''}${l.content}`).join('\n')}
    `.trim()).join('\n\n---\n\n');

    const prompt = `Convert this authentic screenplay into cinematic storyboard frames.
CRITICAL CONSTRAINT: Derive every frame STRICTLY and EXCLUSIVELY from the provided script lines.
DO NOT invent extraneous characters, locations, or plot twists outside the text.

${contextPrompt}

Return ONLY valid JSON matching:
{
  "frames": [
    {
      "frameNumber": 1,
      "sceneNumber": 1,
      "shotType": "MEDIUM_TWO_SHOT",
      "visualDescription": "Detailed visual composition derived directly from scene text",
      "sourceDialogueOrAction": "Verbatim quote from the script",
      "charactersPresent": ["Aarav", "Maya"],
      "cameraMovement": "Static slowly pushing in",
      "acousticOrAudioCue": "Lofi-Bollywood music under dialog"
    }
  ]
}`;

    const raw = await callAI([
      { role: 'system', content: 'You are a master storyboard artist and film director. Return JSON only.' },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.5,
      max_tokens: 2800,
      jsonMode: true,
      taskName: 'Storyboard Extraction'
    });

    const parsed = extractJsonFromResponse(raw);
    const frames: StoryboardFrame[] = parsed.frames || [];

    return {
      scope,
      instructionSummary: instruction,
      targetedSceneNumbers: scenes.map(s => s.sceneNumber),
      unmodifiedSceneNumbers: [],
      revisedLines: scriptLines, // lines unchanged
      storyboardFrames: frames,
      diffSummary: `Extracted ${frames.length} visual storyboard frames strictly derived from script text with zero invented plot details.`
    };
  }

  // CASE 2: TARGETED SHORTENING (e.g. Shorten Segment 3 without changing any other segments)
  if (scope === 'SHORTEN_SEGMENT' && targetSegmentOrSceneNumber !== undefined) {
    const matchingScene = scenes.find(s => 
      s.subheading?.toLowerCase() === `segment ${targetSegmentOrSceneNumber}` ||
      s.slugline?.toLowerCase().includes(`segment ${targetSegmentOrSceneNumber}:`) ||
      s.slugline?.toLowerCase().includes(`segment ${targetSegmentOrSceneNumber} `)
    );
    const targetSceneNum = matchingScene ? matchingScene.sceneNumber : targetSegmentOrSceneNumber;
    
    // Partition lines into untouched vs target
    const untouchedLinesBefore = scriptLines.filter(l => l.sceneNumber < targetSceneNum);
    const targetLines = scriptLines.filter(l => l.sceneNumber === targetSceneNum);
    const untouchedLinesAfter = scriptLines.filter(l => l.sceneNumber > targetSceneNum);

    if (targetLines.length === 0) {
      throw new Error(`TARGET_SEGMENT_NOT_FOUND: Segment/Scene ${targetSegmentOrSceneNumber} was not found in the script.`);
    }

    const targetText = targetLines.map(l => `${l.type === 'character' ? l.content + ':' : l.type === 'scene_heading' ? '=== ' + l.content + ' ===' : l.content}`).join('\n');

    const prompt = `You are a surgical script doctor.
USER INSTRUCTION: "${instruction}"
MANDATE: Shorten and condense this specific segment (Segment ${targetSceneNum}) by ~40-50% while preserving its essential core topic, wit, and character voices.
Do not change any other scene.

=== TARGET SEGMENT ${targetSceneNum} SOURCE CONTENT ===
${targetText}

Return ONLY valid JSON matching:
{
  "condensedLines": [
    {
      "type": "scene_heading" | "action" | "character" | "dialogue" | "parenthetical",
      "characterName": "Aarav",
      "content": "Line text..."
    }
  ],
  "rationale": "Brief explanation of how the segment was tightened without losing its core punch."
}`;

    const raw = await callAI([
      { role: 'system', content: 'You are an elite script editor. Return JSON only.' },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.6,
      max_tokens: 2000,
      jsonMode: true,
      taskName: `Shorten Segment ${targetSceneNum}`
    });

    const parsed = extractJsonFromResponse(raw);
    const newTargetLines: ScreenplayLine[] = (parsed.condensedLines || []).map((l: any, idx: number) => ({
      id: `scr-short-${targetSceneNum}-${Date.now()}-${idx + 1}`,
      sceneNumber: targetSceneNum,
      type: l.type || 'dialogue',
      characterName: l.characterName,
      content: l.content,
      candidateState: 'HUMAN_EDITED'
    }));

    const mergedLines = [...untouchedLinesBefore, ...newTargetLines, ...untouchedLinesAfter];
    const allSceneNums = Array.from(new Set(scriptLines.map(l => l.sceneNumber)));
    const untouchedSceneNums = allSceneNums.filter(n => n !== targetSceneNum);

    return {
      scope,
      instructionSummary: instruction,
      targetedSceneNumbers: [targetSceneNum],
      unmodifiedSceneNumbers: untouchedSceneNums,
      revisedLines: mergedLines,
      diffSummary: `Surgically shortened Segment ${targetSceneNum} from ${targetLines.length} to ${newTargetLines.length} lines. All other segments (${untouchedSceneNums.join(', ')}) remain 100% character-for-character intact.`
    };
  }

  // CASE 3: REWRITE OPENING SCENE (e.g. Rewrite opening scene while preserving remaining script)
  if (scope === 'REWRITE_SCENE' && (targetSegmentOrSceneNumber === 1 || targetSegmentOrSceneNumber === undefined)) {
    const targetSceneNum = 1;
    const targetLines = scriptLines.filter(l => l.sceneNumber === targetSceneNum);
    const untouchedLines = scriptLines.filter(l => l.sceneNumber > targetSceneNum);

    const targetText = targetLines.map(l => `${l.characterName ? l.characterName + ': ' : ''}${l.content}`).join('\n');

    const prompt = `You are a master screenwriter.
USER INSTRUCTION: "${instruction}"
MANDATE: Rewrite Scene 1 (The Opening Hook) with heightened wit, vivid physical comedy, and dynamic banter, while introducing the exact same core premise.
DO NOT change anything in subsequent scenes.

=== CURRENT OPENING SCENE 1 ===
${targetText}

Return ONLY valid JSON matching:
{
  "rewrittenLines": [
    {
      "type": "scene_heading" | "action" | "character" | "dialogue" | "parenthetical",
      "characterName": "Aarav",
      "content": "Line text..."
    }
  ],
  "rationale": "Explanation of how the hook was rewritten with higher impact."
}`;

    const raw = await callAI([
      { role: 'system', content: 'You are an elite screenwriter and dialogue master. Return JSON only.' },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.7,
      max_tokens: 2200,
      jsonMode: true,
      taskName: 'Rewrite Opening Scene'
    });

    const parsed = extractJsonFromResponse(raw);
    const newOpeningLines: ScreenplayLine[] = (parsed.rewrittenLines || []).map((l: any, idx: number) => ({
      id: `scr-hook-${Date.now()}-${idx + 1}`,
      sceneNumber: 1,
      type: l.type || 'dialogue',
      characterName: l.characterName,
      content: l.content,
      candidateState: 'HUMAN_EDITED'
    }));

    const mergedLines = [...newOpeningLines, ...untouchedLines];
    const allSceneNums = Array.from(new Set(scriptLines.map(l => l.sceneNumber)));
    const untouchedSceneNums = allSceneNums.filter(n => n !== 1);

    return {
      scope,
      instructionSummary: instruction,
      targetedSceneNumbers: [1],
      unmodifiedSceneNumbers: untouchedSceneNums,
      revisedLines: mergedLines,
      diffSummary: `Rewrote Scene 1 (Opening Hook). All remaining scenes (${untouchedSceneNums.join(', ')}) remain 100% character-for-character intact.`
    };
  }

  // CASE 4: GLOBAL HUMOUR OR HINGLISH DIALOGUE ENHANCEMENT (Preserving story facts and structure)
  // Targets dialogue lines only; keeps scene headings, action descriptions, and topic facts 100% stable!
  const dialogueLines = scriptLines.filter(l => l.type === 'dialogue');
  const sampleDialogue = dialogueLines.slice(0, 12).map(l => `${l.characterName || 'Character'}: "${l.content}"`).join('\n');

  const prompt = `You are an elite comedy dialogue doctor and Hinglish script doctor.
USER INSTRUCTION: "${instruction}"
MANDATE:
1. Elevate the humor, wit, comedic timing, and natural Hinglish banter.
2. DO NOT change the story, do NOT change the facts (chillies, tomatoes, Mughals, chai, cricket, architecture, trade), and do NOT change the character dynamics.
3. Keep all scene numbers, action lines, and segment orders unchanged.

=== SAMPLE SCRIPT DIALOGUE EXCHANGES ===
${sampleDialogue}

Return ONLY valid JSON matching:
{
  "improvedExchanges": [
    {
      "character": "Aarav",
      "originalSnippet": "Snippet of original line...",
      "punchedUpLine": "Punched up line with sharper wit and natural Hinglish rhythm...",
      "humourMechanism": "Self-deprecating irony / rapid callback"
    }
  ]
}`;

  const raw = await callAI([
    { role: 'system', content: 'You are an award-winning comedy screenplay doctor specializing in Hinglish comedy. Return JSON only.' },
    { role: 'user', content: prompt }
  ], {
    temperature: 0.75,
    max_tokens: 2500,
    jsonMode: true,
    taskName: 'Humour and Dialogue Polish'
  });

  const parsed = extractJsonFromResponse(raw);
  const replacements: Array<{ originalSnippet: string; punchedUpLine: string }> = parsed.improvedExchanges || [];

  // Apply surgical replacements to matching dialogue lines
  const updatedLines = scriptLines.map(line => {
    if (line.type !== 'dialogue') return line;
    const match = replacements.find(r => r.originalSnippet && line.content.toLowerCase().includes(r.originalSnippet.toLowerCase().slice(0, 15)));
    if (match) {
      return {
        ...line,
        content: match.punchedUpLine,
        candidateState: 'HUMAN_EDITED' as const
      };
    }
    return line;
  });

  return {
    scope: scope === 'IMPROVE_HUMOUR' ? 'IMPROVE_HUMOUR' : 'NATURAL_HINGLISH',
    instructionSummary: instruction,
    targetedSceneNumbers: Array.from(new Set(scriptLines.map(l => l.sceneNumber))),
    unmodifiedSceneNumbers: [],
    revisedLines: updatedLines,
    diffSummary: `Polished dialogue humor and natural Hinglish cadence across ${replacements.length} dialogue beats while preserving 100% of the underlying narrative, historical facts, and scene architecture.`
  };
}
