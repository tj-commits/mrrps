import { type Config } from "tailwindcss";
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
  },
  plugins: [],
} satisfies Config;
