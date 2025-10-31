module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({
      preset: ['advanced', {
        discardComments: { removeAll: true },
        normalizeWhitespace: true,
        mergeLonghand: true,
        mergeRules: true,
        minifySelectors: true,
        reduceIdents: true,
        colormin: true,
        convertValues: true
      }]
    })
  ]
}