# BLUEPRINT BUDDIES — Navbar Layout Fix

This patch fixes the crowded multicountry floating navigation.

Changes:
- balances brand, navigation, and action zones
- moves TRACK into the main nav group
- replaces unreliable flag emoji rendering with compact country-code badges
- adds responsive desktop compression before the mobile breakpoint
- shortens REALTOR PORTAL to PORTAL on smaller desktop widths
- reduces country switcher width on laptops
- adds a functional PK / US / UK market switcher inside the mobile menu
- preserves the floating rounded glass navigation style

Apply at repo root, clear `.next`, and restart Next.js.
