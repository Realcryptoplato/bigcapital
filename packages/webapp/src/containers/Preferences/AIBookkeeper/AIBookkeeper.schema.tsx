// @ts-nocheck
import * as Yup from 'yup';

export const AIBookkeeperSchema = Yup.object().shape({
  bookkeeper: Yup.object({
    enabled: Yup.boolean().nullable(),
    autoMode: Yup.boolean().nullable(),
    classifyAllTransactions: Yup.boolean().nullable(),
    interviewEnabled: Yup.boolean().nullable(),
    chatEnabled: Yup.boolean().nullable(),
    bulkClassificationEnabled: Yup.boolean().nullable(),
    classificationMode: Yup.string().oneOf(['batch', 'realtime', 'hybrid']),
    autoCreateRules: Yup.boolean().nullable(),
    autoCreateExpenseAccounts: Yup.boolean().nullable(),
    amazonParserEnabled: Yup.boolean().nullable(),
    taxToolsEnabled: Yup.boolean().nullable(),
    autoPostThreshold: Yup.number().min(0).max(1).nullable(),
    reviewThreshold: Yup.number().min(0).max(1).nullable(),
    requireReviewAmount: Yup.number().min(0).nullable(),
    deductionPosture: Yup.string().oneOf([
      'conservative',
      'standard',
      'aggressive',
      'custom',
    ]),
    greyAreaCategories: Yup.string().nullable(),
    monthlyAutoExpenseTarget: Yup.number().min(0).nullable(),
    annualAutoExpenseTarget: Yup.number().min(0).nullable(),
    interviewContext: Yup.string().nullable(),
  }),
});
