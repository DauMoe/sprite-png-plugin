const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpritePNG = require("../index");

const subStylePaths = [];

const setupCacheGroups = () => {
    return subStylePaths.reduce((acc, cur) => {
        acc[cur.name] = {
            name: cur.name,
            test: (m, c, entry = cur.name) => {
                return m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry;
            },
            chunks: 'all',
            enforce: true
        };
        return acc;
    }, {});
};

const sourcePath = path.resolve(__dirname, 'src');
const isProd = false;

module.exports = {
    mode: isProd ? "production" : "development",
    entry: {
        bundle: ['@babel/polyfill', path.resolve(sourcePath, './index.js')],
    },
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: '/',
        filename: '[name].js',
        assetModuleFilename: `./assets/[name][ext]`,
    },
    optimization: {
        splitChunks: {
            cacheGroups: setupCacheGroups()
        },
    },
    module: {
        rules: [
            {
                test: /\.(?:js|mjs|cjs)$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: [
                        [
                            "@babel/preset-env",
                            {
                                targets: "defaults"
                            }
                        ]
                    ]
                }
            },
            {
                test: /\.png$/,
                type: 'asset/resource',
            }
        ]
    },
    stats: {
        errors: true,
        errorStack: true,
        errorDetails: true, // --display-error-details
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "index.html"
        }),
        new SpritePNG({
            entry: [ 'src/media/**/*.png', 'src/another/**/*'],
            excludes: /.*\/src\/another\/test_gl\.png$/,
            outputDir: "./src/sprite"
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
    },
};