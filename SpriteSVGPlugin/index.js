const fs = require('fs');
const path = require('path');
const SVGSpriter = require("svg-sprite");
const util = require("util");
const xml2js = require("xml2js");

const PACKAGE_NAME = "SpriteSVGPlugin";

/**
 * @NOTE
 *  - Compiler docs: https://webpack.js.org/api/compiler-hooks
 *  - Compilation docs: https://webpack.js.org/api/compilation-hooks/
 */

const isSVG = fileName => path.extname(path.basename(fileName)) === '.svg';
const delFolder = util.promisify(fs.unlink);

const getConfig = options => ({
  // dest: options.outputPath ?? path.join(__dirname, "test"),
  // // log: "debug"
  // mode: {
  //   css: {
  //     bust: false,
  //   }
  // }
})

const genCoordinateMap = (svgData) => {
  let { path: filePath, contents } = svgData;
  // contents = contents.replace("\ufeff", ""); //remove non-whitespace
  xml2js.parseString(contents, { trim: true }, (err, result) => {
    if (err) throw Error(err);
    console.log("DATA", result.svg.svg[0].path);
  })
}

module.exports = class SpriteSVGPlugin {
  constructor(options = {}) {
    // this.options = options;
    // this.includes = options.includes || [];
    // this.excludes = options.excludes || [];
    this.outputPath = options.outputPath ?? path.join(__dirname, "test")
    this.spriter = new SVGSpriter({
      // shape: {
      //   dest: this.outputPath
      // }
      dest: this.outputPath,
      mode: {
        view: {
          bust: false
        }
      }
    });
  }

  async genSprite(data) {
    if (Array.isArray(data)) {
      data.forEach(svgData => {
        const { id, data } = svgData;
        this.spriter.add(id, null, data);
      });

      try {
        const { result } = await this.spriter.compileAsync();
        for (const mode of Object.values(result)) {
          for (const resource of Object.values(mode)) {
            // console.log("RE", resource.contents.toString());
            genCoordinateMap(resource);
            // fs.mkdirSync(path.dirname(resource.path), { recursive: true });
            // fs.writeFileSync(resource.path, resource.contents);
          }
        }
      } catch (e) {
        throw Error(e);
      }
    }
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap({ name: PACKAGE_NAME }, (compilation) => {
      console.log("compiler");
      //   compilation.hooks.processAssets.tap(PACKAGE_NAME, (chunk) => {
      //     const assets = chunk.auxiliaryFiles;
      //     console.log("compilation",assets);
      //     return
      //     const SVG_Files = [];
      //     assets.forEach(fileName => {
      //       if (isSVG(fileName)) {  
      //         const asset = compilation.getAsset(fileName);
      //         const source = asset.source.source().toString('utf8');
      //         // console.log("HEREH", source);
      //         SVG_Files.push({
      //           id: fileName,
      //           stream: asset
      //         })
      //       }
      //     });
      //     this.genSprite(SVG_Files);
      //   })

      //Start creating SVG sprite sheet after all assets are move to chunk
      compilation.hooks.processAssets.tap(
        {
          name: PACKAGE_NAME,
          stage: "PROCESS_ASSETS_STAGE_OPTIMIZE_HASH"
        },
        (assets) => {
          const SVG_Files = [];
          Object.keys(assets).map(filePath => {
            if (isSVG(filePath)) {
              const asset = compilation.getAsset(filePath);
              const source = asset.source.source().toString('utf8');
              SVG_Files.push({
                id: filePath,
                data: source
              })
            }
          });
          // console.log("SVG_Files", SVG_Files);
          this.genSprite(SVG_Files);
        }
      )
    })
  }
}