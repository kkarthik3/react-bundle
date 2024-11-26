const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.tsx", 
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "chatbot-widget.js",
    library: "ChatbotWidget",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    fallback: {
      process: require.resolve("process/browser.js"), // Ensure this resolves correctly
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser.js", // Provide process globally in the bundle
    }),
  ],
  devServer: {
    static: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
  },
};
