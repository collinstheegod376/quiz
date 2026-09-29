---
version: alpha
name: Quiz
description: |
  Quiz.com's design system embraces a warm, approachable, and playful aesthetic
  centered around lighthearted entertainment and social gaming. The palette is
  dominated by soft, neutral warm tones with selective use of bold brand
  accents, creating a friendly yet professional environment. The visual language
  prioritizes clarity and accessibility through clean typography, generous
  whitespace, and straightforward component hierarchy. Interaction patterns are
  smooth and forgiving, with subtle visual feedback that encourages exploration.
  The overall mood is inviting and casual—designed to lower barriers to
  participation while maintaining enough visual structure to guide users
  confidently through quiz discovery, creation, and gameplay.
source:
  url: "https://quiz.com/entertainment/"
  pagesAnalyzed: 1
  extractedAt: 2026-09-29
  tokensMeasured: true
colors:
  primary: "#EBDAC3"
  canvas: "#FFFDF4"
  on-primary: "#000000"
  ink: "#000000"
  hairline: "#CECCC5"
  accent-1: "#23616A"
  neutral-1: "#E5E3DB"
typography:
  heading:
    fontFamily: Nunito
    fontSize: 20px
    fontWeight: 900
    lineHeight: 1.4
    letterSpacing: 0.6px
  body-xl:
    fontFamily: Nunito
    fontSize: 20px
    fontWeight: 900
    lineHeight: 1.4
    letterSpacing: 0.6px
    textTransform: capitalize
  body-lg:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 900
    lineHeight: 1
    letterSpacing: 0.48px
  body-md:
    fontFamily: Nunito
    fontSize: 14px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0.42px
    textTransform: capitalize
  body-sm:
    fontFamily: Nunito
    fontSize: 12.8px
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: 0.38px
    textTransform: capitalize
  nav:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 800
    lineHeight: 1.36
    letterSpacing: 0.48px
  button-md:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  button-md-strong:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 900
    lineHeight: 1.36
    letterSpacing: 0.48px
  label:
    fontFamily: Nunito
    fontSize: 20px
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: 0.6px
  caption:
    fontFamily: Roboto
    fontSize: 12px
    fontWeight: 800
    lineHeight: 1.33
    letterSpacing: 0.36px
rounded:
  none: 0px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 80px
  xxxl: 96px
borderWidths:
  thin: 4px
shadows:
  sm: "rgba(0, 0, 0, 0.3) 0px -8px 8px 0px inset"
  md: "rgba(0, 0, 0, 0.3) 0px 0px 0px 0px"
  lg: "rgba(0, 0, 0, 0.1) 0px 4px 0px 0px inset"
elevationStrategy: layered-micro
themes:
  derived: dark   # the other theme is the site's measured palette
  light:
    bg: "#FFFDF4"
    surface: "#F7F5ED"
    surfaceRaised: "#EDEBE4"
    text: "#000000"
    textMuted: "#595955"
    border: "#CECCC5"
    accent: "#B9843E"
    accentFg: "#000000"
    focusRing: "#EBDAC3"
    elevation: shadow
  dark:
    bg: "#100F0F"
    surface: "#1E1D1D"
    surfaceRaised: "#2A2929"
    text: "#FEFEFD"
    textMuted: "#A4A3A3"
    border: "#363535"
    accent: "#EBDAC3"
    accentFg: "#000000"
    focusRing: "#EBDAC3"
    elevation: "border+surface"
components:
  button-icon:
    typography: "{typography.button-md}"
    textColor: "{colors.ink}"
    height: 32px
    rounded: "{rounded.full}"
    backgroundColor: "rgb(229, 227, 220)"
  navigation:
    typography: "{typography.button-md}"
    textColor: "{colors.ink}"
  link-sm:
    typography: "{typography.nav}"
    textColor: "{colors.ink}"
    padding: "0px 32px 0px 32px"
states:
  other-focus:
    target: other
    state: focus
    outline: none
  link-focus-visible:
    target: link
    state: focus-visible
    outline: "rgb(255, 255, 255) dotted 2px"
    rounded: 3px
    outlineColor: "rgb(255, 255, 255)"
    outlineWidth: 2px
  input-focus:
    target: input
    state: focus
    outline: none
  other-hover:
    target: other
    state: hover
    borderWidth: 4px
  other-focus-visible:
    target: other
    state: focus-visible
    outline: "transparent solid 2px"
    outlineColor: transparent
    outlineWidth: 2px
  other-active:
    target: other
    state: active
    opacity: 0.8
  other-disabled:
    target: other
    state: disabled
    opacity: 0.25
