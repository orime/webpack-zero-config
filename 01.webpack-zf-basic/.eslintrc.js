/* eslint-disable linebreak-style */
module.exports = {
  // root: true, 不再从零开始编写配置文件了，由于继承了Airbnb自己就不是根了
  extends: 'airbnb',
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2015,
  },
  env: {
    browser: true,
  },
  rules: {
    indent: 'off',
    quotes: 'off',
    semi: 'off',
    'no-console': 'warn',
    "no-unused-vars": 'warn',
    "import/prefer-default-export": 'off',
    "no-param-reassign": 'off',
    "import/no-extraneous-dependencies": 'off',
  },
};
