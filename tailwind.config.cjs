module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend:{
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' },
        }
      },
      animation: {
        slideIn: 'slideIn 0.2s ease-in-out forwards',
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'white': '#ffffff',
        'purple': '#3f3cbb',
        'midnight': '#121063',
        'metal': '#565584',
        'tahiti': '#3ab7bf',
        'silver': '#ecebff',
        'bubble-gum': '#ff77e9',
        'bermuda': '#78dcca',
        "hmu-green": '#1b495a'
      },
    }

  },
  plugins: [],
}
