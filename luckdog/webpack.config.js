const path = require('path');
const WebpackESBuildPlugin = require('@tencent/webpack-esbuild-plugin');

module.exports = {
  plugins: [new WebpackESBuildPlugin()],
  resolve: {
    extensions: ['.ts', 'd.ts', '.tsx', '.jsx', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src/'), // 以 @ 表示src目录
      '@test': path.resolve(__dirname, './test/'),
    },
  },
};
