import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetAutofillCategorizeTransactionResponseDto {
  @ApiPropertyOptional({
    description: 'Assigned credit/debit account ID from recognition',
    example: 10,
  })
  creditAccountId?: number | null;

  @ApiPropertyOptional({
    description: 'Bank account ID (debit)',
    example: 5,
  })
  debitAccountId?: number | null;

  @ApiProperty({ description: 'Total amount of uncategorized transactions', example: -150.5 })
  amount: number;

  @ApiProperty({ description: 'Formatted amount', example: '$150.50' })
  formattedAmount: string;

  @ApiProperty({ description: 'Transaction date', example: '2024-01-15' })
  date: string;

  @ApiProperty({ description: 'Formatted date', example: 'Jan 15, 2024' })
  formattedDate: string;

  @ApiProperty({ description: 'Whether the transaction is recognized by a rule', example: true })
  isRecognized: boolean;

  @ApiPropertyOptional({ description: 'Bank rule ID that recognized the transaction', example: 1 })
  recognizedByRuleId?: number | null;

  @ApiPropertyOptional({ description: 'Bank rule name that recognized the transaction', example: 'Salary Rule' })
  recognizedByRuleName?: string | null;

  @ApiPropertyOptional({ description: 'Reference number', example: 'REF-001' })
  referenceNo?: string | null;

  @ApiProperty({ description: 'Transaction type (category)', example: 'other_expense' })
  transactionType: string;

  @ApiProperty({ description: 'Whether this is a deposit transaction', example: false })
  isDepositTransaction: boolean;

  @ApiProperty({ description: 'Whether this is a withdrawal transaction', example: true })
  isWithdrawalTransaction: boolean;

  @ApiPropertyOptional({ description: 'Assigned payee from recognition' })
  payee?: string | null;

  @ApiPropertyOptional({ description: 'Assigned memo from recognition' })
  memo?: string | null;

  @ApiPropertyOptional({
    description: 'Suggested description for the categorized transaction',
    example: 'Starbucks',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Suggestion source when no explicit rule matched',
    example: 'bookkeeper',
  })
  suggestionSource?: string | null;

  @ApiPropertyOptional({
    description: 'Narrative explanation for the suggestion',
    example:
      'Matched "starbucks" against meals and entertainment spending and reused the Meals & Entertainment account',
  })
  suggestionReason?: string | null;

  @ApiPropertyOptional({
    description: 'Confidence score for the suggestion, from 0 to 1',
    example: 0.91,
  })
  suggestionConfidence?: number | null;

  @ApiProperty({
    description: 'Whether the suggestion is strong enough for auto-apply',
    example: true,
  })
  suggestionShouldAutoApply: boolean;

  @ApiPropertyOptional({
    description: 'Best-fit account name for the suggestion',
    example: 'Meals & Entertainment',
  })
  suggestedAccountName?: string | null;
}
