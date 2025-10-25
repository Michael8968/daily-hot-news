module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // 基础规则
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'warn',

    // 代码风格
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'keyword-spacing': ['error', { 'before': true, 'after': true }],
    'space-infix-ops': 'error',
    'eol-last': 'error',
    'no-trailing-spaces': 'error',

    // 微信小程序特定规则
    'no-undef': 'off', // 微信小程序全局变量
    'no-global-assign': 'off', // 允许修改微信小程序全局变量

    // 最佳实践
    'prefer-const': 'error',
    'no-var': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-return': 'error',
    'no-useless-constructor': 'error',
    'no-useless-catch': 'error',

    // 安全相关
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // 性能相关
    'no-loop-func': 'error',
    'no-inner-declarations': 'error'
  },
  globals: {
    // 微信小程序全局变量
    'wx': 'readonly',
    'App': 'readonly',
    'Page': 'readonly',
    'Component': 'readonly',
    'Behavior': 'readonly',
    'getApp': 'readonly',
    'getCurrentPages': 'readonly',
    'getCurrentInstance': 'readonly',
    'defineComponent': 'readonly',
    'definePage': 'readonly',
    'defineCustomElement': 'readonly',
    'defineAsyncComponent': 'readonly',
    'nextTick': 'readonly',
    'onLoad': 'readonly',
    'onShow': 'readonly',
    'onHide': 'readonly',
    'onUnload': 'readonly',
    'onReady': 'readonly',
    'onPullDownRefresh': 'readonly',
    'onReachBottom': 'readonly',
    'onShareAppMessage': 'readonly',
    'onShareTimeline': 'readonly',
    'onAddToFavorites': 'readonly',
    'onPageScroll': 'readonly',
    'onResize': 'readonly',
    'onTabItemTap': 'readonly',
    'onNavigationBarButtonTap': 'readonly',
    'onBackPress': 'readonly',
    'onNavigationBarSearchInputChanged': 'readonly',
    'onNavigationBarSearchInputConfirmed': 'readonly',
    'onNavigationBarSearchInputClicked': 'readonly',
    'onReachBottomDistance': 'readonly',
    'onPullDownRefresh': 'readonly',
    'onReachBottom': 'readonly',
    'onShareAppMessage': 'readonly',
    'onShareTimeline': 'readonly',
    'onAddToFavorites': 'readonly',
    'onPageScroll': 'readonly',
    'onResize': 'readonly',
    'onTabItemTap': 'readonly',
    'onNavigationBarButtonTap': 'readonly',
    'onBackPress': 'readonly',
    'onNavigationBarSearchInputChanged': 'readonly',
    'onNavigationBarSearchInputConfirmed': 'readonly',
    'onNavigationBarSearchInputClicked': 'readonly'
  },
  overrides: [
    {
      files: ['**/tests/**/*.js', '**/*.test.js'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['**/cloudfunctions/**/*.js'],
      env: {
        node: true
      },
      rules: {
        'no-console': 'off'
      }
    }
  ]
};
