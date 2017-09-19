'use strict'

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
      "predem-web-sdk": './src/index.ts',
      // source: './src/source.ts',
    // transfer: './src/transfer.ts'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist',
    library: 'raven',
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
      new HtmlWebpackPlugin({
          webpackServerURL: 'http://localhost:8080/webpack-dev-server.js',
          template: './src/index.html',
          inject: 'body',
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()

  ],
    devServer: {
        port:8000,
        historyApiFallback: true,
        proxy: {
            '/v1/*': {
                target: 'http://localhost:8080'
            }
        },
    }
}
