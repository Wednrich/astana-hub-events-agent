import { NextResponse } from 'next/server';
import { CITY_LABELS, ALL_CITIES, type HubEventPost } from '@/types';
import events from '@/data/events.json';

// --- Helper function to find hub data from the user's prompt ---
type HubData = {
  city: keyof typeof CITY_LABELS;
  cityLabel: string;
  events: HubEventPost[];
};
function findHubInPrompt(prompt: string): HubData | null {
  const lowerCasePrompt = prompt.toLowerCase().trim();
  const allEvents = events as HubEventPost[];
  const found = ALL_CITIES.find(c =>
    lowerCasePrompt.includes(c.toLowerCase()) ||
    lowerCasePrompt.includes(CITY_LABELS[c].toLowerCase())
  );
  if (!found) return null;
  return {
    city: found,
    cityLabel: CITY_LABELS[found],
    events: allEvents.filter(e => e.city === found),
  };
}

/**
 * Minimal helper to call OpenAI-compatible APIs without the 'openai' library
 */
async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 250,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// --- AI Provider Configuration ---
const providers = [
  {
    name: 'OpenAI',
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
  },
  {
    name: 'Groq',
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
    baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  },
  {
    name: 'OpenRouter',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  },
];

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Find the first available AI provider from your .env.local
    const availableProvider = providers.find(p => p.apiKey);

    let aiResponseText: string;

    if (availableProvider) {
      console.log(`Using AI Provider: ${availableProvider.name}`);
      
      aiResponseText = await callOpenAICompatible(
        availableProvider.baseUrl,
        availableProvider.apiKey!,
        availableProvider.model,
        [
          { role: 'system', content: 'You are a helpful assistant for the Astana Hub ecosystem. You are concise and professional. You answer in the same language as the user query.' },
          { role: 'user', content: message }
        ]
      ) || 'I could not generate a response.';

    } else {
      // 2. Fallback to mock response if no API keys are found
      console.log('No API keys found. Using local fallback response.');
      aiResponseText = `This is a local fallback response because no AI provider API key was found. You asked: "${message}"`;
    }

    // 3. Find hub data based on the original prompt to update the UI
    const hubData = findHubInPrompt(message);

    // 4. Return the response in the format the frontend expects
    return NextResponse.json({
      text: aiResponseText,
      hub: hubData,
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    
    // Provide a more informative error message
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: `Internal Server Error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
