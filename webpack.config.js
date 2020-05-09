const path = require('path');
const webpack = require('webpack');

module.exports = function(env, argv) {
  return {
  mode: 'development',
  devtool: 'source-map',

  node: {
    fs: "empty"
  }, 
  plugins : [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
    })
    //new webpack.EnvironmentPlugin({
    //  ...process.env
    //})
  ],
  entry: {
    polyfill: 'babel-polyfill',
    app: './client/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
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
        },
        {
          loader: 'ts-loader'
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
