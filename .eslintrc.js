module.exports = {
  env: {
    mocha: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-await-in-loop': 0,
    'no-console': 0,
  },
};
