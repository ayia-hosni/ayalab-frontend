# Aya Lab — Color Palette

Source of truth: [`src/styles.css`](src/styles.css) (`:root`, the dark-theme media query block, and the `[data-theme="dark"]` block). Every color in the app is a CSS custom property — nothing is hardcoded as a literal hex value outside `styles.css` except the code-editor chrome, the pointer-visualizer roles, and a few one-off SVG accents in the visualizer components.

## Palette source

[colorhunt.co/palette/fbefefffe2e2f5cbcbc5b3d3](https://colorhunt.co/palette/fbefefffe2e2f5cbcbc5b3d3) — four pastel swatches:

| Hex | RGB | Role in the app |
|---|---|---|
| `#FBEFEF` | `251, 239, 239` | Palest blush — `--surface-2` / `--primary-light` |
| `#FFE2E2` | `255, 226, 226` | Light blush — `--surface-3` / `--primary-border` |
| `#F5CBCB` | `245, 203, 203` | Blush base — `--primary` |
| `#C5B3D3` | `197, 179, 211` | Lavender — `--secondary-border` / `--easy-border` |

## Design rule: exactly two hues

> A fun/gaming app reads as flat and corporate with a full rainbow of unrelated hues, but pure grayscale reads as somber. So: **exactly two hues, used in shades, nowhere else.**

- **Lavender** (`--secondary`) — the dominant brand/interactive color. It also drives the entire difficulty ramp (Easy/Medium/Hard are three *shades* of this one hue, not three different colors).
- **Blush pink** (`--primary`) — the sparing "reward/accent" color: the coffee-support button, "Coming Soon" tags, badges. Never combined with lavender in the same decorative element.

### Why some tokens aren't the literal 4 swatches

All four colorhunt swatches are pastel — none is dark or saturated enough to put **white text on top of**, which matters here because `--secondary` alone backs roughly 70 solid-fill buttons/active-tabs/chips across the app (checked via `grep -rn "var(--secondary)"` before making the swap). Using `#C5B3D3` directly as `--secondary` would have made every one of those illegible.

So the swap keeps the palette's two literal, most-saturated swatches (`#F5CBCB` blush, `#C5B3D3` lavender) as the `-border` tier — where they show up constantly as visible borders/outlines — and the two palest swatches (`#FBEFEF`, `#FFE2E2`) as the `-light`/neutral-surface tier. The `-base` (solid-fill) and `-shadow` (small-text) tiers are **derived**, not literal: deeper/darker tones of the *same two hues*, computed to stay in the same family while restoring enough contrast for white text and body text respectively — the same technique the previous palette already used (its own `--primary-shadow` was a derived burnt-orange, since raw peach had "nowhere near enough contrast on white").

## Light theme

| Token | Hex | Used for |
|---|---|---|
| `--bg-color` | `#FFFFFF` | Page background |
| `--card` | `#FFFFFF` | Card/panel surfaces |
| `--surface-2` | `#FBEFEF` | Subtle hover / alt background (literal swatch) |
| `--surface-3` | `#FFE2E2` | Pressed/active background (literal swatch) |
| `--ink` | `#463A4F` | Primary text |
| `--ink-2` | `#6D5B7B` | Secondary text |
| `--ink-3` | `#9687A1` | Tertiary/muted text |
| `--line` | `#E6E0EB` | Default borders |
| `--line-heavy` | `#C8BDD1` | Emphasized borders |
| `--shadow-color` | `rgba(70, 58, 79, 0.08)` | Card shadows |

### Blush pink (`--primary`) — accent

| Token | Hex | Source |
|---|---|---|
| `--primary` | `#F5CBCB` | literal swatch |
| `--primary-shadow` | `#8A3B3B` | derived (dark rose, for small text) |
| `--primary-light` | `#FBEFEF` | literal swatch |
| `--primary-border` | `#FFE2E2` | literal swatch |

### Lavender (`--secondary`) — brand/interactive

| Token | Hex | Source |
|---|---|---|
| `--secondary` | `#8053A2` | derived (deep enough for white text) |
| `--secondary-shadow` | `#563371` | derived (darker still, for small text) |
| `--secondary-light` | `#F1EDF6` | derived (pale tint) |
| `--secondary-border` | `#C5B3D3` | literal swatch |

### Difficulty ramp — shades of lavender, not a 3rd color

| Difficulty | Base | Shadow (text) | Light (bg) | Border |
|---|---|---|---|---|
| Easy | `--easy` `#D3C3DF` | `--easy-shadow` `#653F83` (= hard base) | `--easy-light` `#F1EDF6` (= secondary-light) | `--easy-border` `#C5B3D3` (= secondary-border) |
| Medium | `--medium` `#8053A2` (= secondary base) | `--medium-shadow` `#46295C` | `--medium-light` `#E7DDEE` | `--medium-border` `#D3C3DF` (= easy base) |
| Hard | `--hard` `#653F83` | `--hard-shadow` `#3B2150` | `--hard-light` `#C5B3D3` (= easy-border) | `--hard-border` `#8053A2` (= medium base) |

Lighter = easier, darker/bolder = harder — same hue throughout, and each tier's `-light`/`-border` deliberately reuses an adjacent tier's token rather than inventing a new swatch, exactly the cascading-reuse structure the previous purple ramp used (now recolored, not restructured).

## Dark theme

Applied via `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }` **and** duplicated verbatim under `:root[data-theme="dark"]` for the explicit in-app toggle — the two blocks are kept in sync by hand on purpose (a single combined selector can't express "OS dark unless user forced light" + "user forced dark regardless of OS" at the same time).

| Token | Hex | Used for |
|---|---|---|
| `--bg-color` | `#150F1A` | Page background |
| `--card` | `#22182A` | Card/panel surfaces |
| `--surface-2` | `#30213B` | Subtle hover / alt background |
| `--surface-3` | `#3D2A4B` | Pressed/active background |
| `--ink` | `#EBE6F0` | Primary text |
| `--ink-2` | `#B09DBE` | Secondary text |
| `--ink-3` | `#7D6490` | Tertiary/muted text |
| `--line` | `#4A3659` | Default borders |
| `--line-heavy` | `#644979` | Emphasized borders |
| `--shadow-color` | `rgba(10, 8, 15, 0.4)` | Card shadows |

### Blush pink — accent (dark)

| Token | Hex |
|---|---|
| `--primary` | `#DF9090` |
| `--primary-shadow` | `#F3CECE` |
| `--primary-light` | `#422424` |
| `--primary-border` | `#6E3535` |

### Lavender — brand/interactive (dark)

| Token | Hex |
|---|---|
| `--secondary` | `#B88CD9` |
| `--secondary-shadow` | `#E3D0F1` |
| `--secondary-light` | `#301F3D` |
| `--secondary-border` | `#503267` |

### Difficulty ramp (dark)

| Difficulty | Base | Shadow (text) | Light (bg) | Border |
|---|---|---|---|---|
| Easy | `--easy` `#D3C3DF` (same as light theme) | `--easy-shadow` `#ECE0F5` | `--easy-light` `#2C1E3D` | `--easy-border` `#4A3660` |
| Medium | `--medium` `#A569D8` | `--medium-shadow` `#DDCBEB` | `--medium-light` `#352445` | `--medium-border` `#D3C3DF` (= easy) |
| Hard | `--hard` `#8053A2` (= light-theme secondary) | `--hard-shadow` `#F1E7F9` | `--hard-light` `#3F2A50` | `--hard-border` `#6B4F87` |

Note the inversion versus light mode: `-shadow` tokens go from *darker-than-base* (light theme, for text contrast on white) to *lighter-than-base* (dark theme, for text contrast on the near-black background) — same relationship, opposite direction. `--easy` staying byte-identical between themes, and `--hard` (dark) reusing the light theme's `--secondary`, both mirror exactly how the previous purple palette cross-referenced its own tiers.

## Special-purpose colors (untouched by this swap)

**Code editor chrome** — intentionally *not* tied to the theme or the brand palette. The Solution tab's code editor is always a dark, VS Code-like surface regardless of site theme:

| Token | Hex |
|---|---|
| `--editor-bg` | `#1E1E2E` |
| `--editor-bg-2` | `#181825` |
| `--editor-border` | `#2D2E3E` |
| `--editor-ink` | `#CBD5E1` |
| `--editor-ink-2` | `#64748B` |
| `--editor-ghost` | `#2D3543` |
| `--editor-ghost-hover` | `#3A4354` |

**Pointer-visualizer roles** — declared in `styles.css` (`:root` plus both dark-theme blocks) and consumed by `pointer-colors.ts`, which every Trace Game / Move the Pointer / Both Solutions React component imports rather than hardcoding hex inline:

| Token | Light | Dark | Role |
|---|---|---|---|
| `--pointer-head` / `--pointer-head-ink` | `#ccd2dd` / `var(--ink)` | `#423A52` / `#D7D2E3` | `head` pointer |
| `--pointer-prev` / `--pointer-prev-ink` | `#f4c2c2` / `var(--ink)` | `#5C2E35` / `#F3CECE` | `prev` pointer |
| `--pointer-curr` / `--pointer-curr-ink` | `#e0e8c3` / `#2D3436` | `#3A4326` / `#D7E2B8` | `curr` pointer |
| `--pointer-next` / `--pointer-next-ink` | `#f9e4bc` / `#7A5000` | `#4A3A17` / `#F3D98C` | `next`/`nxt` pointer |

These are functional/diagram colors, not brand identity, so — unlike the rest of the app — they aren't restricted to the two brand hues. Other roles in `pointer-colors.ts` (`slow`/`fast`/`tmp`/`left`/`right`/`result`/`i`/`call`/`memo`, used by the remove-elements and palindrome problem variants) are still hardcoded hex, not yet tokenized.

The reversal-problem visualizers (`move-pointer-react.tsx`, `solution-slides-react.tsx`, `linked-list-game-react.tsx`) also route their non-pointer chrome through existing tokens instead of one-off hex: header gradient uses `--primary-light`→`--secondary-light`, the code panel reuses the editor-chrome tokens above, canvas backgrounds use `--surface-2`/`--line`, connector arrows use `--line-heavy`, the "reverse the arrow"/error color uses `--hard`, and the drag/active-line accent uses `--medium`. Translucent fills use `color-mix(in srgb, var(--token) N%, transparent)` rather than a separate rgba literal.

## Fonts (declared alongside the colors, same `:root` block)

| Token | Value |
|---|---|
| `--sans` | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif` |
| `--mono` | `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace` |

## If you're adding a new color

Ask first: can this be a *shade* of lavender or blush instead of a new hue? The difficulty ramp is the model — three severities, one hue, just intensity. A genuinely new semantic color should get the same shadow/light/border quartet as `--primary`/`--secondary` (four tokens: base, shadow-for-text, light-bg, border) so it composes the same way everywhere else does.
