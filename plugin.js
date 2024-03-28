/**
 * @PACKAGE_INFO
 * An webpack plugin that helps to create sprite image
 * and generate manifest.json file contains coordinate 
 * of each image in sprite
 */

const Spritesmith = require("spritesmith");
const path = require("path");
const { existsSync, lstatSync, writeFile: fsWriteFile, writeFileSync: fsWriteFileSync } = require("fs");
const { Gaze } = require("gaze");
const util = require("util");

const writeFile = util.promisify(fsWriteFile)
const writeFileSync = util.promisify(fsWriteFileSync)

const _PACKAGE_NAME = "SpritePNG_Plugin";

/**
 * @_DEV_REFERENCE
 *  - Compiler docs: https://webpack.js.org/api/compiler-hooks
 *  - Compilation docs: https://webpack.js.org/api/compilation-hooks/
 *  - https://github.com/twolfson/spritesmith
 *  - Refer: https://github.com/DauMoe/image-sprite-webpack-plugin
 *  - Use webpack-virtual-modules: https://github.com/sysgears/webpack-virtual-modules/blob/master/examples/swagger-webpack4/webpack.config.js
 */

/**
 * @TODO 
 *  - [ ] Generate mapping file or hint file, anything like that: image (virtual), json (fs - ignore), getIcon (fs-ignore)
 *  - [ ] Check if plugin working on production
 */

module.exports = class SpritePNG_Plugin {
  #cwd
  #spriteImagePath
  #manifestPath
  #getIconPath
  #gazeIns

  /**
   * @OPTION
   *  - outputDir: sprite data output directory 
   *  - entry: plugin will collect and watch all file in there
   *  - excludes: incoming
   */

  constructor(option) {
    if (this.#gazeIns) this.#gazeIns.close();
    this.#cwd             = process.cwd();
    this._outputDir       = this.#getOutputDir(option.outputDir);
    this._excludes        = option.excludes; // Reg and Reg Array are allowed
    this._entryPath       = this.#getEntry(option.entry);
    this.#spriteImagePath = path.join(this._outputDir, "sprite.png");
    this.#manifestPath    = path.join(this._outputDir, "manifest.json");
    this.#getIconPath     = path.join(this._outputDir, "getIcon.js");
    this.#gazeIns         = new Gaze(option.entry, { cwd: this.#cwd, mode: "watch", debounceDelay: 400 });
  }

  #getIconTemplate() {
    return `
      import manifest from './manifest.json';
      import sprite from './sprite.png';
      export const getIcon = (iconName) => {
          const iconDimensions = manifest[iconName];
          return {
              url: sprite,
              ...iconDimensions
          };
      };
    `;
  }

  #getOutputDir(outputDir = "./") {
    const _outputDir = path.join(this.#cwd, outputDir);
    if (!existsSync(_outputDir)) throw Error(`"${outputDir}" doesn\'t exists`);
    if (!lstatSync(_outputDir).isDirectory()) throw Error(`"${outputDir}" is not directory`);
    return _outputDir;
  }

  #getEntry(entry) {
    if (!entry) return [];
    if (!Array.isArray(entry)) entry = [entry];
    return entry;
  }

  #createSpriteSheet(imagesData, callback) {
    Spritesmith.run({
      src: imagesData
    }, (err, result) => {
      if (err) throw err;
      callback(result);
    });
  }

  #notExcludes(filePath) {
    if (!this._excludes) return true;
    const isRegExp = this._excludes instanceof RegExp;
    const isArr = Array.isArray(this._excludes);

    if (!(isRegExp || isArr)) throw Error(`"excludes" can be "RegExp" or "RegExp Array" only but received "${typeof this._excludes}"`);

    const posixPath = this.#convert2Posix(filePath);
    
    if (isRegExp) return this._excludes.test(posixPath);
    if (isArr) {
      for (let idx = 0; idx < this._excludes.length; idx++) {
        const it = this._excludes[idx];
        if (!(it instanceof RegExp)) throw Error(`Item at ${idx} must be "RegExp" but received "${typeof it}"`);
        if (it.test(posixPath)) return true;
      }
    }
    return false;
  }

  #getSpriteName(relativePath) {
    const name = relativePath.split(`\\`).splice(-1)[0].split(".").splice(0)[0];
    return name;
  }

  #convert2Posix(v) {
    return v ? v.split(path.sep).join(path.posix.sep) : ''
  }

  #spriteProcess(watcher = this.#gazeIns) {
    if (!watcher) throw Error('Watcher is not initialed');
      const sourceImagesByFolder = watcher.watched();
      const allSourceImages = Object.values(sourceImagesByFolder).reduce((allFiles, files) => [...allFiles, ...files], []);
      if (allSourceImages?.length > 0) {
        const spriteNames = allSourceImages.reduce((allSources, sourceImage) => {
          const spriteName = this.#getSpriteName(sourceImage);
          allSources[spriteName] = sourceImage;
          return allSources;
        }, {});
  
        this.#createSpriteSheet(Object.values(spriteNames), ({ coordinates, properties, image }) => {
          for (let i in spriteNames) {
            spriteNames[i] = coordinates[spriteNames[i]];
          }
          Promise.all([
            writeFile(this.#manifestPath, JSON.stringify(spriteNames), "utf8"),
            writeFile(this.#spriteImagePath, image, "binary")
          ]).then(r => {
            writeFile(this.#getIconPath, this.#getIconTemplate());
          })
        });
      };
  }

  #pathEqual(path1, path2) {
    return path.relative(path1, path2) == '';
  }

  #isPng(filePath) {
    return filePath?.endsWith(".png")
  }

  apply(compiler) {
    const spriteProcess   = this.#spriteProcess.bind(this);
    const pathEqual       = this.#pathEqual.bind(this);
    const spriteImagePath = this.#spriteImagePath;
    const manifestPath    = this.#manifestPath;
    const isPng           = this.#isPng.bind(this);

    this.#gazeIns.on("ready", spriteProcess)

    this.#gazeIns.on("all", function(event, filePath) {
      if (event !== "renamed" && !pathEqual(filePath, spriteImagePath) && !pathEqual(filePath, manifestPath) && isPng(filePath)) {
        spriteProcess()
      }
    });
  }
}