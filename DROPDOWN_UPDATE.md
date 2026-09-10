# CREAIONX Property — Raw Form Dropdown Update

This update replaces every native select/dropdown in the current product with a reusable custom `BrutalistSelect` component.

Updated areas:
- Property requirement wizard: city, area/society, property type, timeframe, payment, bedrooms, investment goal.
- Realtor onboarding: city selector.
- Realtor marketplace: lead type, intent and sorting filters.
- Realtor CRM: pipeline-stage selector.

Visual behavior:
- Raw Form square geometry and high-contrast palette.
- Red accent rule and selected option state.
- Orange hover state.
- Hard black offset shadow.
- Numbered option rows.
- Custom chevron/open state.
- Responsive mobile menus.
- Click-outside and Escape close behavior.
- Keyboard trigger handling and ARIA listbox semantics.

Apply from the repository root:

```bash
unzip -o creaionx-property-dropdown-design.zip
rm creaionx-property-dropdown-design.zip
rm -rf .next
npm run build
npm run dev
```
