const projectConfig = require("../webpack.config");

module.exports = {
  stories: ["../src/components/**/*.stories.tsx"],
  webpackFinal: (config) => {
    const result = {
      ...config,
      module: {
        ...config.module,
        rules: projectConfig.module.rules,
      },
    };

    config.resolve.extensions.push(...projectConfig.resolve.extensions);
    config.resolve.plugins.push(...projectConfig.resolve.plugins);

    return result;
  },
};
