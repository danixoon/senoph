const path = require("path");
const { version } = require("./package.json");
const DefinePlugin = require("webpack").DefinePlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
// const packageJson =

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
          "css-loader",
          {
            loader: "stylus-loader",
            options: {
              stylusOptions: {
                define: [["$darkTheme", isProduction]],
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
    minimize: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "ИС учета средств связи",
      template: path.resolve(__dirname, "public/index.pug"),
      version,
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
      // attributes: { id: "theme" },
    }),
    // new DefinePlugin({
    //   __version__: version,
    // }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, "build"),
    compress: true,
    port: 3000,
    writeToDisk: true,
    historyApiFallback: true,
    open: true,
    stats: "errors-only",
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
  module.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: "server",
      generateStatsFile: true,
      statsOptions: { source: false },
    })
  );

module.exports = config;
