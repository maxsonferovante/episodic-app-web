import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * Episodic design system — GitReverse-inspired "neo-brutalist" language.
 *
 * Ported from gitreverse.com (Next.js + Tailwind + Geist):
 *  - warm cream canvas (#FFFDF8) instead of pure white
 *  - near-black ink (#18181B) used for text AND borders
 *  - a single red accent (#D31611)
 *  - thick (2.5–3px) black borders
 *  - solid offset "hard" shadows instead of soft blurs
 *
 * The app reads semantic tokens (`bg`, `fg`, `border`, `accent`) everywhere,
 * so swapping the token values here reskins the whole UI at once.
 */
const geistSans =
  'var(--font-geist), -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
const geistMono =
  'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

/** GitReverse palette (light). */
const CREAM = "#FFFDF8"
const CREAM_PANEL = "#FFF4DA"
const CREAM_DEEP = "#EBDBB7"
const CREAM_HOVER = "#FFC480"
const INK = "#18181B"
const RED = "#D31611"
const ZINC_600 = "#52525B"
const ZINC_500 = "#71717A"

/** Dark counterpart — warm charcoal with the same red accent. */
const D_CANVAS = "#0F0F0E"
const D_PANEL = "#1A1A17"
const D_MUTED = "#26241F"
const D_DEEP = "#33302A"
const D_INK = "#F5F2EA"
const D_MUTED_FG = "#A8A29E"
const D_SUBTLE_FG = "#78716C"
const D_BORDER = "#3F3A33"

/** Hard-shadow color: black in light mode, cream in dark mode. */
const HARD = INK
const HARD_DARK = D_INK

const config = defineConfig({
  globalCss: {
    "html, body": {
      bg: "bg.subtle",
      color: "fg",
    },
    body: {
      fontFamily: "body",
      fontWeight: "normal",
    },
    "h1, h2, h3, h4": {
      letterSpacing: "-0.03em",
      fontWeight: "800",
    },
    "*::selection": {
      bg: "accent",
      color: "accent.contrast",
    },
    "a, button, [role=button], input, textarea, select": {
      "&:focus-visible": {
        outline: "2px solid",
        outlineColor: "accent.focusRing",
        outlineOffset: "2px",
      },
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: geistSans },
        body: { value: geistSans },
        mono: { value: geistMono },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "0.375rem" },
        l2: { value: "0.5rem" },
        l3: { value: "0.75rem" },
      },
      colors: {
        bg: {
          DEFAULT: { value: { _light: CREAM, _dark: D_PANEL } },
          subtle: { value: { _light: CREAM, _dark: D_CANVAS } },
          muted: { value: { _light: CREAM_PANEL, _dark: D_MUTED } },
          emphasized: { value: { _light: CREAM_DEEP, _dark: D_DEEP } },
          inverted: { value: { _light: INK, _dark: D_INK } },
          panel: { value: { _light: CREAM, _dark: D_PANEL } },
          error: {
            value: { _light: "{colors.red.50}", _dark: "{colors.red.950}" },
          },
          warning: {
            value: { _light: "{colors.orange.50}", _dark: "{colors.orange.950}" },
          },
          success: {
            value: { _light: "{colors.green.50}", _dark: "{colors.green.950}" },
          },
          info: {
            value: { _light: "{colors.blue.50}", _dark: "{colors.blue.950}" },
          },
        },
        fg: {
          DEFAULT: { value: { _light: INK, _dark: D_INK } },
          muted: { value: { _light: ZINC_600, _dark: D_MUTED_FG } },
          subtle: { value: { _light: ZINC_500, _dark: D_SUBTLE_FG } },
          accent: { value: { _light: RED, _dark: "#FF6B5E" } },
          inverted: { value: { _light: CREAM, _dark: INK } },
          error: {
            value: { _light: "{colors.red.600}", _dark: "{colors.red.400}" },
          },
          warning: {
            value: { _light: "{colors.orange.600}", _dark: "{colors.orange.300}" },
          },
          success: {
            value: { _light: "{colors.green.600}", _dark: "{colors.green.300}" },
          },
          info: {
            value: { _light: "{colors.blue.600}", _dark: "{colors.blue.300}" },
          },
        },
        border: {
          DEFAULT: { value: { _light: INK, _dark: D_BORDER } },
          subtle: { value: { _light: INK, _dark: D_BORDER } },
          muted: { value: { _light: CREAM_DEEP, _dark: D_DEEP } },
          emphasized: { value: { _light: INK, _dark: D_INK } },
          inverted: { value: { _light: INK, _dark: D_INK } },
          error: {
            value: { _light: "{colors.red.500}", _dark: "{colors.red.400}" },
          },
          warning: {
            value: { _light: "{colors.orange.500}", _dark: "{colors.orange.400}" },
          },
          success: {
            value: { _light: "{colors.green.500}", _dark: "{colors.green.400}" },
          },
          info: {
            value: { _light: "{colors.blue.500}", _dark: "{colors.blue.400}" },
          },
        },
        /** Single red accent — links, active states, focus rings, CTAs. */
        accent: {
          DEFAULT: { value: { _light: RED, _dark: "#FF6B5E" } },
          solid: { value: { _light: RED, _dark: "#FF6B5E" } },
          subtle: { value: { _light: CREAM_PANEL, _dark: D_MUTED } },
          muted: { value: { _light: CREAM_DEEP, _dark: D_DEEP } },
          emphasized: { value: { _light: CREAM_HOVER, _dark: "#5A4A32" } },
          fg: { value: { _light: RED, _dark: "#FF6B5E" } },
          contrast: { value: { _light: "#FFFFFF", _dark: INK } },
          focusRing: { value: { _light: RED, _dark: "#FF6B5E" } },
        },
      },
      /**
       * Solid, hard-edged offset shadows. No blur — the offset itself is the
       * depth cue, and the black slab is what makes the UI read as brutalist.
       */
      shadows: {
        xs: {
          value: {
            _light: `1px 1px 0 0 ${HARD}`,
            _dark: `1px 1px 0 0 ${HARD_DARK}`,
          },
        },
        sm: {
          value: {
            _light: `2px 2px 0 0 ${HARD}`,
            _dark: `2px 2px 0 0 ${HARD_DARK}`,
          },
        },
        md: {
          value: {
            _light: `3px 3px 0 0 ${HARD}`,
            _dark: `3px 3px 0 0 ${HARD_DARK}`,
          },
        },
        lg: {
          value: {
            _light: `4px 4px 0 0 ${HARD}`,
            _dark: `4px 4px 0 0 ${HARD_DARK}`,
          },
        },
        xl: {
          value: {
            _light: `5px 5px 0 0 ${HARD}`,
            _dark: `5px 5px 0 0 ${HARD_DARK}`,
          },
        },
        "2xl": {
          value: {
            _light: `6px 6px 0 0 ${HARD}`,
            _dark: `6px 6px 0 0 ${HARD_DARK}`,
          },
        },
        menu: {
          value: {
            _light: `4px 4px 0 0 ${HARD}`,
            _dark: `4px 4px 0 0 ${HARD_DARK}`,
          },
        },
        modal: {
          value: {
            _light: `6px 6px 0 0 ${HARD}`,
            _dark: `6px 6px 0 0 ${HARD_DARK}`,
          },
        },
      },
    },
    layerStyles: {
      /** Reusable hard-shadow surface. */
      brutal: {
        borderWidth: "2.5px",
        borderColor: "border",
        borderRadius: "l3",
        bg: "bg",
        boxShadow: "3px 3px 0 0 var(--chakra-colors-border)",
      },
      /** Lifts toward its shadow on hover — GitReverse card behaviour. */
      brutalInteractive: {
        borderWidth: "2.5px",
        borderColor: "border",
        borderRadius: "l3",
        bg: "bg",
        boxShadow: "3px 3px 0 0 var(--chakra-colors-border)",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        _hover: {
          transform: "translate(-1px, -1px)",
          boxShadow: "4px 4px 0 0 var(--chakra-colors-border)",
        },
        _active: {
          transform: "translate(2px, 2px)",
          boxShadow: "0 0 0 0 var(--chakra-colors-border)",
        },
      },
    },
    recipes: {
      button: {
        base: {
          fontWeight: "bold",
          letterSpacing: "-0.01em",
        },
        variants: {
          variant: {
            solid: {
              borderWidth: "2.5px",
              borderColor: "border",
              boxShadow: "2px 2px 0 0 var(--chakra-colors-border)",
              transition: "transform 100ms ease, box-shadow 100ms ease",
              _hover: {
                transform: "translate(-1px, -1px)",
                boxShadow: "3px 3px 0 0 var(--chakra-colors-border)",
              },
              _active: {
                transform: "translate(2px, 2px)",
                boxShadow: "0 0 0 0 var(--chakra-colors-border)",
              },
            },
            outline: {
              borderWidth: "2.5px",
              borderColor: "border",
              boxShadow: "2px 2px 0 0 var(--chakra-colors-border)",
              transition: "transform 100ms ease, box-shadow 100ms ease",
              _hover: {
                transform: "translate(-1px, -1px)",
                boxShadow: "3px 3px 0 0 var(--chakra-colors-border)",
              },
              _active: {
                transform: "translate(2px, 2px)",
                boxShadow: "0 0 0 0 var(--chakra-colors-border)",
              },
            },
            surface: {
              borderWidth: "2.5px",
              borderColor: "border",
              boxShadow: "2px 2px 0 0 var(--chakra-colors-border)",
            },
          },
        },
      },
      input: {
        base: {
          borderWidth: "2.5px",
          borderColor: "border",
          fontWeight: "medium",
        },
      },
      select: {
        base: {
          borderWidth: "2.5px",
          borderColor: "border",
          fontWeight: "semibold",
        },
      },
      textarea: {
        base: {
          borderWidth: "2.5px",
          borderColor: "border",
          fontWeight: "medium",
        },
      },
      badge: {
        base: {
          borderWidth: "1px",
          borderColor: "border.muted",
          fontWeight: "semibold",
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
