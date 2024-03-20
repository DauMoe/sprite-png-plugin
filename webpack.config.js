const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpriteSVGPlugin = require("./SpriteSVGPlugin");

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
    // optimization: {
    //     splitChunks: {
    //         cacheGroups: setupCacheGroups()
    //     },
    // },
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
                test: /\.svg$/,
                type: 'asset/resource',
                use: [
                    {
                        loader: "file-replace-loader",
                        options: {
                            condition: 'if-replacement-exists',
                            replacement(g) {
                                if (g) {
                                    return path.join(__dirname, "src/assets/sprite/test.svg")
                                }
                                return g
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "new-index.html",
            template: "index.html"
        }),
        new SpriteSVGPlugin({
            outputDir: path.join(__dirname, "abcxyz"),
            manifestFileName: "test.json",
            spriteFileName: "Ahihi",
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

