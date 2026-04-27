import { registerAs } from '@nestjs/config';

export default registerAs('bookkeeper', () => ({
  enabled: process.env.BOOKKEEPER_ENABLED !== 'false',
  autoMode: process.env.BOOKKEEPER_AUTO_MODE === 'true',
  classifyAllTransactions:
    process.env.BOOKKEEPER_CLASSIFY_ALL_TRANSACTIONS !== 'false',
  interviewEnabled: process.env.BOOKKEEPER_INTERVIEW_ENABLED !== 'false',
  chatEnabled: process.env.BOOKKEEPER_CHAT_ENABLED !== 'false',
  bulkClassificationEnabled:
    process.env.BOOKKEEPER_BULK_CLASSIFICATION_ENABLED !== 'false',
  amazonParserEnabled: process.env.BOOKKEEPER_AMAZON_PARSER_ENABLED === 'true',
  taxToolsEnabled: process.env.BOOKKEEPER_TAX_TOOLS_ENABLED === 'true',
  autoApplyThreshold: Number(
    process.env.BOOKKEEPER_AUTO_APPLY_THRESHOLD || '0.86',
  ),
  autoPostThreshold: Number(
    process.env.BOOKKEEPER_AUTO_POST_THRESHOLD || '0.92',
  ),
  reviewThreshold: Number(process.env.BOOKKEEPER_REVIEW_THRESHOLD || '0.8'),
  requireReviewAmount: Number(
    process.env.BOOKKEEPER_REQUIRE_REVIEW_AMOUNT || '500',
  ),
}));
