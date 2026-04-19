/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      colors: {
        background: "#F8FAFF",
        surface: {
          indigo: "#EEF2FF",
          blue: "#EFF6FF",
          cyan: "#ECFEFF",
          emerald: "#ECFDF5",
          amber: "#FFFBEB",
          rose: "#FFF1F2",
          DEFAULT: "#FFFFFF",
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        gradientStart: "#6366F1",
        gradientEnd: "#8B5CF6",
        secondaryStart: "#06B6D4",
        secondaryEnd: "#3B82F6",
        income: "#22C55E",
        expense: "#EF4444",
        savings: "#F59E0B",
        investment: "#8B5CF6",
        border: "#e5e7eb",
        textHeadings: "#0f172a",
        textPrimary: "#1e293b",
        textSecondary: "#475569",
        textMuted: "#64748b",
      },
    },
  },
  plugins: [],
};

