# AI Bookkeeper Auto-Mode

## Goal

Bigcapital should operate as an AI-first bookkeeper for an internal operator who manages several client books. The default flow should be hands-off: Plaid imports transactions, the AI classifies them, creates missing expense categories when appropriate, creates durable rules from recurring patterns, and keeps reports ready without line-by-line manual work.

Humans should mainly provide business context, policy preferences, and overrides. Example: "Auto expenses are running high versus last year; be more conservative on grey-area automotive deductions and target about $5k."

## Product Principles

- The AI is the primary classifier. Deterministic rules are still useful, but they should be generated and maintained by the AI from confirmed patterns.
- The AI works from business context, not only merchant strings. It should know the client's industry, operating model, owners, normal vendors, deduction posture, reimbursement policy, vehicles, home office policy, and reporting goals.
- The AI asks questions when context is missing. It should interview the business owner or operator proactively, then store answers as reusable policy.
- Human review is exception-based. High-confidence classifications are posted automatically; low-confidence or policy-sensitive items go into a review inbox.
- Every AI decision needs provenance. The system should store classification, confidence, rationale, source facts, policy references, and whether it created a rule or account.
- Client data must be isolated. No cross-client learning unless explicitly configured through shared templates.

## Operating Loop

1. Plaid sync imports uncategorized transactions.
2. Supplemental parsers enrich transactions where available.
   Examples: Amazon order history for `AMZN MKTP`, receipt parsers, tax workbook parsers.
3. Existing deterministic rules run first.
4. The AI classifier evaluates every remaining transaction against:
   - organization metadata
   - chart of accounts
   - prior confirmed classifications
   - client policy profile
   - Plaid transaction details
   - parser-enriched merchant/order details
   - year-to-date budgets and prior-year comparisons
5. The AI chooses one of four outcomes:
   - Auto-categorize because confidence is high and policy is clear.
   - Auto-create a missing expense account, then categorize.
   - Create or update a deterministic rule for a recurring pattern.
   - Ask a question because the transaction is ambiguous, high-impact, or policy-sensitive.
6. Review outcomes feed back into the client policy profile and future rules.
7. Reports become generated views over a continuously maintained ledger, not a separate cleanup project.

## Client Policy Profile

Each organization needs a persistent "bookkeeper profile" that the AI can update through interview answers and observed confirmations.

Suggested fields:

- Business description: industry, revenue model, products/services, geography, entity type.
- Deduction posture: conservative, standard, aggressive, custom.
- Expense policies: meals, travel, auto, home office, software, contractors, owner draws, reimbursements.
- Known people: owners, employees, contractors, family members, vendors.
- Known accounts: bank accounts, credit cards, loans, payment processors.
- Known recurring vendors: expected category, memo convention, rule pattern.
- Thresholds: auto-post confidence, require-review amount, grey-area categories, budget targets.
- Reporting preferences: cash/accrual assumptions, tax categories, monthly close cadence.
- Integration preferences: Amazon parser, receipt parser, tax-tools parser.
- Open questions: unresolved facts the AI needs before it can safely proceed.

## Narrative Interface

The UI should have a first-class "AI Bookkeeper" area, separate from the current banking rules page.

Core views:

- Chat: user can give policy instructions in plain English.
- Interview: AI asks targeted setup and follow-up questions.
- Review Inbox: only ambiguous or high-impact items that need a human decision.
- Activity Feed: shows what the AI classified, what it auto-posted, and what rules/accounts it created.
- Policy Profile: editable facts and preferences the AI is currently using.
- Close Readiness: shows whether reports are ready, blocked, or waiting on questions.

The chat should not be a generic chatbot. It should be wired to bookkeeping tools: classify transactions, explain reports, update policy, create rules, create accounts, and queue review questions.

## Setup And Interview Flow

The first-run experience should feel like onboarding a bookkeeper, not filling out a long settings page.

Recommended flow:

