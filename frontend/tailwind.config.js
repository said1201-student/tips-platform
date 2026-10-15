/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ink scale — betpawa-style charcoal.
        navy: {
          DEFAULT: "#252A2D",
          50: "#F2F2F3",
          100: "#E4E6E7",
          700: "#3A4043",
          800: "#171A1C",
          900: "#171A1C",
          950: "#0F1112",
        },
        // Primary brand colour — betpawa lime green.
        accent: {
          DEFAULT: "#9CE800",
          dark: "#5B8506",
          light: "#ECFCCB",
        },
        surface: "#F2F2F3",
        line: "#E4E6E7",
        muted: "#7A8185",
        status: {
          won: "#5B8506",
          lost: "#CC371B",
          pending: "#FF7A00",
          void: "#7A8185",
        },
      },
      fontFamily: {
        heading: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26, 8, 22, 0.05), 0 1px 3px rgba(26, 8, 22, 0.06)",
        "card-hover":
          "0 12px 28px rgba(26, 8, 22, 0.12), 0 4px 12px rgba(26, 8, 22, 0.06)",
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [],
};