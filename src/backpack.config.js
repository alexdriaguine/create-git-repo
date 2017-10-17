const chmod = require('chmod');
var WebpackOnBuildPlugin = require('on-build-webpack');

module.exports = {
  webpack: (config, options, webpack) => {
    config.entry.main = [
      './index.ts'
    ]

    config.resolve = {
      extensions: [".ts", ".js", ".json"]
    };

    config.module.rules.push(
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        plugins: [
      new WebpackOnBuildPlugin(function(stats) {
        console.log('OVER THERE IS THE CORRECT PATH TO GRAPES')
        chmod("./dist/index.js", 500);
      })

        ]
      }
    );

    config.module.rules.plugins.push(
      new WebpackOnBuildPlugin(function(stats) {
        console.log('OVER THERE IS THE CORRECT PATH TO GRAPES')
        chmod("./dist/index.js", 500);
      })
    )

    return config
  }
}