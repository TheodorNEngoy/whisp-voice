module.exports = {
  root: true,
  extends: ["../../packages/config/eslint/next.cjs"],
  parserOptions: {
    project: "./tsconfig.json"
  }
};
