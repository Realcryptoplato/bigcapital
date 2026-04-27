import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sumBy } from 'lodash';
import { ClsService } from 'nestjs-cls';
import { Account } from '@/modules/Accounts/models/Account.model';
import { UncategorizedBankTransaction } from '@/modules/BankingTransactions/models/UncategorizedBankTransaction';
import { TenantModel } from '@/modules/System/models/TenantModel';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

type SuggestedTransactionType =
  | 'other_expense'
  | 'other_income'
  | 'transfer_to_account'
  | 'transfer_from_account';

export interface BookkeeperSuggestion {
  source: 'bookkeeper';
  confidence: number;
  shouldAutoApply: boolean;
  reason: string;
  transactionType: SuggestedTransactionType;
  creditAccountId: number | null;
  suggestedAccountName: string | null;
  description: string | null;
}

interface BookkeeperCategory {
  key: string;
  accountLabels: string[];
  narrative: string;
  keywords: string[];
}

const BOOKKEEPER_CATEGORIES: BookkeeperCategory[] = [
  {
    key: 'meals',
    narrative: 'Meals and entertainment spending',
    accountLabels: [
      'Meals & Entertainment',
      'Meals and Entertainment',
      'Meals',
      'Team Meals',
      'Travel Meals',
    ],
    keywords: [
      'restaurant',
      'cafe',
      'coffee',
      'espresso',
      'pizza',
      'burger',
      'taco',
      'bistro',
      'grill',
      'bar',
      'deli',
      'bakery',
      'doordash',
      'ubereats',
      'uber eats',
      'grubhub',
      'postmates',
      'starbucks',
      'chipotle',
      'mcdonald',
      'wendys',
      'subway',
      'panera',
      'sweetgreen',
      'shake shack',
      'chick fil a',
      'chickfila',
      'cava',
    ],
  },
  {
    key: 'software',
    narrative: 'Software and SaaS subscriptions',
    accountLabels: [
      'Software',
      'Software Subscriptions',
      'Subscriptions',
      'SaaS',
      'Apps and Software',
    ],
    keywords: [
      'github',
      'openai',
      'anthropic',
      'slack',
      'figma',
      'notion',
      'linear',
      'jira',
      'atlassian',
      'google workspace',
      'g suite',
      'dropbox',
      'zoom',
      'canva',
      'adobe',
      'vercel',
      'netlify',
      'digitalocean',
      'aws',
      'amazon web services',
      'namecheap',
      'cloudflare',
    ],
  },
  {
    key: 'travel',
    narrative: 'Travel, rideshare, lodging, or flights',
    accountLabels: ['Travel', 'Travel Expense', 'Lodging', 'Airfare'],
    keywords: [
      'airbnb',
      'hotel',
      'marriott',
      'hilton',
      'hyatt',
      'delta',
      'united',
      'southwest',
      'american airlines',
      'lyft',
      'uber',
      'hertz',
      'avis',
      'enterprise',
      'expedia',
      'booking',
      'airfare',
    ],
  },
  {
    key: 'fuel',
    narrative: 'Fuel, parking, or vehicle travel costs',
    accountLabels: ['Auto Expense', 'Fuel', 'Gas', 'Vehicle Expense'],
    keywords: [
      'shell',
      'chevron',
      'exxon',
      'mobil',
      'texaco',
      'fuel',
      'parking',
      'toll',
      'garage',
    ],
  },
  {
    key: 'advertising',
    narrative: 'Advertising and paid acquisition spend',
    accountLabels: [
      'Advertising',
      'Advertising Expense',
      'Marketing',
      'Marketing Expense',
    ],
    keywords: [
      'google ads',
      'meta ads',
      'facebook ads',
      'instagram ads',
      'linkedin ads',
      'tiktok ads',
      'adwords',
    ],
  },
  {
    key: 'bank_fees',
    narrative: 'Bank, payment processor, or wire fees',
    accountLabels: ['Bank Fees', 'Merchant Fees', 'Processing Fees'],
    keywords: [
      'service fee',
      'monthly fee',
      'wire fee',
      'overdraft',
      'atm fee',
      'processing fee',
      'merchant fee',
    ],
  },
];

