'use strict'
const webpack = require('webpack')
const packageJson = require('./package.json')
const version = packageJson.version

module.exports = {
  entry: {
      "pre-dem-web" : './src/index.ts',
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

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' }
    ]
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false
      }
    }),
  ],
}
