import { chain, mapKeys } from 'lodash';

const getTransactionsLockingSettingsSchema = (modules: string[]) => {
  const moduleSchema = {
    active: { type: 'boolean' },
    lock_to_date: { type: 'date' },
    unlock_from_date: { type: 'date' },
    unlock_to_date: { type: 'date' },
    lock_reason: { type: 'string' },
    unlock_reason: { type: 'string' },
  };
  return chain(modules)
    .map((module: string) => {
      return mapKeys(moduleSchema, (value, key: string) => `${module}.${key}`);
    })
    .flattenDeep()
    .reduce((result, value) => {
      return {
        ...result,
        ...value,
      };
    }, {})
    .value();
};

export const SettingsOptions = {
  organization: {
    name: {
      type: 'string',
    },
    base_currency: {
      type: 'string',
    },
    industry: {
      type: 'string',
    },
    location: {
      type: 'string',
    },
    fiscal_year: {
      type: 'string',
    },
    financial_date_start: {
      type: 'string',
    },
    language: {
      type: 'string',
    },
    time_zone: {
      type: 'string',
    },
    date_format: {
      type: 'string',
    },
    accounting_basis: {
      type: 'string',
    },
  },
  manual_journals: {
    next_number: {
      type: 'string',
    },
    number_prefix: {
      type: 'string',
    },
    auto_increment: {
      type: 'boolean',
    },
  },
  bill_payments: {
    withdrawal_account: {
      type: 'number',
    },
  },
  sales_estimates: {
    next_number: {
      type: 'string',
    },
    number_prefix: {
      type: 'string',
    },
    auto_increment: {
      type: 'boolean',
    },
    customer_notes: {
      type: 'string',
    },
    terms_conditions: {
      type: 'string',
    },
  },
  sales_receipts: {
    next_number: {
      type: 'string',
    },
    number_prefix: {
      type: 'string',
    },
    auto_increment: {
      type: 'boolean',
    },
    preferred_deposit_account: {
      type: 'number',
    },
    receipt_message: {
      type: 'string',
    },
    terms_conditions: {
      type: 'string',
    },
  },
  sales_invoices: {
    next_number: {
      type: 'string',
    },
    number_prefix: {
      type: 'string',
    },
    auto_increment: {
      type: 'boolean',
    },
    customer_notes: {
      type: 'string',
    },
    terms_conditions: {
      type: 'string',
    },
  },
  payment_receives: {
    next_number: {
      type: 'string',
    },
    number_prefix: {
      type: 'string',
    },
    auto_increment: {
      type: 'boolean',
    },
    preferred_deposit_account: {
      type: 'number',
    },
    preferred_advance_deposit: {
      type: 'number',
    },
  },
  items: {
    preferred_sell_account: {
      type: 'number',
    },
    preferred_cost_account: {
      type: 'number',
    },
    preferred_inventory_account: {
      type: 'number',
    },
  },
  expenses: {
    preferred_payment_account: {
      type: 'number',
    },
  },
  inventory: {
    cost_compute_running: {
      type: 'boolean',
    },
  },
  accounts: {
    account_code_required: {
      type: 'boolean',
    },
    account_code_unique: {
      type: 'boolean',
    },
  },
  cashflow: {
    next_number: {
      type: 'string',
    },
    number_prefix: {
      type: 'string',
    },
    auto_increment: {
      type: 'boolean',
    },
  },
  bookkeeper: {
    enabled: {
      type: 'boolean',
    },
    auto_mode: {
      type: 'boolean',
    },
    classify_all_transactions: {
      type: 'boolean',
    },
    interview_enabled: {
      type: 'boolean',
    },
    chat_enabled: {
      type: 'boolean',
    },
    bulk_classification_enabled: {
      type: 'boolean',
    },
    classification_mode: {
      type: 'string',
    },
    auto_create_rules: {
      type: 'boolean',
    },
    auto_create_expense_accounts: {
      type: 'boolean',
    },
    amazon_parser_enabled: {
      type: 'boolean',
    },
    tax_tools_enabled: {
      type: 'boolean',
    },
    auto_post_threshold: {
      type: 'number',
    },
    review_threshold: {
      type: 'number',
    },
    require_review_amount: {
      type: 'number',
    },
    deduction_posture: {
      type: 'string',
    },
    grey_area_categories: {
      type: 'string',
    },
    monthly_auto_expense_target: {
      type: 'number',
    },
    annual_auto_expense_target: {
      type: 'number',
    },
    interview_context: {
      type: 'string',
    },
  },
  credit_note: {
    next_number: {
      type: 'string',
    },
    number_prefix: {
      type: 'string',
    },
    auto_increment: {
      type: 'boolean',
    },
    customer_notes: {
      type: 'string',
    },
    terms_conditions: {
      type: 'string',
    },
  },
  vendor_credit: {
    next_number: {
      type: 'string',
    },
    number_prefix: {
      type: 'string',
    },
    auto_increment: {
      type: 'boolean',
    },
  },
  warehouse_transfers: {
    next_number: {
      type: 'string',
    },
    number_prefix: {
      type: 'string',
    },
    auto_increment: {
      type: 'boolean',
    },
  },
  'sms-notification': {
    'sms-notification-enable.sale-invoice-details': {
      type: 'boolean',
    },
    'sms-notification-enable.sale-invoice-reminder': {
      type: 'boolean',
    },
    'sms-notification-enable.sale-estimate-details': {
      type: 'boolean',
    },
    'sms-notification-enable.sale-receipt-details': {
      type: 'boolean',
    },
    'sms-notification-enable.payment-receive-details': {
      type: 'boolean',
    },
    'sms-notification-enable.customer-balance': {
      type: 'boolean',
    },
  },
  'transactions-locking': {
    'locking-type': {
      type: 'string',
    },
    ...getTransactionsLockingSettingsSchema([
      'all',
      'sales',
      'purchases',
      'financial',
    ]),
  },
  features: {
    'multi-warehouses': {
      type: 'boolean',
    },
    'multi-branches': {
      type: 'boolean',
    },
  },
};