breakpoints:
  - width: 375
    containerWidth: 351
    gridColumns: 0
    navLinksVisible: 1
    menuToggleVisible: false
    headingPx: 30
    bodyPx: 16
    sectionPaddingX: 0
  - width: 768
    containerWidth: 752
    gridColumns: 0
    navLinksVisible: 2
    menuToggleVisible: false
    headingPx: 20
    bodyPx: 16
    sectionPaddingX: 0
  - width: 1024
    containerWidth: 1008
    gridColumns: 0
    navLinksVisible: 2
    menuToggleVisible: false
    headingPx: 20
    bodyPx: 16
    sectionPaddingX: 0
  - width: 1280
    containerWidth: 1264
    gridColumns: 0
    navLinksVisible: 2
    menuToggleVisible: false
    headingPx: 20
    bodyPx: 16
    sectionPaddingX: 0
  - width: 1440
    containerWidth: 1280
    gridColumns: 0
    navLinksVisible: 2
    menuToggleVisible: false
    headingPx: 20
    bodyPx: 16
    sectionPaddingX: 0
coverage:
  statesFound: 34
  gradientsFound: 0
  rolesUnassigned: 2
  archetypesUnnamed: 0
  archetypesDetected: 0
  responsiveMeasured: true
  stylesheetsBlocked: true
  semanticRampDeclared: false
---

# Design System Inspired by Quiz.com

## 1. Visual Theme & Atmosphere

Quiz.com's design system embraces a warm, approachable, and playful aesthetic centered around lighthearted entertainment and social gaming. The palette is dominated by soft, neutral warm tones with selective use of bold brand accents, creating a friendly yet professional environment. The visual language prioritizes clarity and accessibility through clean typography, generous whitespace, and straightforward component hierarchy. Interaction patterns are smooth and forgiving, with subtle visual feedback that encourages exploration. The overall mood is inviting and casual—designed to lower barriers to participation while maintaining enough visual structure to guide users confidently through quiz discovery, creation, and gameplay.

**Key Characteristics**
- Warm neutral foundation (`{colors.canvas}` — `#FFFDF4`) that feels approachable rather than corporate
- Brand accent (`{colors.primary}` — `#EBDAC3`) deployed strategically for CTAs and active states
- Sharp, geometric component edges (buttons and images render at `{rounded.none}`)
- Pill-shaped input fields (`{rounded.full}`) for soft, modern data entry
- Heavy typographic weight (800–900) applied to headings and labels for emphasis
- Minimal shadow treatment; depth conveyed through color blocking rather than layered elevation
- Generous spacing system supporting mobile-first responsive design

## 2. Color Palette & Roles

### Primary
- **Brand Accent** (`{colors.primary}` — `#EBDAC3`): Warm off-white with golden undertone; deployed on primary CTAs (Sign in button, hero band), active states, and brand highlights throughout

### Neutral Scale
- **Canvas** (`{colors.canvas}` — `#FFFDF4`): Default page background; warm cream offering comfortable contrast for extended reading
- **Ink / On Primary** (`{colors.on-primary}` — `#000000`): Headings and primary text; foreground colour on brand surfaces and interactive elements
- **Hairline** (`{colors.hairline}` — `#CECCC5`): 1px borders and dividers; subtle visual separation without harshness
- **Neutral** (`{colors.neutral-1}` — `#E5E3DB`): Secondary surface colour for category pills, badges, and subtle background regions

### Decorative / Unassigned
- **Accent** (`{colors.accent-1}` — `#23616A`): Deep teal; no measured role in primary interface patterns; reserved for decorative or secondary contexts

## 3. Typography Rules

### Font Family
**Primary: Nunito**
Fallback stack: `Nunito, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Secondary: Roboto**
Fallback stack: `Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---|---|---|---|---|
| Display / Extra Large | Nunito | 30px | 900 | 1.4 | 0.6px | Headings at mobile breakpoint; renders bold and commanding |
| Heading | Nunito | 20px | 900 | 1.4 | 0.6px | Section titles and h2 elements; strong visual hierarchy |
| Label | Nunito | 20px | 800 | 1.4 | 0.6px | Form labels and input adjacent text |
| Body XL | Nunito | 20px | 900 | 1.4 | 0.6px | Capitalized body text; display emphasis |
| Body LG | Nunito | 16px | 900 | 1 | 0.48px | Links and high-emphasis inline text |
| Button MD Strong | Nunito | 16px | 900 | 1.36 | 0.48px | Primary button text; bold interactive affordance |
| Navigation | Nunito | 16px | 800 | 1.36 | 0.48px | Category tabs and nav links |
| Button MD | Nunito | 16px | 400 | 1.5 | 0px | Secondary button text; lighter weight for secondary actions |
| Body MD | Nunito | 14px | 800 | 1 | 0.42px | Capitalized body copy; category counts, badges |
| Body SM | Nunito | 12.8px | 800 | 1.4 | 0.38px | Capitalized small text; supporting labels |
| Caption | Roboto | 12px | 800 | 1.33 | 0.36px | Fine print, figure captions, metadata |

