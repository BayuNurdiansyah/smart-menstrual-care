import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/**/*.blade.php',
        './resources/**/*.jsx',
        './resources/**/*.js',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#e879a0',
                    50:  '#fdf2f7',
                    100: '#fce7f0',
                    200: '#fbcfe4',
                    300: '#f9a8cc',
                    400: '#f472aa',
                    500: '#e879a0',
                    600: '#d6527f',
                    700: '#be3565',
                    800: '#9d2c54',
                    900: '#842849',
                },
            },
            fontFamily: {
                sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [
        forms,
    ],
}
