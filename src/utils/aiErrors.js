export const mapAiError = (error) => {
  if (error.message?.includes('OPENAI_API_KEY')) {
    return {
      statusCode: 503,
      message: error.message,
    };
  }

  if (
    error.code === 'insufficient_quota' ||
    error.type === 'insufficient_quota' ||
    error.status === 429
  ) {
    return {
      statusCode: 503,
      message:
        'OpenAI quota exceeded. Add your own API key with billing enabled at https://platform.openai.com',
    };
  }

  if (error.status === 401) {
    return {
      statusCode: 503,
      message:
        'Invalid OpenAI API key. Set OPENAI_API_KEY in server/.env (OpenAI keys only, not Gemini).',
    };
  }

  return {
    statusCode: 502,
    message: 'AI service unavailable. Please try again.',
  };
};
