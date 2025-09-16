/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "../index.html",
        "../src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'link-blue': '#0000ff',
                'link-visited': '#800080',
            },
            fontFamily: {
                'sans': ['Arial', 'Helvetica', 'sans-serif'],
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
