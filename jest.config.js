module.exports = {
  // 测试环境
  testEnvironment: 'node',

  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // 覆盖率收集
  collectCoverageFrom: [
    'utils/**/*.js',
    'components/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],

  // 覆盖率目录
  coverageDirectory: 'coverage',

  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // 测试设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 模块文件扩展名
  moduleFileExtensions: ['js', 'json'],

  // 转换配置
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // 忽略转换的模块
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],

  // 测试超时时间
  testTimeout: 10000,

  // 详细输出
  verbose: true,

  // 清理模拟
  clearMocks: true,

  // 重置模拟
  resetMocks: true,

  // 恢复模拟
  restoreMocks: true,

  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@components/(.*)$': '<rootDir>/components/$1'
  },

  // 全局变量
  globals: {
    'process.env.NODE_ENV': 'test'
  }
};
