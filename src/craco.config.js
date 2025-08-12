// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /spectroplot\/lib\/worker\.js$/,
        use: [{
          loader: 'worker-loader',
          options: {
            esModule: true,
            filename: 'js/spectroplot.[contenthash].worker.js',
          },
        }],
      });
      return webpackConfig;
    },
  },
};
