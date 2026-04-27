import { RecognizeTranasctionsService } from './RecognizeTranasctions.service';
import { BankRuleApplyIfTransactionType, BankRuleConditionType } from '@/modules/BankRules/types';

describe('RecognizeTranasctionsService', () => {
  it('applies global rules when no account-specific rule matches', async () => {
    const patch = jest.fn();
    const insert = jest.fn().mockResolvedValue({ id: 91 });

    const uncategorizedTransactions = [
      {
        id: 7,
        accountId: 42,
        description: 'Acme Coffee',
        payee: 'Acme Coffee',
        amount: -14.2,
        isDepositTransaction: false,
        isWithdrawalTransaction: true,
      },
    ];

    const bankRules = [
      {
        id: 11,
        order: 1,
        applyIfAccountId: null,
        applyIfTransactionType: BankRuleApplyIfTransactionType.Withdrawal,
        conditionsType: BankRuleConditionType.And,
        conditions: [
          {
            field: 'description',
            comparator: 'contains',
            value: 'coffee',
          },
        ],
        assignCategory: 'Expense',
        assignAccountId: 2001,
        assignPayee: 'Acme Coffee',
        assignMemo: 'Auto-categorized',
      },
    ];

    const uncategorizedModel = (() => ({
      query: () => ({
        onBuild: () => Promise.resolve(uncategorizedTransactions),
        findById: () => ({
          patch,
        }),
      }),
    })) as any;

    const recognizedModel = (() => ({
      query: () => ({
        insert,
      }),
    })) as any;

    const bankRuleModel = (() => ({
      query: () => ({
        onBuild: () => Promise.resolve(bankRules),
      }),
    })) as any;

    const service = new RecognizeTranasctionsService(
      uncategorizedModel,
      recognizedModel,
      bankRuleModel,
    );

    await service.recognizeTransactions();

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        bankRuleId: 11,
        uncategorizedTransactionId: 7,
        assignedCategory: 'Expense',
        assignedAccountId: 2001,
      }),
    );
    expect(patch).toHaveBeenCalledWith({ recognizedTransactionId: 91 });
  });
});
