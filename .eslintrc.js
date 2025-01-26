module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  rules: {
    "react/prop-types": "off",
    "no-unused-vars": "warn",
  },
};
