import { registerAs } from '@nestjs/config';

export default registerAs('bookkeeper', () => ({
  enabled: process.env.BOOKKEEPER_ENABLED !== 'false',
  autoApplyThreshold: Number(
    process.env.BOOKKEEPER_AUTO_APPLY_THRESHOLD || '0.86',
  ),
}));
