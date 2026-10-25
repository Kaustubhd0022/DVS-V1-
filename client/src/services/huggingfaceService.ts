/**
 * Huggingface Integration Service
 * Direct API calls to Huggingface for inference
 * Uses same models as backend for consistency
 */

const HF_API_TOKEN = import.meta.env.VITE_HUGGINGFACE_API_TOKEN || '';
const HF_MODEL = import.meta.env.VITE_HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.1';
const HF_API_ENDPOINT = 'https://api-inference.huggingface.co/models';

export interface HuggingfaceResponse {
  generated_text?: string;
  error?: string;
  estimated_time?: number;
}

class HuggingfaceService {
  private apiToken: string;
  private model: string;

  constructor(
    token: string = HF_API_TOKEN,
    model: string = HF_MODEL
  ) {
    this.apiToken = token;
    this.model = model;

    if (!this.apiToken) {
      console.warn('⚠️ VITE_HUGGINGFACE_API_TOKEN not set. Huggingface calls will fail.');
    }
  }

  async generateText(prompt: string, maxTokens: number = 1024): Promise<string> {
    if (!this.apiToken) {
      throw new Error('Huggingface API token not configured. Set VITE_HUGGINGFACE_API_TOKEN in .env.local');
    }

    try {
      const response = await fetch(
        `${HF_API_ENDPOINT}/${this.model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: maxTokens,
              temperature: 0.7,
              top_p: 0.95,
              repetition_penalty: 1.2,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Huggingface API error: ${response.status}`
        );
      }

      const data: HuggingfaceResponse[] = await response.json();

      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
      }

      throw new Error('Unexpected response format from Huggingface');
    } catch (error) {
      console.error('Huggingface API error:', error);
      throw error;
    }
  }

  async generateStory(
    premise: string,
    tone: string,
    length: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<string> {
    const maxTokens = {
      short: 256,
      medium: 512,
      long: 1024,
    }[length];

    const prompt = `Write a ${length} story with the following:
Premise: ${premise}
Tone: ${tone}

Story:`;

    return this.generateText(prompt, maxTokens);
  }

  async generateCharacter(
    name: string,
    role: string,
    context: string
  ): Promise<string> {
    const prompt = `Create a detailed character profile for:
Name: ${name}
Role: ${role}
Context: ${context}

Character Profile:
- Background:
- Motivation:
- Voice/Style:
- Key Traits:
- Relationships:`;

    return this.generateText(prompt, 512);
  }

  async generateDialogue(
    character1: string,
    character2: string,
    scenario: string,
    tone: string = 'natural'
  ): Promise<string> {
    const prompt = `Write a ${tone} dialogue between two characters:
Character 1: ${character1}
Character 2: ${character2}
Scenario: ${scenario}

Dialogue:`;

    return this.generateText(prompt, 512);
  }

  async generateScreenplay(
    sceneDescription: string,
    tone: string = 'cinematic'
  ): Promise<string> {
    const prompt = `Write a ${tone} screenplay scene:
${sceneDescription}

SCENE:`;

    return this.generateText(prompt, 512);
  }

  async analyzeText(
    text: string,
    analysisType: 'theme' | 'tone' | 'structure' | 'pacing' = 'theme'
  ): Promise<string> {
    const prompts = {
      theme: `Analyze the themes in this text:\n\n${text}\n\nThemes and Analysis:`,
      tone: `Analyze the tone and mood in this text:\n\n${text}\n\nTone Analysis:`,
      structure: `Analyze the narrative structure in this text:\n\n${text}\n\nStructural Analysis:`,
      pacing: `Analyze the pacing in this text:\n\n${text}\n\nPacing Analysis:`,
    };

    return this.generateText(prompts[analysisType], 512);
  }

  async brainstorm(
    topic: string,
    numIdeas: number = 5
  ): Promise<string[]> {
    const prompt = `Brainstorm ${numIdeas} creative ideas for:\n${topic}\n\nIdeas:`;

    try {
      const response = await this.generateText(prompt, 256);
      return response
        .split('\n')
        .filter(line => line.trim())
        .slice(0, numIdeas);
    } catch (error) {
      console.error('Brainstorming failed:', error);
      return [];
    }
  }

  async continuityCheck(
    context: string,
    newContent: string
  ): Promise<{ issues: string[]; confidence: string }> {
    const prompt = `Given this context:
${context}

Check if this new content has continuity issues:
${newContent}

List any continuity issues found:`;

    try {
      const response = await this.generateText(prompt, 256);
      const issues = response
        .split('\n')
        .filter(line => line.trim() && !line.includes('Issues'))
        .slice(0, 5);

      return {
        issues,
        confidence: issues.length > 0 ? 'medium' : 'high',
      };
    } catch (error) {
      console.error('Continuity check failed:', error);
      return { issues: [], confidence: 'low' };
    }
  }

  setModel(model: string): void {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }

  isConfigured(): boolean {
    return !!this.apiToken;
  }
}

export const huggingfaceService = new HuggingfaceService();
