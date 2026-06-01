import OpenAI from 'openai';

const MODEL = 'gpt-4o-mini';
let client;

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error('Add OPENAI_API_KEY to server/.env');
  }
  if (!client) client = new OpenAI({ apiKey: key });
  return client;
}

function parseJson(text) {
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}

async function chat(system, user) {
  const res = await getOpenAI().chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content || '';
}

export async function breakdownTask(input) {
  const text = await chat(
    'Break the goal into subtasks. Reply with JSON only: an array of strings.',
    input
  );
  return parseJson(text || '[]');
}

export async function suggestPriority(title, description = '') {
  const text = await chat(
    'Pick priority: Low, Medium, or High. Reply with JSON only: {"priority":"Medium"}',
    `Title: ${title}\nDescription: ${description || '(none)'}`
  );
  const parsed = parseJson(text || '{"priority":"Medium"}');
  return parsed.priority || 'Medium';
}

export async function generateTasksFromNL(input) {
  const text = await chat(
    `Turn the goal into tasks. JSON array only. Each item: title, description (optional), priority (Low|Medium|High), category.`,
    input
  );
  return parseJson(text || '[]');
}
