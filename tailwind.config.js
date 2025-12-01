/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#22D3EE', // A nice cyan/aqua color
			},
			keyframes: {
				wave: {
					'0%, 100%': { transform: 'scaleY(0.5)' },
					'50%': { transform: 'scaleY(1)' },
				},
			},
			animation: {
				wave: 'wave 1s ease-in-out infinite',
			}
		},
	},
	plugins: [],
};
