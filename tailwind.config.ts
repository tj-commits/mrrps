import { type Config } from "tailwindcss";
<<<<<<< HEAD

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
=======
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      blur: {
        xs: '2px',
      },
      width: {
        '128': '32rem',
      }
    }
>>>>>>> 24c7469 (explore)
  },
  plugins: [],
} satisfies Config;
