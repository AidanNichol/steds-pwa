module.exports = {
  // I want to use babel-eslint for parsing!
  parser: 'babel-eslint',
  env: {
    // I write for browser
    browser: true,
    // in CommonJS
    node: true,
    es6: true,
    jest: true,
  },
  // React
  plugins: ['react', 'prettier'],
  extends: ['eslint:recommended', 'prettier'],
  // To give you an idea how to override rule options:
  rules: {
    'prettier/prettier': ['error'],
    // 'no-unused-vars': 0,
    'object-curly-newline': 0,
    quotes: [0, 'single'],
    'eol-last': [0],
    'no-mixed-requires': [0],
    'no-underscore-dangle': [0],
    'semi-spacing': [0],
    'no-console': [0],
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    curly: [0],
    'new-cap': [0],
    'comma-dangle': [
      'error',
      {
        arrays: 'ignore',
        objects: 'ignore',
        imports: 'ignore',
        exports: 'ignore',
        functions: 'never',
      },
    ],
    'react/display-name': 0,
    'react/jsx-boolean-value': 1,
    'react/jsx-no-undef': 1,
    'react/jsx-sort-props': 0,
    'react/jsx-uses-react': 1,
    'react/jsx-uses-vars': 1,
    'react/no-did-mount-set-state': 1,
    'react/no-did-update-set-state': 1,
    'react/no-multi-comp': 0,
    'react/no-unknown-property': 1,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 1,
    'react/self-closing-comp': 1,
    'react/sort-comp': 1,
    strict: 2,
  },
};
