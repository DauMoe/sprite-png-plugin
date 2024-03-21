const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpritePNG_Plugin = require("../index");

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

const sourcePath = path.resolve(__dirname, 'src')
const isProd = false;
const spriteDir = path.join(sourcePath, "media", "sprite");
const spriteSheetName = "ahh";

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
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.png$/,
                type: 'asset/resource',
                // use: [
                    // }
                    // {
                    //     loader: "file-replace-loader",
                    //     options: {
                    //         condition: 'if-replacement-exists',
                    //         replacement(resourcePath) {
                    //             // Match sprite sheet regex
                    //             if (resourcePath) {
                    //                 // listPath.push(resourcePath);
                    //                 return path.join(spriteDir, `${spriteSheetName}.png`)
                    //             }
                    //             return resourcePath
                    //         }
                    //     }
                    // }
                // ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "new-index.html",
            template: "index.html"
        }),
        new SpritePNG_Plugin()
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
    },
};

