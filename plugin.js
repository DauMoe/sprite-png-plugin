/**
 * @PACKAGE_INFO
 * An webpack plugin that helps to create sprite image
 * and generate manifest.json file contains coordinate 
 * of each image in sprite
 */

const Spritesmith = require("spritesmith");
// const Vinyl = require("vinyl");
const path = require("path");
// const VirtualModulesPlugin = require('webpack-virtual-modules');
const { existsSync, lstatSync } = require("fs");
const gaze = require("gaze");
const fs = require('fs');

const _PACKAGE_NAME = "SpritePNG_Plugin";

/**
 * @_DEV_REFERENCE
 *  - Compiler docs: https://webpack.js.org/api/compiler-hooks
 *  - Compilation docs: https://webpack.js.org/api/compilation-hooks/
 *  - https://github.com/twolfson/spritesmith
 *  - Refer: https://github.com/DauMoe/image-sprite-webpack-plugin
 *  - Use webpack-virtual-modules: https://github.com/sysgears/webpack-virtual-modules/blob/master/examples/swagger-webpack4/webpack.config.js
 */

const defaultOptions = {
  outputPath: undefined,
  includes: undefined,
  manifestFileName: "manifest.json"
};

module.exports = class SpritePNG_Plugin {
  constructor(option = defaultOptions) {
    this._entryPath = option.entry;
    this._outputPath = option.outputPath;
    this._includes = option.includes; // Reg and Reg Array are allowed
    this._manifestPath = this.#getManifestPath(option.manifestFileName);
    this._outputDir = null;
    this._publicPath = null;
    this._coordinateMeta = null;
    this._coordinateRelativePath = null;
  }

  #getManifestPath(manifestPath) {
    // Not defined
    if (!manifestPath) return "./manifest.json";

    //Checking if it's dir path, adding manifest file name
    if (existsSync(manifestPath)) {
      if (lstatSync(manifestPath).isDirectory()) manifestPath = path.join(manifestPath, "manifest.json");
    }
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
      callback(result);
    });
  }

  #inWhiteList(filePath) {
    if (!this._includes) return true;
    const isRegExp = this._includes instanceof RegExp;
    const isArr = Array.isArray(this._includes);

    if (!(isRegExp || isArr)) throw Error(`"includes" can be "RegExp" or "RegExp Array" only but received "${typeof this._includes}"`);

    const posixPath = filePath.split(path.sep).join(path.posix.sep);
    if (isRegExp) return this._includes.test(posixPath);
    if (isArr) {
      for (let idx = 0; idx < this._includes.length; idx++) {
        const it = this._includes[idx];
        if (!(it instanceof RegExp)) throw Error(`Item at ${idx} must be "RegExp" but received "${typeof it}"`);
        if (it.test(posixPath)) return true;
      }
    }
    return false;
  }

  getWatcher(cb) {
    if (this._watcher) {
      cb && cb(undefined, this._watcher);
    } else {
      this._watcher = gaze(
        this._entryPath, {},
        (err, watcher) => {
          watcher.on('end', () => {
            this._watcher = null;
          });
          cb && cb(err, watcher);
        }
      );
    }
    return this._watcher;
  }

  getSpriteName(relativePath) {
    const name = relativePath.split(`\\`).splice(-1)[0].split(".").splice(0)[0];
    return name;
  }

  writeFileR = async (...args) => {
    const fileName = args[0];
    await promiseCall(mkdirp, path.dirname(fileName));
    return fs.writeFile(...args);
  };

  apply(compiler) {
    // Create virtual manifest file in memory (maybe?)
    // const virtualModules = new VirtualModulesPlugin({
    //   [this._manifestPath]: "{}"
    // });

    // virtualModules.apply(compiler);
    // this._hook(compiler, 'run', 'run',
    //   (compiler, cb) => {
    //     this.compile(() => {
    //       // without closing the gaze instance, the build will never finish
    //       this.getWatcher().close();
    //       cb();
    //     });
    //   }
    // );

    compiler.hooks.thisCompilation.tap({ name: _PACKAGE_NAME }, (compilation) => {
      const RawSource = compilation.compiler.webpack.sources.RawSource;

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
        (_, callback) => {
          const sourceImagesByFolder = this.getWatcher().watched();
          const allSourceImages = Object.values(sourceImagesByFolder).reduce((allFiles, files) => [...allFiles, ...files], []);
          if (!allSourceImages || !allSourceImages.length) {
            callback();
          } else {
            const spriteNames = allSourceImages.reduce((allSources, sourceImage) => {
              const spriteName = this.getSpriteName(sourceImage);
              allSources[spriteName] = sourceImage;
              return allSources;
            }, {});

            this.#createSpriteSheet(Object.values(spriteNames), ({ coordinates, properties, image }) => {
              for (let i in spriteNames) {
                spriteNames[i] = coordinates[spriteNames[i]];
              }
              fs.writeFileSync("src/sprite-sheet/manifest.json", JSON.stringify(spriteNames), "utf8");
              fs.writeFileSync("src/sprite-sheet/gen.png", image, "binary");
              callback();
              this.getWatcher().close();
            });
          }


          // const imageModules = compilation.modules.filter(module => this.#inWhiteList(module?.resourceResolveData?.relativePath) && this.#isPng(module?.resourceResolveData?.relativePath));
          // const imagesAbsPath = imageModules.map(module => module?.resource);
          // console.log("?imageModules", imagesAbsPath);
          // if (imagesAbsPath.length > 0) {
          //   // Create sprite
          //   this.#createSpriteSheet(imagesAbsPath, ({ coordinates, properties, image }) => {
          //     /**
          //      * @TODO 
          //      *  - [ ] Create sprite image using webpack-virtual-modules
          //      *  - [ ] Update sprite image
          //      *  - [ ] Import sprite into code base without error
          //      */
          //     console.log("?coordinates", coordinates);
          //     //Generate coordinate mapping
          //     let coordinateMeta = {};
          //     coordinateMeta["width"] = properties.width;
          //     coordinateMeta["height"] = properties.height;
          //     coordinateMeta["frames"] = {};
          //     Object.keys(coordinates).map(relativePath => {
          //       coordinateMeta["frames"][path.basename(relativePath)] = coordinates[relativePath];
          //     });
          //     virtualModules.writeModule(this._manifestPath, JSON.stringify(coordinateMeta));
          //     callback();
          //   });
          // } else {
          //   callback();
          // }
        }
      );
    });
  }

};