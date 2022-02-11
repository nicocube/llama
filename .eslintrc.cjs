/*
 * Copyright 2022 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

module.exports = {
  'env': {
    'es2021': true,
    'browser': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:import/recommended',
    // 'plugin:jsdoc/recommended',
  ],
  'parserOptions': {
    'ecmaVersion': 13,
    'sourceType': 'module'
  },
  'plugins': [
    'jsdoc'
  ],
  'ignorePatterns': ['dist/'],
  'rules': {
    'indent': [
      'error',
      2,
      { 'MemberExpression': 0 }
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'no-trailing-spaces': [
      1,
      { 'skipBlankLines': false }
    ],
    'no-console': 1,
    'prefer-const': 'error',
    'comma-spacing': 'warn',
    'no-multi-spaces': 'warn',
    'object-curly-spacing': ['error', 'always'],
    'space-in-parens': ['error', 'never'],
    'max-len': ['warn', { 'code': 160, 'ignoreComments': true }],
    'prefer-template': 'warn',
    'no-param-reassign': 'error',
    'no-whitespace-before-property': 'error',
    'space-infix-ops': ['error', { 'int32Hint': true }],
    'space-before-blocks': 'error',
    'no-shadow': 'error',
    'array-callback-return': ['error', { checkForEach: true }]
  }
}