### Principles
- **Nunito dominates** for all primary interface text; heavy weights (800–900) create visual emphasis without requiring size increases
- **Letter-spacing is tight** across the system (0.36–0.6px), lending density and contemporary polish
- **Capitalization** applied selectively to body and label roles, reinforcing hierarchy
- **Contrast through weight** rather than size: a 16px weight-900 link feels as prominent as a 20px lighter-weight heading
- **Roboto reserved** for captions and fine print, offering a subtle typographic texture break

## 4. Component Stylings

### Buttons

**Primary Button (Sign in)**
- Background: `{colors.primary}` (`#EBDAC3`)
- Text color: `{colors.on-primary}` (`#000000`)
- Font: Nunito, 16px, weight 900, line-height 1.36, letter-spacing 0.48px
- Padding: `{spacing.md}` 16px (horizontal and vertical as measured on component)
- Border radius: `{rounded.full}` (9999px — pill-shaped)
- Border: 1px solid `{colors.on-primary}` (`#000000`)
- Box shadow: none
- Hover state: background becomes `{colors.neutral-1}` (`#E5E3DB`), text color `{colors.on-primary}` (`#000000`)
- Focus state: outline none
- Active state: opacity 0.8
- Disabled state: opacity 0.25

**Icon Button**
- Background: `{colors.neutral-1}` (`#E5E3DB`)
- Icon color: `{colors.on-primary}` (`#000000`)
- Width: 32px, Height: 32px
- Padding: 0px
- Font size: 16px
- Border radius: `{rounded.full}` (9999px)
- Border: 0px
- Box shadow: none
- Hover state: opacity 1

### Navigation

**Category Navigation (Tabs)**
- Font: Nunito, 16px, weight 800, line-height 1.36, letter-spacing 0.48px
- Text color: `{colors.on-primary}` (`#000000`)
- Background: transparent
- Padding: `{spacing.md}` 16px (horizontal spacing between tabs)
- Border: 0px
- Border radius: 0px (sharp edges)
- Hover state: underline appears; text remains `{colors.on-primary}`
- Active/underline indicator: `{colors.on-primary}` (`#000000`), 2–4px thickness (as observed on "Entertainment")

**Navigation Container**
- Width: 1440px (full-width max)
- Height: 128px
- Padding: 0px
- Background: transparent
- Border: 0px
- Box shadow: none

### Links

**Text Link (Default)**
- Font: Nunito, 16px, weight 900, line-height 1.36, letter-spacing 0.48px
- Color: `{colors.on-primary}` (`#000000`)
- Background: transparent
- Padding: 0px
- Border: 0px
- Text decoration: none (underline appears on hover)
- Focus-visible state: outline 2px solid `rgb(255, 255, 255)` dotted, border-radius 3px
- Hover state: color remains `{colors.on-primary}`, underline added

**Text Link (Small / Badge)**
- Font: Nunito, 16px, weight 800, line-height 1.36, letter-spacing 0.48px
- Color: `{colors.on-primary}` (`#000000`)
- Background: transparent
- Padding: 0px 32px
- Height: 40px
- Border: 0px
- Border radius: 0px (sharp edges)

### Cards & Containers

**Quiz Card**
- Background: `{colors.canvas}` (`#FFFDF4`)
- Border: 1px solid `{colors.hairline}` (`#CECCC5`)
- Border radius: 0px (sharp corners)
- Padding: `{spacing.md}` 16px
- Box shadow: none
- Hover state: border color changes to `rgb(0, 175, 198)`, background `{colors.neutral-1}` (`#E5E3DB`)

**Hero Band (PIN Entry)**
- Background: `{colors.primary}` (`#EBDAC3`)
- Border radius: 0px or 8px (as observed on the "Join Game? Enter PIN:" container)
- Padding: `{spacing.lg}` 24px
- Text color: `{colors.on-primary}` (`#000000`)
- Font: Nunito, 20px, weight 800, line-height 1.4, letter-spacing 0.6px

