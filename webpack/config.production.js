var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var DirectoryNamedWebpackPlugin = require("directory-named-webpack-plugin");

module.exports = {
  entry: [
    'babel-polyfill',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'bundle-[hash].js',
    publicPath: '/'
  },
  plugins: [
    new webpack.ResolverPlugin(new DirectoryNamedWebpackPlugin()),
    new CopyWebpackPlugin([
      { from: 'src/public' }
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.UglifyJsPlugin({minimize: true}),
    // this one replaces the bundle.js with the hashed version for caching reasons
    function () {
      this.plugin("done", function (stats) {
        var replaceInFile = function (filePath, toReplace, replacement) {
          var replacer = function (match) {
            console.log('Replacing in %s: %s => %s', filePath, match, replacement);
            return replacement
          };
          var str = fs.readFileSync(filePath, 'utf8');
          var out = str.replace(new RegExp(toReplace, 'g'), replacer);
          fs.writeFileSync(filePath, out);
        };

        var hash = stats.hash; // Build's hash, found in `stats` since build lifecycle is done.

        replaceInFile(path.join(__dirname, '../dist', 'index.html'),
          'bundle.js',
          'bundle-' + hash + '.js'
        );
      });
    }
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: path.resolve('./src/'),
    modulesDirectories: ['node_modules'],
    alias: {
      sortobject: path.join(__dirname, '..', 'node_modules', 'sortobject', 'es2015', 'index.js')
    }
  },
  module: {
    loaders: [
      {
        test: /(\.js|\.jsx)$/,
        loaders: ['babel'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]"
      },
      {
        test: /\.sass$/,
        loaders: [
          'style',
          'css?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
          'sass?indentedSyntax&outputStyle=expanded&sourceMapContents=true'
        ]
      },
      {
        test: /\.png$|\.gif$/,
        loader: "url-loader?limit=100000"
      },
      {
        test: /\.jpe?g$/,
        loader: "file-loader"
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader"
      }
    ]
  }
};
