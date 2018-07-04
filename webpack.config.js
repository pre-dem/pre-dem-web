'use strict'
const webpack = require('webpack')
const packageJson = require('./package.json')

const version = packageJson.version

module.exports = {
  entry: {
    "pre-dem-web": ['./src/index.ts'],
},
  output: {
    filename: '[name]-v'+ version +'.js',
    path: __dirname + '/dist',
    libraryTarget: 'umd'
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      // All files with a '.ts' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.ts?$/, loader: 'awesome-typescript-loader' },

      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader'}

    ]
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false
      }
    }),
  ],
    devServer: {
    port: "9000",
    historyApiFallback: true,
},
}
