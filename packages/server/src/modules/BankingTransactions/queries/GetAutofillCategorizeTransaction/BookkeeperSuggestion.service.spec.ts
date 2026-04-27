import { BookkeeperSuggestionService } from './BookkeeperSuggestion.service';

describe('BookkeeperSuggestionService', () => {
  const service = new BookkeeperSuggestionService(
    {
      get(key: string) {
        if (key === 'bookkeeper.enabled') return true;
        if (key === 'bookkeeper.autoApplyThreshold') return 0.86;
        return null;
      },
    } as any,
    {
      get() {
        return 'org_123';
      },
    } as any,
    (() => ({
      query() {
        return {
          where() {
            return this;
          },
          orderBy() {
            return Promise.resolve([
              {
                id: 44,
                name: 'Meals & Entertainment',
                accountRootType: 'expense',
              },
              {
                id: 45,
                name: 'Software Subscriptions',
                accountRootType: 'expense',
              },
              {
                id: 46,
                name: 'Other Expenses',
                accountRootType: 'expense',
              },
            ]);
          },
        };
      },
    })) as any,
    {
      query() {
        return {
          findOne() {
            return {
              withGraphFetched() {
                return Promise.resolve({
                  metadata: {
                    industry: 'Consulting',
                    name: '2 Blue Capital',
                  },
                });
              },
            };
          },
        };
      },
    } as any,
  );

  it('suggests meals and entertainment for restaurant merchants', async () => {
    const suggestion = await service.suggest([
      {
        amount: -18.42,
        description: 'STARBUCKS STORE 1234',
        payee: null,
      },
    ] as any);

    expect(suggestion).toMatchObject({
      source: 'bookkeeper',
      transactionType: 'other_expense',
      creditAccountId: 44,
      suggestedAccountName: 'Meals & Entertainment',
    });
    expect(suggestion?.confidence).toBeGreaterThanOrEqual(0.86);
    expect(suggestion?.reason).toContain('starbucks');
  });

  it('stays quiet when selected transactions have different narratives', async () => {
    const suggestion = await service.suggest([
      {
        amount: -12,
        description: 'STARBUCKS STORE 1234',
        payee: null,
      },
      {
        amount: -52,
        description: 'GITHUB SAN FRANCISCO',
        payee: null,
      },
    ] as any);

    expect(suggestion).toBeNull();
  });
});
