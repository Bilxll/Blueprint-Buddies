# BLUEPRINT BUDDIES — Bulk Lead Import

## Added

- Admin route: `/admin/import`
- CSV, XLSX and XLS upload support
- Maximum 8 MB / 2,000 rows per batch
- Downloadable CSV template
- Preview and validation before import
- Pakistan / USA / UK default market selection
- Flexible header aliases (for example `mobile`, `whatsapp`, `lead type`, `property type`)
- Flexible type/country/timeframe normalization
- Money parsing for values such as `2 crore`, `50 lakh`, `500k`, and `1.2m`
- Duplicate detection against recent Firestore leads and within the uploaded batch
- Imported leads always enter as `unverified` / `new`
- Admin contact-sharing confirmation required before import
- Firestore `bulkImports` audit records
- Google Sheets `BulkImports` operational log
- Batched Google Sheets lead mirroring
- Downloadable validation-error CSV

## Required command after applying

```bash
npm install
npm run sheets:init
rm -rf .next
npm run typecheck
npm run build
npm run dev
```

The new Excel parser dependency is `xlsx`.

## Recommended columns

`country,type,city,area,propertyType,budgetMin,budgetMax,size,bedrooms,paymentMode,purpose,timeframe,ownerConfirmed,expectedPrice,investmentGoal,name,phone,email,source,campaign`

Use the template button on `/admin/import` for a ready-to-fill CSV.
