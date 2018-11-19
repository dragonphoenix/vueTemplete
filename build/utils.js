'use strict'
const path = require('path')
const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const packageConfig = require('../package.json')
const glob = require('glob')

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production' ?
    config.build.assetsSubDirectory :
    config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', {indentedSyntax: true}),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

exports.getEntry = function (globPath) {
  var entries = {}, baseName, tmp;

  if (typeof globPath !== 'object') {
    globPath = [globPath];
  }

  globPath.forEach((item, index) => {
    glob.sync(item).forEach(function (entry) {
      baseName = path.basename(entry, path.extname(entry));
      if (entry.split('/').length > 4) {
        tmp = entry.split('/').splice(-2);
        entries[tmp[0]] = entry;
      } else {
        entries[baseName] = entry;
      }
    });
  });

  return entries;
}

function getExcludeChunks(pages, curPath){
  var ret = [];

  for(var pathName in pages){
    if (pathName !== curPath){
      ret.push(pathName);
    }
  }

  return ret;
}

exports.plugins = function () {
  var pages = exports.getEntry(['./src/module/*.html', './src/module/**/*.html']);
  var plugins = [];

  for (var pathName in pages) {
    var excludeChunks = getExcludeChunks(pages, pathName);
    plugins.push(new HtmlWebpackPlugin({
      filename: pathName + '.html',
      template: pages[pathName],
      chunks:[pathName],
      //excludeChunks: excludeChunks,
      inject: true,
      chunksSortMode: 'dependency'
    }));
  }

  return plugins;
}
