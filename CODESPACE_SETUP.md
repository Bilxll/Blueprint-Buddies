# GitHub Codespaces Setup

If this project is already extracted in the repository root:

```bash
npm install
cp .env.example .env.local
npm run dev
```

If `blueprint-buddies-mvp.zip` was uploaded to the repository root instead:

```bash
unzip blueprint-buddies-mvp.zip
shopt -s dotglob
cp -R blueprint-buddies/* .
rm -rf blueprint-buddies blueprint-buddies-mvp.zip
npm install
cp .env.example .env.local
npm run dev
```

Then configure `.env.local` with Firebase, Google Sheets, and Google Drive credentials. Never commit `.env.local`.
