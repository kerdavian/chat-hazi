module.exports = {
  'env': {
    'browser': true,
    'es6': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 8,
    'sourceType': 'module',
    'ecmaFeatures': {
      'jsx': false
    }
  },
  'plugins': [
    'import'
  ],
  'rules': {
    'indent': [
      'error',
      2
    ],
    'no-console': 0,
    'no-undef': 0,
    'linebreak-style': 0,
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'no-unused-vars': 0
  }
};
