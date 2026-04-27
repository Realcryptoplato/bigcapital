import { Inject, Injectable } from '@nestjs/common';
import { castArray, first, uniq } from 'lodash';
import { GetAutofillCategorizeTransctionTransformer } from './GetAutofillCategorizeTransactionTransformer';
import { BookkeeperSuggestionService } from './BookkeeperSuggestion.service';
import { UncategorizedBankTransaction } from '@/modules/BankingTransactions/models/UncategorizedBankTransaction';
import { TransformerInjectable } from '@/modules/Transformer/TransformerInjectable.service';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';

@Injectable()
export class GetAutofillCategorizeTransactionService {
  constructor(
    private readonly transformer: TransformerInjectable,
    private readonly bookkeeperSuggestionService: BookkeeperSuggestionService,

    @Inject(UncategorizedBankTransaction.name)
    private readonly uncategorizedBankTransactionModel: TenantModelProxy<
      typeof UncategorizedBankTransaction
    >,
  ) {}

  /**
   * Retrieves the autofill values of categorize transactions form.
   * @param {Array<number> | number} uncategorizeTransactionsId - Uncategorized transactions ids.
   */
  public async getAutofillCategorizeTransaction(
    uncategorizeTransactionsId: Array<number> | number,
  ) {
    const uncategorizeTransactionsIds = uniq(
      castArray(uncategorizeTransactionsId),
    );
    const uncategorizedTransactions =
      await this.uncategorizedBankTransactionModel()
        .query()
        .whereIn('id', uncategorizeTransactionsIds)
        .withGraphFetched('recognizedTransaction.assignAccount')
        .withGraphFetched('recognizedTransaction.bankRule')
        .throwIfNotFound();
    const bookkeeperSuggestion =
      await this.bookkeeperSuggestionService.suggest(
        uncategorizedTransactions,
      );

    return this.transformer.transform(
      {},
      new GetAutofillCategorizeTransctionTransformer(),
      {
        uncategorizedTransactions,
        firstUncategorizedTransaction: first(uncategorizedTransactions),
        bookkeeperSuggestion,
      },
    );
  }
}
