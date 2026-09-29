import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        border: "var(--border)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        quiz: {
          primary: "#EBDAC3",
          canvas: "#FFFDF4",
          neutral: "#E5E3DB",
          hairline: "#CECCC5",
          ink: "#000000",
          teal: "#23616A",
          cyan: "#00AFC6",
          green: "#4CA471",
          coral: "#FF94AB",
          amber: "#B9843E",
          "dark-bg": "#100F0F",
          "dark-surface": "#1E1D1D",
          "dark-surfaceRaised": "#2A2929",
          "dark-border": "#363535",
        },
        arena: {
          red: "#E50914",
          "red-dark": "#B20710",
          "red-glow": "#FF2A3B",
          crimson: "#DC2626",
          dark: "#100F0F",
          card: "#1E1D1D",
          border: "#363535",
          accent: "#EBDAC3",
          gold: "#B9843E",
          emerald: "#4CA471",
          purple: "#7C3AED",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "Nunito", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["var(--font-nunito)", "Nunito", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        nunito: ["var(--font-nunito)", "Nunito", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        roboto: ["var(--font-roboto)", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "glow-red": "0 0 30px rgba(229, 9, 20, 0.4), 0 0 60px rgba(229, 9, 20, 0.15)",
        "glow-gold": "0 0 30px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.1)",
        "glow-emerald": "0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(16, 185, 129, 0.1)",
        "card-dark": "0 4px 32px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
        "card-light": "0 4px 24px rgba(0, 0, 0, 0.08)",
        "float": "0 20px 60px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "pulse-subtle": "pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
        "score-flash": "scoreFlash 0.5s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "bg-glow": "bgGlow 3s ease-in-out infinite",
        "slide-in-up": "slideInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-scale": "fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.75" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scoreFlash: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(229, 9, 20, 0.3)" },
          "50%": { boxShadow: "0 0 35px rgba(229, 9, 20, 0.7)" },
        },
        bgGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        slideInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInScale: {
          from: { opacity: "0", transform: "scale(0.95) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-arena": "linear-gradient(135deg, #E50914 0%, #FF6B6B 50%, #F59E0B 100%)",
        "gradient-dark": "linear-gradient(180deg, #0B0C10 0%, #12141C 100%)",
        "gradient-card-dark": "linear-gradient(145deg, #12141C 0%, #0E1018 100%)",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
