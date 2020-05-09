const path = require('path');
const webpack = require('webpack');
const DefinePlugin = require('webpack/lib/DefinePlugin');

const envKeys = Object.keys(process.env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(process.env[next]);
  return prev;
}, {});

module.exports = function(env, argv) {
  return {
  mode: 'development',
  devtool: 'source-map',

  node: {
    fs: "empty"
  }, 
  plugins : [
    new DefinePlugin(envKeys)
  ],
  entry: {
    polyfill: 'babel-polyfill',
    app: './client/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  devServer: {
    port: 8080,
    publicPath: '/dist',
    proxy: {
      '/api': 'http://localhost:3000',
    },
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: [{  
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react',
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
      }
    ],
  },
  };
};
