/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  darkMode: "media", // Memindahkan darkMode ke sini
  theme: {
    extend: {
      colors: {
        alftex: {
          primary: "#2D1B4E",
          secondary: "#4A2B7D",
          accent: "#D4AF37",
          bg: "#FDFCFE",
          card: "#FFFFFF",
        },
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: "200% center" },
          to: { backgroundPosition: "-200% center" },
        },
      },
    },
  },
  plugins: [],
};