1. Ask for the business model and tax posture in plain language.
2. Ask about owner spending, reimbursements, vehicles, home office, meals, travel, contractors, and inventory.
3. Connect bank and credit card feeds.
4. Connect optional enrichment sources, starting with Amazon order parsing.
5. Run a first-pass classification in review-only mode.
6. Show the top unresolved questions, grouped by decision impact.
7. Let the user approve a batch and convert confirmed patterns into durable policy.

The AI should ask fewer, better questions. It should avoid asking about every transaction when a higher-level policy answer can resolve a whole class of transactions.

## Classification Policy

Suggested initial thresholds:

- `>= 0.92`: auto-post if category and account already exist and no policy warning is triggered.
- `0.80 - 0.91`: auto-suggest, queue for review unless the same vendor/pattern was previously confirmed.
- `< 0.80`: ask a question or leave unclassified.
- Any amount over a configurable threshold: require review unless a rule has been repeatedly confirmed.
- Grey-area tax categories: use stricter thresholds. Examples: auto, meals, travel, owner expenses, legal, gifts, reimbursements.

Examples:

- `STARBUCKS`, `CHIPOTLE`, `CAVA`, and other restaurants should classify to meals based on merchant type and policy, without one rule per restaurant.
- `CHEVRON` may classify as auto expense for a business with vehicle policy, but should ask or apply stricter handling when the client's auto expense target is close to being exceeded.
- `AMZN MKTP` should often require more context unless receipts, historical pattern, or memo detail make the category clear.

## Bulk Classification

Large imports should default to bulk classification because the classifier needs repeated vendors, period totals, and outliers in the same context.

Batch input should include:

- transaction batch
- account metadata
- chart of accounts
- client policy profile
- similar prior decisions
- parser-enriched details
- target budgets and prior-year comparisons

Batch output should be normalized into individual `bookkeeper_suggestions` rows with the same confidence, rationale, and audit fields used by realtime classification.

Realtime classification remains useful for small manual refreshes, one-off transactions, and chat-driven reclassification.

## Amazon Parser Integration

Amazon data should be treated as enrichment, not as a separate bookkeeping path.

Expected flow:

1. Match `AMZN`, `Amazon Marketplace`, or card statement transactions to imported Amazon orders.
2. Extract item-level descriptions, quantities, tax, shipping, gift cards, refunds, and business/personal ambiguity.
3. Feed enriched order lines into the AI classifier.
4. Split transactions when one Amazon charge contains mixed categories.
5. Ask the user only when item descriptions or purchase context are still ambiguous.

The parser should write normalized enrichment records linked to the uncategorized transaction so the AI decision remains auditable.

## Tax-Tools Integration

Tax prep should be an add-on module after bookkeeping auto-mode is stable.

The tax-tools repo can become:

- annual filing checklist
- source document tracker
- workbook parser
- tax category review workflow
- export package builder for CPA/tax filing

The key integration point is the bookkeeper profile and decision audit trail. Tax prep should consume categorized transactions and unresolved policy questions; it should not duplicate the classifier.

## Rule Creation

Rules should be an output of the AI, not a manual prerequisite.

Auto-create rules when:

- the same merchant/pattern has been confirmed multiple times
- the category is low-risk
- the rule pattern is specific enough to avoid overmatching
- the rule can be explained in natural language

Rules should store:

- who/what created it: user, AI, migration, imported template
- confidence and rationale
- sample transactions used
- last matched transaction date
- false-positive count

## Account Creation

The AI may create missing expense accounts when the chart of accounts lacks a good destination.

Guardrails:

- Prefer existing accounts when semantically close.
- Create accounts only under allowed root types.
- Use a stable account naming taxonomy.
- Do not create many tiny vendor-specific accounts.
- Require approval for new balance sheet accounts, liabilities, equity, payroll, loans, or tax accounts.

For example, it may create `Meals & Entertainment` if the client chart only has `Other Expenses`, but it should not create `Chipotle Expense`.

## Data Model Additions

Suggested tenant tables:

- `bookkeeper_profiles`
  - organization-level policy, posture, and structured facts
- `bookkeeper_messages`
  - chat/interview history with tool calls and extracted facts
- `bookkeeper_questions`
  - open questions, priority, linked transactions, and resolved answer
