# BLUEPRINT BUDDIES — Google Sign-In Popup Resolver Fix

This patch updates `lib/auth-client.ts` to explicitly use Firebase's `browserPopupRedirectResolver` with `signInWithPopup()`.

## Apply

Upload this ZIP to the root of your Codespace repository, then run:

```bash
unzip -o blueprint-buddies-google-popup-resolver-patch.zip
rm blueprint-buddies-google-popup-resolver-patch.zip
rm -rf .next
npm run dev
```

Then test **Sign in with Google** again.

If Firebase still shows **The requested action is invalid**, the remaining issue is configuration rather than code. Check:

- Firebase Authentication → Google provider is enabled.
- Firebase Authentication → Settings → Authorized domains includes your current `*.app.github.dev` hostname.
- Google Cloud API key restrictions allow both the Codespaces URL and `https://blueprint-buddies.firebaseapp.com/*` during testing.
