 /** @type {import('tailwindcss').Config} */
 export default {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-blue)',
        secondary: 'var(--primary-orange)',
        accent: 'var(--dark-teal)',
        'mute-blue': 'var(--secondary-blue)',
        danger: {
          DEFAULT: 'var(--color-danger)',
          dark: 'var(--color-danger-dark)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          dark: 'var(--color-success-dark)',
        },
        'gray-light': 'var(--gray-light)',
      }
    },
  },
  plugins: [],
}