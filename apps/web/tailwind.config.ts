import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./tests/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        sand: "#f7f2e8",
        copper: "#b56f3f",
        mist: "#dce5ef",
      },
      boxShadow: {
        soft: "0 24px 80px rgba(16, 32, 51, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
