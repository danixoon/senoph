const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";

module.exports = {
  mode: isDevelopment ? "development" : "production",
  entry: path.resolve(__dirname, "src/index.tsx"),
  devtool: "inline-source-map",
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
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Styl to CSS
          "stylus-loader",
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
    publicPath: "/public/",
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Senoph",
      template: path.resolve(__dirname, "public/index.pug"),
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, "build"),
    compress: true,
    port: 3000,
    writeToDisk: true,
    historyApiFallback: true,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000/",
      },
    },
  },
};
