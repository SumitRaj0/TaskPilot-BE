import OpenAI from 'openai';

const MODEL = 'gpt-4o-mini';

let openaiClient = null;

const getClient = () => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Add it to server/.env (see .env.example).'
    );
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

const parseJsonResponse = (content) => {
  const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
};

export const breakdownTask = async (input) => {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a productivity assistant. Break down the user goal into clear, actionable subtasks. Return ONLY a JSON array of strings, no markdown. Example: ["Define requirements","Design database schema"]',
      },
      { role: 'user', content: input },
    ],
    temperature: 0.5,
  });

  const content = completion.choices[0]?.message?.content || '[]';
  return parseJsonResponse(content);
};

export const suggestPriority = async (title, description = '') => {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a task prioritization assistant. Based on the task title and description, suggest priority as exactly one of: Low, Medium, High. Return ONLY a JSON object: {"priority":"High"}',
      },
      {
        role: 'user',
        content: `Title: ${title}\nDescription: ${description || 'None'}`,
      },
    ],
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content || '{"priority":"Medium"}';
  const parsed = parseJsonResponse(content);
  return parsed.priority || 'Medium';
};

export const generateTasksFromNL = async (input) => {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a task planning assistant. Convert the user's natural language goal into structured tasks.
Return ONLY a JSON array of objects with keys: title (string), description (string, optional), priority ("Low"|"Medium"|"High"), category (string).
Example: [{"title":"Market Research","description":"Analyze competitors","priority":"High","category":"Marketing"}]`,
      },
      { role: 'user', content: input },
    ],
    temperature: 0.6,
  });

  const content = completion.choices[0]?.message?.content || '[]';
  return parseJsonResponse(content);
};
