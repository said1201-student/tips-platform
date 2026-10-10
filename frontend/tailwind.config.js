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
        // Ink scale — OneForma plum-black.
        navy: {
          DEFAULT: "#1A0816",
          50: "#F5F0F3",
          100: "#EBE0E7",
          700: "#3A1A2F",
          800: "#2A101F",
          900: "#1A0816",
          950: "#0F040B",
        },
        // Primary brand colour — OneForma magenta.
        accent: {
          DEFAULT: "#CD128A",
          dark: "#9E0D6A",
          light: "#FBE3F4",
        },
        surface: "#F5F0F3",
        line: "#E6DAE2",
        muted: "#7C5A70",
        status: {
          won: "#16A34A",
          lost: "#DC2626",
          pending: "#F59E0B",
          void: "#8A6E7E",
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