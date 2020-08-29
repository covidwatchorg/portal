// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: 3,
        useBuiltIns: 'usage',
        targets: process.env.NODE_ENV == 'test' ? { node: 'current' } : 'defaults',
      },
    ],
    '@babel/preset-react',
    {
      plugins: ['@babel/plugin-proposal-class-properties'],
    },
  ],
}
