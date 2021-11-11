const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";

const config = {
  mode: isDevelopment ? "development" : "production",
  entry: path.resolve(__dirname, "src/index.tsx"),
  devtool: isDevelopment ? "inline-source-map" : undefined,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/i,
        use: "html-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.pug$/i,
        use: "pug-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.styl$/i,
        use: [
          MiniCssExtractPlugin.loader,
          // Creates `style` nodes from JS strings
          // "style-loader",
          // Translates CSS into CommonJS
          "css-loader",

          // Compiles Styl to CSS
          {
            loader: "stylus-loader",
            options: {
              stylusOptions: {
                define: [
                  ["$development", process.env.NODE_ENV === "development"],
                ],
              },
            },
          },

        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: ["@svgr/webpack", "file-loader"],
      },
      {
        test: /\.(ttf)$/i,
        use: ["file-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".mjs", ".js"],
    mainFields: ["browser", "main", "module"],
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build"),
    publicPath: "/content/",
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
    minimize: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Senoph",
      template: path.resolve(__dirname, "public/index.pug"),
    }),

    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ],
  devServer: {
    contentBase: path.resolve(__dirname, "build"),
    compress: true,
    port: 3000,
    writeToDisk: true,
    historyApiFallback: true,
    open: true,
    stats: 'errors-only',
    host: "0.0.0.0",
    disableHostCheck: true,
    public: require("child_process").execSync("gp url 3000").toString().trim(),
    proxy: {
      "/api": {
        target: "http://localhost:5000/",
      },
      "/upload": {
        target: "http://localhost:5000/",
      },
    },
  },
};


if (process.env.ANALIZE)
  module.plugins.push(new BundleAnalyzerPlugin({
    analyzerMode: 'server',
    generateStatsFile: true,
    statsOptions: { source: false }
  }));


module.exports = config;