# BLUEPRINT BUDDIES — Brand Update

This update changes the product-facing brand from CREAIONX PROPERTY to BLUEPRINT BUDDIES across:

- navigation and mobile menu
- footer
- realtor and admin portals
- loading state
- homepage copy
- city pages
- About, Privacy, Terms, and Lead Policy
- metadata / Open Graph titles
- app/environment example name
- package and devcontainer labels
- project documentation

## Apply in Codespaces

Upload `blueprint-buddies-brand-update.zip` to the repository root and run:

```bash
unzip -o blueprint-buddies-brand-update.zip
rm blueprint-buddies-brand-update.zip
rm -rf .next
npm run build
npm run dev
```

If `.env.local` still contains the old app name, change only this line manually:

```env
NEXT_PUBLIC_APP_NAME=BLUEPRINT BUDDIES
```

Do not replace or commit any Firebase/Admin secrets in `.env.local`.