**Category Pill / Badge**
- Background: `{colors.neutral-1}` (`#E5E3DB`)
- Text color: `{colors.on-primary}` (`#000000`)
- Font: Nunito, 14px, weight 800, line-height 1, letter-spacing 0.42px, text-transform capitalize
- Padding: `{spacing.xs}` 8px `{spacing.md}` 16px
- Border: 1px solid `{colors.hairline}` (`#CECCC5`)
- Border radius: `{rounded.full}` (9999px — pill-shaped)
- Hover state: background `{colors.neutral-1}`, border remains `{colors.hairline}`

### Inputs & Forms

**Text Input (PIN / Search)**
- Background: `{colors.canvas}` (`#FFFDF4`)
- Border: 4px solid `{colors.on-primary}` (`#000000`) — `{rounded.full}` radius
- Text color: `{colors.on-primary}` (`#000000`)
- Font: Nunito, 20px, weight 800, line-height 1.4, letter-spacing 0.6px (label size applied to input)
- Padding: `{spacing.md}` 16px `{spacing.lg}` 24px
- Border radius: `{rounded.full}` (9999px — pill-shaped)
- Placeholder color: `rgb(179, 179, 179)` (light gray)
- Focus state: background changes to `rgb(76, 164, 113)` or `rgb(255, 148, 171)` or `rgb(0, 0, 0)` (variant-dependent), outline none
- Hover state: border width increases to 4px

## 5. Layout Principles

### Spacing System

**Base unit: 4px** — all spacing derives from this atomic unit, enabling flexible, proportional layouts.

**Scale:**
- `{spacing.xxs}` = 4px — micro spacing between tightly grouped elements
- `{spacing.xs}` = 8px — small spacing within components (button internal padding, list gaps)
- `{spacing.sm}` = 12px — minor section spacing
- `{spacing.md}` = 16px — default component padding and standard gutters
- `{spacing.lg}` = 24px — section separations, major content blocks
- `{spacing.xl}` = 32px — large content region separation
- `{spacing.xxl}` = 80px — hero / banner spacing
- `{spacing.xxxl}` = 96px — full-page section breaks

**Usage contexts:**
- Button padding: `{spacing.md}` 16px horizontal, 8–12px vertical
- Card padding: `{spacing.md}` 16px
- Hero band padding: `{spacing.lg}` 24px
- Section top/bottom: `{spacing.lg}` to `{spacing.xl}`

### Grid & Container

**Max width: 1440px** — measured on large viewports (1440px and above); content remains centered with symmetric margins.

**Content column: 1264px** at 1440px viewport; narrows proportionally below max-width.

**Section padding-x: 0px** — sections span full width of viewport (no horizontal padding container-wide); individual components manage internal padding via `{spacing.md}`.

**Column strategy:** Single-column layout across all measured breakpoints (no multi-column grid observed). Horizontal scrolling or carousel patterns handle quiz card streams (e.g., "Recently published", "Best rating right now").

### Whitespace Philosophy

Spacing is **generous and intentional**, creating visual breathing room that lowers cognitive load. The system favors consistent `{spacing.md}` and `{spacing.lg}` application over compaction, reinforcing clarity and accessibility. Negative space often defines regions as much as borders or backgrounds—the pale `{colors.canvas}` background is as important as any component fill.

### Border Radius Scale

- `{rounded.none}` = 0px — applied to buttons, images, and cards for sharp, geometric aesthetic
- `{rounded.full}` = 9999px — applied to pill-shaped inputs, category badges, and icon buttons for soft, modern affordance

**Component-specific application:**
- Image containers: `{rounded.none}`
- Buttons: `{rounded.none}` (primary buttons are notable exception with pill shape in some variants)
- Input fields: `{rounded.full}` (soft entry affordance contrasts with hard component edges)
- Badges / category pills: `{rounded.full}`

### Border Widths

- **Thin: 4px** — applied to input borders; signals interactive affordance through visual weight rather than traditional 1–2px stroke

**Where applied:**
- Input focus/hover states: border increases to `{spacing.xxs}` (4px)
- Standard borders throughout: `{colors.hairline}` at 1px (visual dividers, card outlines)

## 6. Depth & Elevation

