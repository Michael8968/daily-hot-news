module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '14'
        },
        modules: 'commonjs'
      }
    ]
  ],
  plugins: [],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            }
          }
        ]
      ]
    }
  }
};
