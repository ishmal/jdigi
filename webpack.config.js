var webpack = require('webpack');
var path = require('path');

var CompressionPlugin = require('compression-webpack-plugin');

/*eslint no-process-env:0, camelcase:0*/
var isProduction = (process.env.NODE_ENV || 'development') === 'production';

var src = './src';
//var absSrc = path.join(__dirname, src);
var dest = '/build';
var absDest = path.join(__dirname, dest);

var config = {
  // isProduction ? 'source-map' : 'evale',
  devtool: 'source-map',

  debug: true,
  cache: true,
  context: __dirname,

  resolve: {
    root: __dirname,
    extensions: ['', '.ts', '.js', '.json'],
    alias: {}
  },

  entry: {
    app: [ src+'/components/app/app' ],
    vendor: [ src+'/vendor.ts' ]
  },

  output: {
    path: absDest,
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    chunkFilename: '[id].chunk.js'
  },

  // our Development Server configs
  devServer: {
    inline: true,
    colors: true,
    historyApiFallback: true,
    contentBase: src,
    publicPath: dest
  },
  module: {
    loaders: [
      // Support for *.json files.
      {test: /\.json$/, loader: 'json'},

      // Support for CSS as raw text
      {test: /\.css$/, loader: 'raw'},

      // support for .html as raw text
      {test: /\.html$/, loader: 'raw'},

      // Support for .ts files
      {
        test: /\.ts$/,
        loader: 'ts',
        exclude: [
          /\.min\.js$/,
          /\.spec\.ts$/,
          /\.e2e\.ts$/
        ]
      }

    ],
    noParse: [
      /rtts_assert\/src\/rtts_assert/ ,
      /angular2\/bundles\/.+/
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.bundle.js'
    }),
    new webpack.optimize.DedupePlugin({
      __isProduction: isProduction
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin()
  ],
  pushPlugins: function () {
    if (!isProduction) {
      return;
    }

    this.plugins.push.apply(this.plugins, [
       //production only
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          drop_debugger: false
        },
        output: {
          comments: false
        },
        beautify: false
      }),
      new CompressionPlugin({
        asset: '{file}.gz',
        algorithm: 'gzip',
        regExp: /\.js$|\.html|\.css|.map$/,
        threshold: 10240,
        minRatio: 0.8
      })
    ]);
  },

  stats: {colors: true, reasons: true}
};

config.pushPlugins();

module.exports = config;
