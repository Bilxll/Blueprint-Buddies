# BLUEPRINT BUDDIES — Pakistan Pricing v1

Configured Pakistan realtor pricing:

- Starter — PKR 5,000/month — up to 30 verified leads per billing period.
- Pro — PKR 13,000/month — up to 100 verified leads per billing period.
- Pay As You Go — PKR 1,000 per verified lead.

## Product behavior

- Only verified marketplace claims consume an allowance.
- Subscription allowance is consumed before individually purchased lead balance.
- Legacy beta credits remain a fallback for existing test accounts.
- Monthly allowance fields are stored as `planLeadCap`, `planLeadsUsed`, `planPeriodStart`, and `planPeriodEnd`.
- Individual lead access is stored in `paygLeadBalance`.
- USA and UK pricing remains unavailable until approved pricing is supplied.

## Test the pricing flow without charging money

Set these only in your local/Codespaces `.env.local` while testing:

```env
BILLING_MODE=test_credits
ALLOW_TEST_PURCHASES=true
DEFAULT_BETA_CREDITS=0
```

Then run:

```bash
npm run sheets:init
npm run seed:beta
rm -rf .next
npm run build
npm run dev
```

Open `/pricing?country=PK` and `/realtor/billing`.

In test mode, package activation simulates Starter, Pro, or one Pay-As-You-Go lead. No payment is collected.

For a public site before a payment gateway is connected, use:

```env
ALLOW_TEST_PURCHASES=false
DEFAULT_BETA_CREDITS=0
```

The real prices remain visible, but package activation is not falsely represented as a completed payment.
