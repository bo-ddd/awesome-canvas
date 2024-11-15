const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "awesome-canvas.js",
    path: path.resolve(__dirname, "dist"),
    library: {
        name: 'awesome-canvas',
        type: 'umd'
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  }
};
