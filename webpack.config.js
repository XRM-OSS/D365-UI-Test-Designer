const path = require("path");

module.exports = {
    entry: {
        popup: "./src/popup/index.tsx",
        background: "./src/background/Background.ts",
        content: "./src/contentScripts/Content.ts",
        inject: "./src/contentScripts/Inject.ts"
    },
    output: {
        filename: "[name].js",
        path: __dirname + "/dist"
    },

    mode: "development",

    // Enable sourcemaps for debugging webpack's output.
    devtool: 'inline-source-map',

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: "ts-loader"
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    }
};