import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  provider: process.env.AI_PROVIDER || 'openai',
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
  baseUrl: process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
  model: process.env.OPENAI_MODEL || process.env.AI_MODEL || 'gpt-4.1',
  batchModel:
    process.env.OPENAI_BATCH_MODEL ||
    process.env.AI_BATCH_MODEL ||
    process.env.OPENAI_MODEL ||
    process.env.AI_MODEL ||
    'gpt-4.1-mini',
  embeddingModel:
    process.env.OPENAI_EMBEDDING_MODEL ||
    process.env.AI_EMBEDDING_MODEL ||
    'text-embedding-3-small',
  requestTimeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS || 60000),
  classificationMode: process.env.AI_CLASSIFICATION_MODE || 'batch',
  batch: {
    enabled: process.env.AI_BATCH_ENABLED !== 'false',
    minTransactions: Number(process.env.AI_BATCH_MIN_TRANSACTIONS || 25),
    maxTransactions: Number(process.env.AI_BATCH_MAX_TRANSACTIONS || 500),
    windowMinutes: Number(process.env.AI_BATCH_WINDOW_MINUTES || 30),
  },
}));