| Level | Treatment | Use |
|---|---|---|
| Flat / Base | No shadow; color blocking only | Default cards, neutral sections, body content |
| SM (Inset micro-lift) | `rgba(0, 0, 0, 0.3) 0px -8px 8px 0px inset` | Subtle depth; rarely deployed |
| MD (Neutral) | `rgba(0, 0, 0, 0) 0px 0px 0px 0px` (no-op shadow) | Fallback / undefined elevation |
| LG (Inset subtle) | `rgba(0, 0, 0, 0.1) 0px 4px 0px 0px inset` | Minor indentation; very rare |

**Elevation philosophy:** Quiz.com uses **color blocking** as its primary depth strategy rather than layered shadows. The warm canvas (`{colors.canvas}` — `#FFFDF4`) and neutral surface (`{colors.neutral-1}` — `#E5E3DB`) create sufficient visual separation; shadows are deployed sparingly and subtly. This approach keeps the interface flat and approachable while maintaining hierarchy through typography weight and color contrast.

### Opacity Levels

- **0.06** (6%) — near-invisible overlay or disabled state hint
- **0.10** (10%) — subtle background tint or hover state lightening
- **0.25** (25%) — disabled button/control; visible but recessed
- **0.60** (60%) — muted text or secondary element emphasis
- **0.70** (70%) — strong but not fully saturated element

Applied to: disabled state opacity, hover state fade, overlay backgrounds, icon dimming.

### Z-index / Layering

- **Base: 1** — default stacking context (most content)
- **Base: 2** — slightly elevated content (sticky headers, slightly above base)
- **Dropdown: 10** — dropdowns, popovers, tooltips (above base content)
- **Dropdown: 35** — modals, overlays, highest-priority interactive layers

Stacking order is minimal and flat; the system avoids deeply nested z-contexts, keeping layouts predictable and accessible.

## 7. Do's and Don'ts

### Do
- **Use `{colors.primary}` (`#EBDAC3`) sparingly** on high-intent CTAs (Sign in, "Join Game") to maintain visual hierarchy and user focus
- **Apply heavy typography weights (800–900)** to headings and labels to create emphasis without increasing font size
- **Maintain sharp edges (`{rounded.none}`)** on buttons and cards for geometric consistency; reserve `{rounded.full}` for inputs and badges only
- **Build depth through color blocking** (canvas, neutral, brand surfaces) rather than shadows; users will intuitively parse hierarchy
- **Respect generous `{spacing.md}` and `{spacing.lg}` gutters** to preserve whitespace and readability, especially on mobile
- **Always test link focus states** with outline 2px solid `rgb(255, 255, 255)` dotted for keyboard navigation accessibility
- **Deploy category pills and badges** with `{rounded.full}` and `{colors.neutral-1}` to signal non-critical grouping
- **Keep borders lean:** use 1px `{colors.hairline}` dividers and 4px input strokes only when needed to signal interactivity

### Don't
- **Do not invent new button shapes**; stick to pill inputs + sharp cards/buttons (clear distinction)
- **Do not apply `{colors.accent-1}` (`#23616A`) to primary interface elements**; this is a decorative accent with no measured UI role
- **Do not use shadow stacking** for depth—the palette and weight hierarchy suffice
- **Do not mix border radii** within a single component family (all cards sharp or all pill-shaped, not mixed)
- **Do not reduce letter-spacing** on headings or body text; the 0.36–0.6px tracking is essential to brand typography
- **Do not use multiple font families** beyond Nunito and Roboto (Roboto reserved for captions only)
- **Do not apply opacity to text** below 0.60 for body copy; readability will fail
- **Do not deploy z-index > 35** without explicit reason (modals, critical overlays); keep stacking simple
- **Do not assume interaction states beyond what was measured** (hover, focus, active, disabled); others are unknown

## 8. Responsive Behavior

### Breakpoints

| Breakpoint Name | Width | Content Column | Grid Cols | Key Changes |
|---|---|---|---|---|
| Mobile | 375px | 351px | 1 | Largest heading 30px; single-column layout; nav fully visible |
| Tablet | 768px | 752px | 1 | Heading down to 20px; content column widens; layout remains single-column |
| Desktop | 1024px | 1008px | 1 | Stable heading at 20px; minor content shifts |
| Large Desktop | 1280px | 1264px | 1 | Max content column reached; no further resize |
| Extra Large | 1440px | 1280px (clamped) | 1 | Max container 1440px; content pinned to 1280px |

**Derived breakpoints:**
- `375px` → `768px`: mobile-to-tablet threshold (heading scale-down, content breathing)
- `768px` and above: tablet-and-up (stable heading size, increased gutters)

