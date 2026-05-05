/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lavanda: '#EDE7FF',
        azulPastel: '#D6E8FF',
        verdeMenta: '#DDF7E9',
        durazno: '#FFE4D6',
        amarillo: '#FFF4CC',
        rosaPastel: '#FFD6E7',
        grisSuave: '#F5F6FA',
        azulGrisaceo: '#7C8493',
        morado: '#7C3AED',
        moradoClaro: '#A78BFA',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif']
      }
    },
  },
  plugins: [],
}