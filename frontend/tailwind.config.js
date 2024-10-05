/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'brand-darker': "#0f1720",
        'brand-dark': "#153e75",
        'brand': "#2a69ac",
        nord0: "#2E3440",
        nord1: "#3B4252",
        nord2: "#434C5E",
        nord3: "#4C566A",
        nord4: "#D8DEE9",
        nord5: "#E5E9F0",
        nord6: "#ECEFF4",
        nord7: "#8FBCBB",
        nord8: "#88C0D0",
        nord9: "#81A1C1",
        nord10: "#5E81AC",
        nord11: "#BF616A",
        nord12: "#D08770",
        nord13: "#EBCB8B",
        nord14: "#A3BE8C",
        nord15: "#B48EAD"
      },
      fontFamily: {
        "Inter": ["Inter", "sans-serif"]
      },
      clipPath: {
        'checkmark': 'polygon(14% 44%, 0% 65%, 50% 100%, 100% 0%, 80% 0%, 37% 77%)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.clip-checkmark': {
          'clip-path': 'polygon(14% 44%, 0% 65%, 50% 100%, 100% 0%, 80% 0%, 37% 77%)',
        },
      });
    },
  ],
}