// webpack.config.js
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  devtool: 'source-map',
  mode: process.env.NODE_ENV || 'production',
  externals: [
    nodeExternals(),
    nodeExternals({
      modulesFromFile: true,
    }),
  ],
};
