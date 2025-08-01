const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    util: require.resolve('util'),
    buffer: require.resolve('buffer'),
    process: require.resolve('process/browser'),
  };

  // Add MIME type handling for various file types
  config.module.rules.push({
    test: /\.(png|jpe?g|gif|svg|ico|webp)$/i,
    type: 'asset/resource',
  });

  config.module.rules.push({
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
  });

  config.module.rules.push({
    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i,
    type: 'asset/resource',
  });

  config.plugins.push(
    new (require('webpack').ProvidePlugin)({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
};
