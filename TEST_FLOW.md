# BLUEPRINT BUDDIES — Manual QA Flow

1. Open `/get-started` logged out. Submit one BUY lead and record the `LEAD_...` reference.
2. Open `/track`; confirm wrong phone fails and the original phone returns only safe requirement/status information.
3. Sign in as admin. Verify the test lead. Confirm rejected/archived items leave the action queue and can be reopened.
4. Create a fresh realtor with email/password. Verify the email. Confirm marketplace stays locked until admin approval.
5. Create another realtor using Google sign-in. Confirm account routing and onboarding work.
6. During realtor onboarding upload JPG/PNG/WebP under 4 MB. Confirm invalid or oversized files fail and valid uploads write to Drive + Uploads sheet.
7. Admin verifies realtor. Confirm starter beta credits are granted once only.
8. Realtor discovery should show only verified leads matching city, area, lead type and property type.
9. Claim a lead. Confirm credit deduction and claim count happen together, duplicate claim fails, and contact details appear only in My Leads.
10. Open WhatsApp/copy phone; move CRM stage; save notes; submit YES then NO feedback and confirm it updates the same Firestore feedback record.
11. Admin suspends the realtor. Confirm discovery, claiming and claimed-contact access are blocked. Reactivate and confirm access returns.
12. Open `/realtor/settings`; update territory/specialties and logo. Confirm matching reflects the new profile.
13. Open `/realtor/billing`. In public beta there must be no self-service real-money checkout and no test-package activation.
14. Check `/faq`, `/contact`, legal pages, sitemap, robots, 404, loading/error states and mobile layout.
15. Run `npm run launch:check:production`, `npm run build`, and remote `npm run test:smoke` against the deployed URL.
