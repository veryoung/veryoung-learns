module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    ['@babel/preset-typescript'],
    ['@babel/preset-react'],
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['babel-plugin-webpack-alias-7', { config: './webpack.config.js' }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
  ],
};
