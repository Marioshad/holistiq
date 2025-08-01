// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for deepmerge dependency issue
if (config.resolver && config.resolver.alias) {
  config.resolver.alias.deepmerge = require.resolve('deepmerge');
} else if (config.resolver) {
  config.resolver.alias = { deepmerge: require.resolve('deepmerge') };
} else {
  config.resolver = { alias: { deepmerge: require.resolve('deepmerge') } };
}

module.exports = config;
