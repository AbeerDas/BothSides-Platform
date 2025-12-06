import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        body: ['Lora', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        for: {
          bg: "hsl(var(--for-bg))",
          border: "hsl(var(--for-border))",
          accent: "hsl(var(--for-accent))",
          hover: "hsl(var(--for-hover))",
        },
        against: {
          bg: "hsl(var(--against-bg))",
          border: "hsl(var(--against-border))",
          accent: "hsl(var(--against-accent))",
          hover: "hsl(var(--against-hover))",
        },
        greek: {
          gold: "hsl(var(--greek-gold))",
          olive: "hsl(var(--greek-olive))",
          terracotta: "hsl(var(--greek-terracotta))",
          marble: "hsl(var(--greek-marble))",
        },
      },
      borderRadius: {
        lg: "0",
        md: "0",
        sm: "0",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-5px) rotate(1deg)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "0.4",
          },
          "50%": {
            opacity: "0.8",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
        "fade-in": "stagger-fade-in 0.5s ease-out forwards",
        "fade-in-delay-1": "stagger-fade-in 0.5s ease-out 0.1s forwards",
        "fade-in-delay-2": "stagger-fade-in 0.5s ease-out 0.2s forwards",
        "fade-in-delay-3": "stagger-fade-in 0.5s ease-out 0.3s forwards",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
