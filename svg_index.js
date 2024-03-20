const fs = require('fs');
const path = require('path');
const SVGSpriter = require("svg-sprite");
const xml2js = require("xml2js");
const { sources } = require("webpack");

const PACKAGE_NAME = "SpriteSVGPlugin";

/**
 * @NOTE
 *  - Compiler docs: https://webpack.js.org/api/compiler-hooks
 *  - Compilation docs: https://webpack.js.org/api/compilation-hooks/
 */

module.exports = class SpriteSVGPlugin {
  constructor(options = {}) {
    // this.options = options;
    this.includes             = options.includes; // allow regex and array
    this.excludes             = options.excludes; // allow regex and array
    this.outputDir            = this.getOutputDir(options.outputDir);
    this.manifestFileName     = this.getManifestFileName(options.manifestFileName);
    this.spriteFileName       = this.getSpriteFileName(options.spriteFileName);
    this.relativeManifestPath = path.join(this.outputDir, this.manifestFileName);
    this.relativeSpritePath   = path.join(this.outputDir, this.spriteFileName);
    this.spriter              = new SVGSpriter(this.getConfig(options));
  }

  isSVG = fileName => fileName?.endsWith(".svg");

  getConfig(options) {
    return {
      dest: this.outputDir,
      mode: {
        view: {
          bust: false,
        }
      }
    }
  }

  genCoordinateMap(compilation, svgData, outputDir, manifestFileName) {
    let { contents } = svgData;
    xml2js.parseString(contents, (err, result) => {
      if (err) throw Error(err);
  
      let coordData = {};
      const { $, view, svg } = result.svg;
      coordData["totalWidth"] = +$.width;
      coordData["totalHeight"] = +$.height;
      if (Array.isArray(view) && Array.isArray(svg)) {
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
      }
      compilation.updateAsset(
        this.relativeManifestPath,
        new sources.RawSource(JSON.stringify(coordData))
      )
      // fs.writeFile(path.join(outputDir, manifestFileName), JSON.stringify(coordData), "utf-8", () => {});
    })
  }

  getOutputDir(output) {
    return output ?? path.join(__dirname, "sprite_sheet");
  }

  getSpriteFileName(fileName) {
    if (!fileName) fileName = "sprite.svg";
    if (!fileName?.endsWith(".svg")) fileName += ".svg";
    return fileName;
  }

  getManifestFileName(fileName) {
    if (!fileName) fileName = "manifest.json";
    if (!fileName?.endsWith(".json")) fileName += ".json";
    return fileName;
  }

  _inInclude(filePath) {
    if (!this.includes) return true;
    const isReg = this.includes instanceof RegExp;
    const isArr = Array.isArray(this.includes);
    if (!(isReg || isArr)) throw Error(`"includes" prop accepts RegExp or Array only but receive "${typeof this.includes}"`);
    if (isReg) return this.includes.test(filePath);
    if (isArr) return this.includes.includes(filePath);
  }

  _notInExclude(filePath) {
    if (!this.excludes) return true;
    const isReg = this.excludes instanceof RegExp;
    const isArr = Array.isArray(this.excludes);
    if (!(isReg || isArr)) throw Error(`"excludes" prop accepts RegExp or Array only but receive "${typeof this.excludes}"`);
    if (isReg) return !this.excludes.test(filePath);
    if (isArr) return !this.excludes.includes(filePath);
  }

  isIncluded(filePath) {
    return this._inInclude(filePath) && this._notInExclude(filePath)
  }

  async genSpriteSheet(compilation, data) {
    if (Array.isArray(data)) {
      data.forEach(svgData => {
        const { id, data } = svgData;
        this.spriter.add(id, null, data);
      });

      try {
        const { result } = await this.spriter.compileAsync();
        for (const mode of Object.values(result)) {
          for (const resource of Object.values(mode)) {
            this.genCoordinateMap(compilation, resource, this.outputDir, this.manifestFileName);
            // if (!fs.existsSync(this.relativeSpritePath)) fs.mkdirSync(path.dirname(this.relativeSpritePath), { recursive: true });
            // fs.writeFileSync(this.relativeSpritePath, resource.contents);
          }
        }
      } catch (e) {
        throw Error(e);
      }
    }
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap({ name: PACKAGE_NAME }, (compilation) => {
      // compilation.emitAsset(this.manifestFileName, new sources.RawSource("temp"));
      if(!fs.existsSync(this.relativeManifestPath)) fs.mkdirSync(this.relativeManifestPath, { recursive: true });

      //Start creating SVG sprite sheet after all assets are move to chunk
      compilation.hooks.processAssets.tap(
        {
          name: PACKAGE_NAME,
          stage: "PROCESS_ASSETS_STAGE_PRE_PROCESS"
        },
        (assets) => {
          const SVG_Files = [];
          Object.keys(assets).map(filePath => {
            if (this.isSVG(filePath) && this.isIncluded(filePath)) {
              const asset = compilation.getAsset(filePath);
              const source = asset.source.source().toString('utf8');
              SVG_Files.push({
                id: filePath,
                data: source
              })
            }
          });
          this.genSpriteSheet(compilation, SVG_Files);
        }
      )
    })
  }
}