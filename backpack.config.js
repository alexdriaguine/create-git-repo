module.exports = {
  webpack: (config, options, webpack) => {
    config.entry.main = ['./src/main.ts']

    config.resolve = {
      extensions: ['.ts', '.js', '.json'],
    }

    config.module.rules.push({
      test: /\.ts$/,
      loader: 'awesome-typescript-loader',
    })

    config.plugins.push(new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }))

    return config
  },
}
