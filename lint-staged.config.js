module.exports = {
  'packages/api/**/*.{ts,js,jsx,tsx}': [
    (filenames) => `npm test --workspace api`,
  ],
  'packages/frontend/**/*.{ts,js,jsx,tsx}': [
    (filenames) => `npm test --workspace frontend`,
  ],
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,html,css,scss}': ['prettier --write'],
};