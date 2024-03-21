const Spritesmith = require("spritesmith");
const Vinyl = require("vinyl");
const { RawSource } = require("webpack-sources");
const path = require("path");

const _PACKAGE_NAME = "SpritePNG_Plugin";

/**
 * @NOTE
 *  - Compiler docs: https://webpack.js.org/api/compiler-hooks
 *  - Compilation docs: https://webpack.js.org/api/compilation-hooks/
 */

module.exports = class SpritePNG_Plugin {
  constructor(option = {}) {
    this.spriteSheetName      = option.spriteSheetName;
    this._outputPath = option.outputPath;
    this._outputDir = null;
    this._publicPath = null;
  }

  isPng = (filePath) => filePath?.endsWith('.png');

  createSpriteSheet(imagesData, callback) {
    Spritesmith.run({
      src: imagesData
    }, (err, result) => {
      if (err) throw err;
      callback(result)
    })
  }

  createMappingFile() {
    // if (!fs.existsSync(this.outputDir)) {
    //   fs.mkdirSync(this.outputDir);
    //   fs.writeFileSync(path.join(this.outputDir, `${this.spriteSheetName}.json`), "", { encoding: "utf-8" });
    // }
  }

  apply(compiler) {
    //Refer: https://github.com/DauMoe/image-sprite-webpack-plugin
    compiler.hooks.thisCompilation.tap({ name: _PACKAGE_NAME }, (compilation) => {

      this._outputDir = this._outputPath
          ? path.resolve(process.cwd(), this._outputPath)
          : compiler.outputPath;
      
      this._publicPath = compilation.outputOptions.publicPath;

      compilation.hooks.processAssets.tapAsync(
        {
          name: _PACKAGE_NAME,
          stage: "PROCESS_ASSETS_STAGE_ADDITIONAL"
        },
        (assets, callback) => {
          const imagesPath = Object.keys(assets).filter(this.isPng);
          const imagesData = imagesPath.map(assetPath => new Vinyl({
            path: path.join(this._outputDir, assetPath),
            contents: assets[assetPath].source()
          }));
          this.createSpriteSheet(imagesData, ({ coordinates, properties, image }) => {
            const spriteSource = new RawSource(image);
            // imagesPath.forEach(imagePath => compilation.updateAsset(imagePath, spriteSource));
            compilation.updateAsset(imagesPath[0], spriteSource);
            //Generate coordinate mapping
            let coordinateMeta = {};
            coordinateMeta["width"] = properties.width;
            coordinateMeta["height"] = properties.height;
            coordinateMeta["frames"] = {};
            Object.keys(coordinates).map(relativePath => {
              coordinateMeta["frames"][path.basename(relativePath)] = coordinates[relativePath];
            });
            console.log(compilation.getAssets());
            //Update Coordinate asset
            // compilation.emitAsset("test.json", JSON.stringify(coordinateMeta));
            callback();
          });
        }
      )
    })
  }
}