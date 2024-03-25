/**
 * @PACKAGE_INFO
 * An webpack plugin that helps to create sprite image
 * and generate manifest.json file contains coordinate 
 * of each image in sprite
 */

const Spritesmith = require("spritesmith");
const Vinyl = require("vinyl");
const path = require("path");
const VirtualModulesPlugin = require('webpack-virtual-modules');

const _PACKAGE_NAME = "SpritePNG_Plugin";

/**
 * @_DEV_REFERENCE
 *  - Compiler docs: https://webpack.js.org/api/compiler-hooks
 *  - Compilation docs: https://webpack.js.org/api/compilation-hooks/
 *  - SpriteSmith: https://github.com/twolfson/spritesmith
 *  - Refer: https://github.com/naver/image-sprite-webpack-plugin
 *  - Usage webpack-virtual-modules: https://github.com/sysgears/webpack-virtual-modules/blob/master/examples/swagger-webpack4/webpack.config.js
 */

const defaultOptions = {
  outputPath: undefined,
  includes: undefined,
  manifestFileName: "manifest.json"
}

module.exports = class SpritePNG_Plugin {
  constructor(option = defaultOptions) {
    this._outputPath = option.outputPath;
    this._includes = option.includes; // Reg and Reg Array are allowed
    this._manifestPath = this.#getManifestPath(option.manifestFileName);
    this._outputDir = null;
    this._publicPath = null;
    this._coordinateMeta = null;
    this._coordinateRelativePath = null;
  }

  #getManifestPath(manifestPath) {
    if (!manifestPath) return "./manifest.json";
    if (!this.#isJSON(manifestPath)) return manifestPath += ".json";
    return manifestPath;
  }

  #isJSON = (filePath) => filePath?.endsWith(".json");

  #isPng = (filePath) => filePath?.endsWith(".png");

  #createSpriteSheet(imagesData, callback) {
    Spritesmith.run({
      src: imagesData
    }, (err, result) => {
      if (err) throw err;
      callback(result)
    })
  }

  #inWhiteList(compilation, filePath) {
    const sourceFileName = this.#getSourceFileName(compilation, filePath);
    if (!sourceFileName) return false;
    if (!this._includes) return true;
    const isRegExp = this._includes instanceof RegExp;
    const isArr = Array.isArray(this._includes);
    
    if (!(isRegExp || isArr)) throw Error(`"includes" can be "RegExp" or "RegExp Array" only but received "${typeof this._includes}"`);
    
    if (isRegExp) return this._includes.test(sourceFileName);
    if (isArr) {
      for (let idx = 0; idx < this._includes.length; idx++) {
        const it = this._includes[idx];
        if (!(it instanceof RegExp)) throw Error(`Item at ${idx} must be "RegExp" but received "${typeof it}"`);
        if (it.test(sourceFileName)) return true;
      }
    }
    return false;
  }

  #getSourceFileName(compilation, assetPath) {
    return compilation.assetsInfo.get(assetPath)?.sourceFilename;
  }

  apply(compiler) {
    // Create virtual manifest file in memory (maybe?)
    const virtualModules = new VirtualModulesPlugin({
      [this._manifestPath]: "{}"
    });

    virtualModules.apply(compiler);

    compiler.hooks.thisCompilation.tap({ name: _PACKAGE_NAME }, (compilation) => {
      const RawSource = compilation.compiler.webpack.sources.RawSource

      this._outputDir = this._outputPath
          ? path.resolve(process.cwd(), this._outputPath)
          : compiler.outputPath;
      
      this._publicPath = compilation.outputOptions.publicPath;

      // Use "tapAsync" instead of "tap" because create sprite is async function
      compilation.hooks.processAssets.tapAsync(
        {
          name: _PACKAGE_NAME,
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        (assets, callback) => {
          const imagesPath = Object.keys(assets).filter(filePath => this.#inWhiteList(compilation, filePath) && this.#isPng(filePath));

          // Create image File Buffer
          const imagesData = imagesPath.map(assetPath => new Vinyl({
            path: path.join(this._outputDir, assetPath),
            contents: assets[assetPath].source()
          }));

          if (imagesPath.length > 0) {
            // Create sprite
            this.#createSpriteSheet(imagesData, ({ coordinates, properties, image }) => {
              const spriteSource = new RawSource(image);

              imagesPath.forEach(imgPath => {
                  compilation.updateAsset(imgPath, spriteSource);
              });

              //Generate coordinate mapping
              let coordinateMeta = {};
              coordinateMeta["width"] = properties.width;
              coordinateMeta["height"] = properties.height;
              coordinateMeta["frames"] = {};
              Object.keys(coordinates).map(relativePath => {
                coordinateMeta["frames"][path.basename(relativePath)] = coordinates[relativePath];
              });
              virtualModules.writeModule(this._manifestPath, JSON.stringify(coordinateMeta));
              callback();
            });
          } else {
            callback();
          }
        }
      );
    })
  }
}