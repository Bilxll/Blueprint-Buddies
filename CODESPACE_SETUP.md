# GitHub Codespaces Setup

If this project is already extracted in the repository root:

```bash
npm install
cp .env.example .env.local
npm run dev
```

If `creaionx-property-leads-mvp.zip` was uploaded to the repository root instead:

```bash
unzip creaionx-property-leads-mvp.zip
shopt -s dotglob
cp -R creaionx-property-leads/* .
rm -rf creaionx-property-leads creaionx-property-leads-mvp.zip
npm install
cp .env.example .env.local
npm run dev
```

Then configure `.env.local` with Firebase, Google Sheets, and Google Drive credentials. Never commit `.env.local`.
