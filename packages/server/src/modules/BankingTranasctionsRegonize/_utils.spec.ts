import { bankRulesMatchTransaction } from './_utils';
import {
  BankRuleApplyIfTransactionType,
  BankRuleConditionComparator,
  BankRuleConditionType,
} from '../BankRules/types';

describe('bankRulesMatchTransaction', () => {
  const transaction = {
    description: 'Payment to ACME SERVICES',
    payee: 'ACME SERVICES',
    amount: -125.5,
    isDepositTransaction: false,
    isWithdrawalTransaction: true,
  } as any;

  const buildRule = (comparator: string) =>
    ({
      applyIfTransactionType: BankRuleApplyIfTransactionType.Withdrawal,
      conditionsType: BankRuleConditionType.And,
      conditions: [
        {
          field: 'description',
          comparator,
          value: 'Payroll',
        },
      ],
    }) as any;

  it('matches the current not_contains comparator', () => {
    const matched = bankRulesMatchTransaction(transaction, [
      buildRule(BankRuleConditionComparator.NotContain),
    ]);

    expect(matched).toBeDefined();
  });

  it('matches the legacy not_contain comparator', () => {
    const matched = bankRulesMatchTransaction(transaction, [
      buildRule('not_contain'),
    ]);

    expect(matched).toBeDefined();
  });
});
