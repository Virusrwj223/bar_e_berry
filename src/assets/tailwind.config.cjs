/** @type {import('tailwindcss').Config} */
module.exports = {
  variants: {
    display: ['responsive', 'group-hover', 'group-focus'],
   },
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx,html}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx,html}",
    "./components/**/*.{js,ts,jsx,tsx,mdx,html}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx,html}",

  ],
  theme: {
    extend: {
      colors: {
        'main-bg': '#20232A',
        'secondary-bg': '#33373E',
        'light-gray': '#F7F7F7',
        'bare-red': '#FF3131',
        'half-transparent': 'rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: (theme) => ({
        barelogo: "url('./assets/BAR-E.png')",
      }),
    },
  },
  plugins: [
    
  ],
}