@Injectable()
export class BookkeeperSuggestionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cls: ClsService,

    @Inject(Account.name)
    private readonly accountModel: TenantModelProxy<typeof Account>,

    @Inject(TenantModel.name)
    private readonly tenantModel: typeof TenantModel,
  ) {}

  public async suggest(
    uncategorizedTransactions: UncategorizedBankTransaction[],
  ): Promise<BookkeeperSuggestion | null> {
    if (!this.configService.get<boolean>('bookkeeper.enabled')) {
      return null;
    }
    if (!uncategorizedTransactions?.length) {
      return null;
    }

    const firstTransaction = uncategorizedTransactions[0];
    const normalizedNarratives = uncategorizedTransactions
      .map((transaction) => this.normalizeNarrative(transaction))
      .filter(Boolean);

    if (!normalizedNarratives.length) {
      return null;
    }

    if (new Set(normalizedNarratives).size > 1) {
      return null;
    }

    const organizationId = this.cls.get('organizationId');
    const tenant = organizationId ?
      await this.tenantModel
        .query()
        .findOne({ organizationId })
        .withGraphFetched('metadata') :
      null;
    const activeAccounts = await this.accountModel()
      .query()
      .where('active', true)
      .orderBy('createdAt', 'asc');
    const totalAmount = sumBy(uncategorizedTransactions, 'amount');

    if (totalAmount >= 0) {
      return null;
    }

    const transactionType = 'other_expense';

    const rankedCategories = BOOKKEEPER_CATEGORIES.map((category) => {
      const score = this.scoreCategoryMatch(category, normalizedNarratives[0]);

      return { category, score };
    }).sort((left, right) => right.score - left.score);
    const bestMatch = rankedCategories[0];

    if (!bestMatch || bestMatch.score < 0.58) {
      return null;
    }

    const account = this.findMatchingAccount(
      activeAccounts,
      bestMatch.category.accountLabels,
    );
    const fallbackAccount = this.findMatchingAccount(activeAccounts, [
      'Other Expenses',
      'Other Expense',
    ]);
    const resolvedAccount = account || fallbackAccount || null;
    const matchedKeywords = this.getMatchedKeywords(
      bestMatch.category,
      normalizedNarratives[0],
    );
    const confidence = Number(
      Math.min(
        0.98,
        bestMatch.score +
          (account ? 0.18 : 0) +
          (tenant?.metadata?.industry ? 0.04 : 0),
      ).toFixed(2),
    );
    const autoApplyThreshold = this.configService.get<number>(
      'bookkeeper.autoApplyThreshold',
    );
    const accountHint = account ?
      ` and reused the ${account.name} account` :
      ` and suggests creating or mapping ${bestMatch.category.accountLabels[0]}`;

    return {
      source: 'bookkeeper',
      confidence,
      shouldAutoApply: confidence >= autoApplyThreshold && !!account,
      reason:
        `Matched ${matchedKeywords.join(', ')} against ${bestMatch.category.narrative.toLowerCase()}` +
        accountHint,
      transactionType,
      creditAccountId: resolvedAccount?.id || null,
      suggestedAccountName: account?.name || bestMatch.category.accountLabels[0],
      description:
        firstTransaction.payee ||
        firstTransaction.description ||
        tenant?.metadata?.name ||
        null,
    };
  }

  private normalizeNarrative(
    transaction: UncategorizedBankTransaction,
  ): string {
    const rawNarrative = [transaction.payee, transaction.description]
      .filter(Boolean)
      .join(' ');

    return rawNarrative
      .toLowerCase()
      .replace(/\d{4,}/g, ' ')
      .replace(/[^a-z\s&]/g, ' ')
      .replace(/\bpos\b|\bdebit\b|\bcard\b|\bpurchase\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private scoreCategoryMatch(
    category: BookkeeperCategory,
    normalizedNarrative: string,
  ): number {
    const keywordHits = category.keywords.filter((keyword) =>
      normalizedNarrative.includes(keyword),
    );

    if (!keywordHits.length) {
      return 0;
    }
    const longestKeywordLength = Math.max(
      ...keywordHits.map((keyword) => keyword.length),
    );

    return Math.min(
      0.8,
      0.45 + keywordHits.length * 0.12 + longestKeywordLength / 100,
    );
  }

  private getMatchedKeywords(
    category: BookkeeperCategory,
    normalizedNarrative: string,
  ): string[] {
    return category.keywords
      .filter((keyword) => normalizedNarrative.includes(keyword))
      .slice(0, 3)
      .map((keyword) => `"${keyword}"`);
  }

  private findMatchingAccount(
    accounts: Account[],
    accountLabels: string[],
  ): Account | null {
    const normalizedLabels = accountLabels.map((label) =>
      this.normalizeAccountName(label),
    );

    return (
      accounts.find((account) => {
        if (account.accountRootType !== 'expense') {
          return false;
        }
        const normalizedAccountName = this.normalizeAccountName(account.name);

        return normalizedLabels.some(
          (label) =>
            normalizedAccountName.includes(label) ||
            label.includes(normalizedAccountName),
        );
      }) || null
    );
  }

  private normalizeAccountName(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z\s&]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