- `bookkeeper_suggestions`
  - transaction suggestion, confidence, rationale, status, model/provider metadata
- `bookkeeper_decisions`
  - audit log for auto-post, manual approval, override, account creation, and rule creation
- `bank_rule_provenance`
  - AI-created rule source examples, confidence, and drift metrics

The current `recognized_bank_transactions` table can hold the immediate suggestion result, but long-term AI mode needs richer metadata than that table supports.

## Service Architecture

Recommended server modules:

- `BookkeeperProfileModule`
  - profile CRUD, policy extraction, interview state
- `BookkeeperClassifierModule`
  - deterministic taxonomy, retrieval of similar prior decisions, LLM fallback, confidence scoring
- `BookkeeperActionsModule`
  - apply classification, create account, create rule, queue question
- `BookkeeperReviewModule`
  - review inbox and decision capture
- `BookkeeperChatModule`
  - narrative chat interface with tool calls
- `BookkeeperParserModule`
  - Amazon parser, receipt parser, and future enrichment adapters
- `BookkeeperTaxToolsModule`
  - tax prep checklist and workbook parser hooks

Main integration points:

- After Plaid transaction sync, run classification for new uncategorized transactions.
- Before classification, attach parser enrichment when a parser is enabled.
- In the existing autofill endpoint, surface pending AI suggestions and rationales.
- In categorization commands, record whether the decision came from AI, a user, or a rule.
- In bank rule creation, store provenance for AI-generated rules.

## LLM Use

The LLM should be a constrained reasoner, not the system of record.

Input:

- transaction description, payee, amount, date, account type, Plaid category when available
- parser enrichment such as Amazon order lines or receipts
- chart of accounts
- client policy profile
- similar confirmed transactions
- current period totals and prior-year comparisons

Output must be structured JSON:

- transaction type
- account id or proposed account
- confidence
- rationale
- policy references
- whether to auto-post
- whether to ask a question
- proposed question if needed
- proposed reusable rule if pattern is recurring

The application should validate all LLM output against allowed accounts, allowed transaction types, and policy thresholds before mutation.

## Implementation Phases

### Phase 1: Suggestive Bookkeeper

- Use the existing autofill API to return a confidence-scored suggestion.
- Display rationale in the categorize drawer.
- Keep human approval required.
- Add basic taxonomy and tests.

Status: initial version started.

### Phase 2: Background AI Recognition

- Run AI classification after Plaid sync for unmatched transactions.
- Persist suggestions with confidence and rationale.
- Show an AI review inbox.
- Allow batch approve/reject.

### Phase 3: Auto-Post With Guardrails

- Auto-categorize high-confidence, low-risk transactions.
- Require review for high-value, low-confidence, or grey-area categories.
- Store complete audit trail.

### Phase 4: AI-Created Rules And Accounts

- Create expense accounts from stable taxonomy gaps.
- Create bank rules from repeated confirmed patterns.
- Monitor rule drift and false positives.

### Phase 5: Narrative CPA Loop

- Add chat/interview UI.
- Let the AI ask missing-context questions.
- Let the user give policy instructions in natural language.
- Convert answers into structured profile updates and classification policy.

### Phase 6: Amazon And Document Enrichment

- Integrate Amazon parser as a transaction enrichment source.
- Add split suggestions for mixed-order transactions.
- Store parser evidence on each AI decision.

### Phase 7: Close And Reports Agent

- Monthly close checklist.
- Report anomaly detection.
- Prior-year and budget comparisons.
- Explainable P&L, balance sheet, and cash-flow summaries.

### Phase 8: Tax Prep Add-On

- Integrate tax-tools checklist and workbook parser.
- Add tax review states for grey-area classifications.
- Export tax prep packages from classified books and collected documents.

## Immediate Next Build

The next useful build step is Phase 2:

1. Add persistent `bookkeeper_suggestions`.
2. Trigger classifier after Plaid sync for unmatched transactions.
3. Add a review inbox endpoint.
4. Let approvals update both the transaction and the training examples.
5. Keep actual auto-posting disabled until the audit trail and thresholds are in place.
