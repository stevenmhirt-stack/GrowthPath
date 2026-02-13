import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface AIAssistRequest {
  context: string;
  fieldName: string;
  currentValue?: string;
  formType: "goals" | "levers" | "routines" | "assessment";
}

const SYSTEM_PROMPTS: Record<string, string> = {
  goals: `You are a professional development coach helping users articulate their goals. 
Keep responses concise (2-3 sentences max). Be encouraging but practical.
Focus on clarity, specificity, and actionability.`,
  
  levers: `You are a life coach helping users identify actions to improve key life areas.
Keep responses concise (2-3 sentences max). 
Suggest practical, specific actions they can take.`,
  
  routines: `You are a productivity coach helping users create effective daily routines.
Keep responses concise (2-3 sentences max).
Focus on habit formation and sustainable practices.`,
  
  assessment: `You are a self-reflection guide helping users assess their personal values.
Keep responses concise (2-3 sentences max).
Help them think deeper about what matters to them.`,
};

export async function getAISuggestion(request: AIAssistRequest): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[request.formType] || SYSTEM_PROMPTS.goals;
  
  let userPrompt = `Help me fill out the "${request.fieldName}" field.`;
  
  if (request.context) {
    userPrompt += `\n\nContext about what I'm working on: ${request.context}`;
  }
  
  if (request.currentValue) {
    userPrompt += `\n\nWhat I've written so far: ${request.currentValue}\n\nCan you help me improve or expand on this?`;
  } else {
    userPrompt += `\n\nGive me a suggestion for what to write here.`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "I couldn't generate a suggestion. Please try again.";
}
