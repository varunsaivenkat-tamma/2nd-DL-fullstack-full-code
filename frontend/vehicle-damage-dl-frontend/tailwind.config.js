/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        safePrimary: "#f4f7f9fe",
        safeSecondary: "#2a9b1fff",
        safeAccent: "#fcfbfcff",

        safeBg: "#0A0A0A",
        safeSurface: "#111111",
        safeDeep: "#1A1A1A",

        safeHeading: "#F8F8F8",
        safeBody: "#d3fd05ff",

        darkSafeBg: "#000000",
        darkSafeHeading: "#dfd9d9ff",
        darkSafeBody: "#D1D5DB",
      },

      backgroundImage: {
        safeGradient:
          "linear-gradient(265deg, rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 50%, rgba(237, 221, 83, 1) 100%)",
      },
    },
  },
  plugins: [],
};
