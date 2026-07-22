const webpack = require('webpack');
module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify"),
    "url": require.resolve("url")
  })
  config.resolve.fallback = fallback;

  // Suppress source-map-loader warnings from node_modules
  config.ignoreWarnings = [
    function ignoreSourceMapWarnings(warning) {
      return (
        warning.module &&
        warning.module.resource &&
        warning.module.resource.includes('node_modules') &&
        (warning.details?.includes('source map') ||
         warning.message?.includes('source map') ||
         warning.message?.includes('ENOENT'))
      );
    },
  ];

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ])
  return config;
}
