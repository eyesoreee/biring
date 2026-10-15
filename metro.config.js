const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// PowerSync SDK does not work well with inline requires
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      inlineRequires: {
        blockList: {
          [require.resolve("@powersync/react-native")]: true,
        },
      },
    },
  }),
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
