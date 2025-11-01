/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: "all",
  bracketSpacing: true,
  plugins: ["prettier-plugin-tailwindcss"]
};

export default config;
