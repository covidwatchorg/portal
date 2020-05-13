const path = require('path');

module.exports = {
  entry: {
    polyfill: 'babel-polyfill',
    app: './client/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: {
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
              '@babel/preset-react'
            ],
          },
        },
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
        },
      },
      {
          test: /\.png$/i,
          use: [
              {
                  loader: 'url-loader',
              },
          ],
      }
],
  },
};
