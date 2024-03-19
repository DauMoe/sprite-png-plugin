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

/**
 * 
 * @TODO
 *  - Modifying output name (remove <mode>/prefix.<mode>)
 */

const isSVG = fileName => fileName?.endsWith(".svg");

const genCoordinateMap = (svgData, outputDir, manifestFileName = "manifest.json") => {
  let { contents } = svgData;
  xml2js.parseString(contents, (err, result) => {
    if (err) throw Error(err);
    if (!manifestFileName?.endsWith(".json")) manifestFileName += ".json";

    let coordData = {};
    const { $, view, svg } = result.svg;
    coordData["totalWidth"] = +$.width;
    coordData["totalHeight"] = +$.height;
    view.forEach((data, index) => {
      const svgInfo = svg[index].$;
      const { id, viewBox } = data.$;
      coordData[id] = {
        ...svgInfo,
        x: +svgInfo.x || 0,
        y: +svgInfo.y || 0,
        width: +svgInfo.width || 0,
        height: +svgInfo.height || 0,
      }
    });
    fs.writeFile(path.join(outputDir, manifestFileName), JSON.stringify(coordData), "utf-8", () => {});
  })
}

module.exports = class SpriteSVGPlugin {
  constructor(options = {}) {
    // this.options = options;
    // this.includes = options.includes || [];
    // this.excludes = options.excludes || [];
    this.outputPath = options.outputPath ?? path.join(__dirname, "test");
    this.manifestFileName = options.manifestFileName || undefined;
    this.spriter = new SVGSpriter({
      dest: this.outputPath,
      mode: {
        view: {
          bust: false,
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
            genCoordinateMap(resource, this.outputPath, this.manifestFileName);
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