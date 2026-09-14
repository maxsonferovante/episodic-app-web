import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * Episodic design system — Geist (Vercel) inspired.
 *
 * Colors, typography, radii and shadows are ported from the Geist
 * design tokens so the app shares Vercel's neutral, high-contrast
 * language: #FAFAFA canvas, #FFF surfaces, near-black ink, hairline
 * gray-alpha borders and a blue accent used for links/focus.
 */
const geistSans =
  'var(--font-geist), -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
const geistMono =
  'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

const config = defineConfig({
  globalCss: {
    "html, body": {
      bg: "bg.subtle",
      color: "fg",
    },
    body: {
      fontFamily: "body",
    },
    "h1, h2, h3, h4": {
      letterSpacing: "-0.025em",
      fontWeight: "600",
    },
    "*::selection": {
      bg: "accent.muted",
      color: "fg",
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
        l2: { value: "0.375rem" },
        l3: { value: "0.375rem" },
      },
      colors: {
        bg: {
          DEFAULT: { value: { _light: "#ffffff", _dark: "#000000" } },
          subtle: { value: { _light: "#fafafa", _dark: "#000000" } },
          muted: { value: { _light: "#f2f2f2", _dark: "#1a1a1a" } },
          emphasized: { value: { _light: "#ebebeb", _dark: "#1f1f1f" } },
          inverted: { value: { _light: "#171717", _dark: "#ededed" } },
          panel: { value: { _light: "#ffffff", _dark: "#0a0a0a" } },
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
          DEFAULT: { value: { _light: "#171717", _dark: "#ededed" } },
          muted: { value: { _light: "#4d4d4d", _dark: "#a0a0a0" } },
          subtle: { value: { _light: "#8f8f8f", _dark: "#7d7d7d" } },
          accent: { value: { _light: "#0070f7", _dark: "#50a8ff" } },
          inverted: { value: { _light: "#f2f2f2", _dark: "#171717" } },
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
          DEFAULT: { value: { _light: "#ebebeb", _dark: "#1f1f1f" } },
          subtle: { value: { _light: "#eaeaea", _dark: "#1f1f1f" } },
          muted: { value: { _light: "#f2f2f2", _dark: "#1a1a1a" } },
          emphasized: { value: { _light: "#e6e6e6", _dark: "#292929" } },
          inverted: { value: { _light: "#171717", _dark: "#ebebeb" } },
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
        /**
         * Vercel/Geist blue accent. The app reads `accent`, `accent.subtle`
         * and `fg.accent`, so this group lights up the accent bars, active
         * icons and focus rings across the UI.
         */
        accent: {
          DEFAULT: { value: { _light: "#0090ff", _dark: "#0090ff" } },
          solid: { value: { _light: "#0090ff", _dark: "#0090ff" } },
          subtle: { value: { _light: "#eaf4ff", _dark: "#0b1c2e" } },
          muted: { value: { _light: "#d5eaff", _dark: "#12243a" } },
          emphasized: { value: { _light: "#b5dbff", _dark: "#1b3550" } },
          fg: { value: { _light: "#0070f7", _dark: "#50a8ff" } },
          contrast: { value: { _light: "#ffffff", _dark: "#0a0a0a" } },
          focusRing: { value: { _light: "#0070f7", _dark: "#50a8ff" } },
        },
      },
      shadows: {
        xs: {
          value: {
            _light: "0px 1px 2px rgba(0,0,0,0.04)",
            _dark: "0px 1px 1px rgba(0,0,0,0.29)",
          },
        },
        sm: {
          value: {
            _light: "0px 2px 2px rgba(0,0,0,0.04)",
            _dark: "0px 2px 2px rgba(0,0,0,0.32)",
          },
        },
        md: {
          value: {
            _light: "0px 2px 2px rgba(0,0,0,0.04), 0px 8px 8px -8px rgba(0,0,0,0.04)",
            _dark: "0px 2px 2px rgba(0,0,0,0.32), 0px 8px 8px -8px rgba(0,0,0,0.16)",
          },
        },
        lg: {
          value: {
            _light: "0px 2px 2px rgba(0,0,0,0.04), 0px 8px 16px -4px rgba(0,0,0,0.04)",
            _dark: "0px 2px 2px rgba(0,0,0,0.32), 0px 8px 16px -4px rgba(0,0,0,0.16)",
          },
        },
        xl: {
          value: {
            _light:
              "0px 1px 1px rgba(0,0,0,0.02), 0px 4px 8px -4px rgba(0,0,0,0.04), 0px 16px 24px -8px rgba(0,0,0,0.06)",
            _dark:
              "0px 1px 1px rgba(0,0,0,0.16), 0px 4px 8px -4px rgba(0,0,0,0.16), 0px 16px 24px -8px rgba(0,0,0,0.24)",
          },
        },
        "2xl": {
          value: {
            _light:
              "0px 1px 1px rgba(0,0,0,0.02), 0px 8px 16px -4px rgba(0,0,0,0.04), 0px 24px 32px -8px rgba(0,0,0,0.06)",
            _dark:
              "0px 1px 1px rgba(0,0,0,0.16), 0px 8px 16px -4px rgba(0,0,0,0.16), 0px 24px 32px -8px rgba(0,0,0,0.24)",
          },
        },
        menu: {
          value: {
            _light:
              "0 0 0 1px rgba(0,0,0,0.08), 0px 1px 1px rgba(0,0,0,0.02), 0px 4px 8px -4px rgba(0,0,0,0.04), 0px 16px 24px -8px rgba(0,0,0,0.06)",
            _dark:
              "0 0 0 1px rgba(255,255,255,0.09), 0px 1px 1px rgba(0,0,0,0.16), 0px 4px 8px -4px rgba(0,0,0,0.24), 0px 16px 24px -8px rgba(0,0,0,0.4)",
          },
        },
        modal: {
          value: {
            _light:
              "0 0 0 1px rgba(0,0,0,0.08), 0px 1px 1px rgba(0,0,0,0.02), 0px 8px 16px -4px rgba(0,0,0,0.04), 0px 24px 32px -8px rgba(0,0,0,0.06)",
            _dark:
              "0 0 0 1px rgba(255,255,255,0.09), 0px 1px 1px rgba(0,0,0,0.16), 0px 8px 16px -4px rgba(0,0,0,0.24), 0px 24px 32px -8px rgba(0,0,0,0.4)",
          },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
