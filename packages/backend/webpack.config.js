const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    bundle: path.join(__dirname, 'src/index.ts')
  },
  output: {
    filename: 'index.js',
    path: process.env.BUNDLE_JS_DIR ? path.resolve(process.env.BUNDLE_JS_DIR) : path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd'
  },
  node: {
    __filename: true,
    __dirname: true
  },
  target: 'node',
  externals: [nodeExternals()],
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          }
        },
      }
    ]
  },
  plugins: [
    // do include the project's `package.json` in the bundle
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'package.json'),
          to: 'package.json'
        }
      ]
    })
  ],
  optimization: {
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  }
};
