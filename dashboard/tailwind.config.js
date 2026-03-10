/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0F0F1A",
        electricBlue: "#4F9CF9",
        purpleAccent: "#8B5CF6",
        successGreen: "#10B981",
        warningOrange: "#F59E0B",
        dangerRed: "#EF4444",
        glassBg: "rgba(255, 255, 255, 0.05)",
        glassBorder: "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
