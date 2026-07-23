/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        // Neutral paper/ink scale (cool, not the warm-cream default)
        paper: "#F5F6F8",
        ink: {
          900: "#171A21",
          700: "#3D4250",
          500: "#6B7180",
          300: "#B0B5C0",
          200: "#DFE2E8",
          100: "#EEF0F3",
        },
        // Copilot / brand accent — restrained indigo, used sparingly
        copilot: {
          DEFAULT: "#4F3FF0",
          soft: "#EFEDFF",
          text: "#4432D6",
        },
        // Status semantics
        status: {
          pending: "#B45309",
          "pending-bg": "#FEF3E2",
          ready: "#15803D",
          "ready-bg": "#EAFBF1",
          committed: "#374151",
          "committed-bg": "#F0F1F3",
        },
      },
      boxShadow: {
        panel: "0 1px 2px rgba(23, 26, 33, 0.04), 0 1px 12px rgba(23, 26, 33, 0.03)",
      },
    },
  },
  plugins: [],
};
