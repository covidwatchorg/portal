const path = require('path');
const webpack = require('webpack');
const DefinePlugin = require('webpack/lib/DefinePlugin');

module.exports = {
  entry: {
    polyfill: 'babel-polyfill',
    app: './client/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: 'dist/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: [{  
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  "targets": {
                    "node": "10"
                  }
                },
              ],
              '@babel/preset-react',
              {
                'plugins': ['@babel/plugin-proposal-class-properties']
              }
            ],
          },
        }],
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg$/,
        use: {
          loader: 'svg-url-loader',
          options: {
             limit: 10000,
          },
        },
      },
      {
          test: /\.png$/i,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
            },
         },
      }
    ],
  },
};