### Touch Targets

**Minimum interactive size: 44px × 44px** (inferred from observed button and icon padding).
- Icon buttons: 32px × 32px (smaller targets acceptable for non-critical actions)
- Category pills: min 40px height, variable width
- Input fields: min 44px height (observed on PIN entry and search)
- Links: min 44px tap target via padding or adjacent spacing

### Collapsing Strategy

- **Mobile (375px):** Single-column; largest heading scales to 30px (vs. 20px desktop); card grids collapse to single scrollable stream; nav icons remain full-width visible
- **Tablet (768px+):** Heading returns to 20px; content column expands; quiz cards render in horizontal scroll carousel (not grid)
- **Desktop (1024px+):** Layout stabilizes; max-width clamped at 1440px; section padding and gutters uniform
- **No hamburger menu observed**; nav category tabs always visible at all breakpoints

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA** (`{colors.primary}` — `#EBDAC3`): Sign in, brand accents, active states
- **Background / Canvas** (`{colors.canvas}` — `#FFFDF4`): Page background, neutral surfaces
- **Heading text / Ink** (`{colors.on-primary}` — `#000000`): All text content, foreground elements
- **Borders / Hairline** (`{colors.hairline}` — `#CECCC5`): 1px dividers, card outlines
- **Secondary surface / Badge** (`{colors.neutral-1}` — `#E5E3DB`): Category pills, neutral containers

### Iteration Guide

1. **Build all interactive elements (buttons, inputs, links) with Nunito font, weight 800–900, and letter-spacing 0.36–0.6px** — this weight and tracking define the brand voice.

2. **Apply `{rounded.full}` (9999px) ONLY to inputs and badges; keep buttons and cards at `{rounded.none}` (0px)** — this is the sharpness/softness dialect.

3. **Deploy `{colors.primary}` (`#EBDAC3`) on maximum 2–3 high-intent elements per page** (Sign in, Primary CTA); everything else is neutral or ink.

4. **Use spacing units (`{spacing.md}`, `{spacing.lg}`) consistently**; never handcraft gaps—all gutters, padding, and margins must map to the scale.

5. **Build depth through color (canvas vs. neutral vs. primary) not shadows**; SM, MD, LG shadows are rare and rarely needed; rely on contrast and weight.

6. **Test all links with `outline: 2px solid rgb(255, 255, 255) dotted` on focus-visible** — keyboard accessibility is non-negotiable.

7. **Responsive design:** Heading scales 30px (mobile) → 20px (tablet+); content column expands 351px → 1280px; single-column layout across all breakpoints (no multi-col grid).

8. **Never invent semantic status colors (error/success/warning).** The extraction found none; use neutral and ink only unless explicit design calls for status.

## 10. Known Gaps

- **Interaction states partially measured.** The extraction captured focus, hover, active, and disabled pseudo-classes for links and inputs, but not all variant-specific hover/active colors (e.g., some button variants have multiple focus background colors that could not be attributed to a single component). Implement conservatively using extracted values where available; custom states may require design review.

- **No error/success/warning semantic color ramp found.** Quiz.com does not declare status colours in its markup; the system has no measured error state (red), success state (green), or warning state (yellow). Do not invent these; add them only if explicit brand guidance emerges.

- **Two colours extracted with no measured UI role:** `{colors.accent-1}` (`#23616A`, deep teal) appears nowhere in primary interface measurements. Treat as decorative or reserve for future expansion; do not deploy on core UX elements.

- **Gradient or decorative mesh patterns:** None observed. All colour blocks are flat and solid.

- **Interaction animations and transitions:** The extraction captured instant state changes (opacity, color, border) but no CSS transition durations or easing curves. Animations are not documented; assume instant or very-fast (< 200ms) transitions.

- **Dark mode or theme variants:** Only one theme was analysed (light, warm neutral). No dark-mode stylesheet or theme toggle was observed.

- **Typography on surfaces behind authentication:** Only the public Entertainment landing page was analysed. Quiz-creation interfaces, player dashboards, and authenticated UX may use different typographic rules.

- **Icon library specification:** Icons are observed (home, star, globe, etc.) but no SVG/icon font details were extracted. Assume Material Design or similar convention unless brand icon set is provided.

- **Component variants beyond buttons, links, inputs, and navigation:** Modals, popovers, toasts, dropdowns, and data tables are not represented in the extraction; if these components are needed, derive styling from measured button/card/input rules.

- **Print or export CSS:** No print stylesheet was analysed; colour and spacing for printed output are unknown.