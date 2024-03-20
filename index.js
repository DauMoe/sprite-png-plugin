const fs = require('fs');
const path = require('path');
const { sources } = require("webpack");
const spritesheet = require("spritesheet-js");

const _PACKAGE_NAME = "SpritePNG_Plugin";

/**
 * @NOTE
 *  - Compiler docs: https://webpack.js.org/api/compiler-hooks
 *  - Compilation docs: https://webpack.js.org/api/compilation-hooks/
 */

module.exports = class SpritePNG_Plugin {
  constructor(options = {}) {
    // this.includes             = options.includes; // allow regex and array
    // this.excludes             = options.excludes; // allow regex and array
    this.outputDir            = options.outputDir;
    // this.manifestFileName     = this.getManifestFileName(options.manifestFileName);
    this.spriteFileName       = options.spriteFileName;
    // this.relativeManifestPath = path.join(this.outputDir, this.manifestFileName);
    // this.relativeSpritePath   = path.join(this.outputDir, this.spriteFileName);
  }


  apply(compiler) {
    compiler.hooks.thisCompilation.tap({ name: _PACKAGE_NAME }, (compilation) => {
      //Start creating SVG sprite sheet after all assets are move to chunk
      compilation.hooks.processAssets.tap(
        {
          name: _PACKAGE_NAME,
          stage: "PROCESS_ASSETS_STAGE_PRE_PROCESS"
        },
        (assets) => {
          // Lib option: https://github.com/krzysztof-o/spritesheet.js/blob/master/index.js#L166
          spritesheet(Object.keys(assets), {
            format: "json",
            path: this.outputDir,
            name: this.spriteFileName
          }, err => {
            if (err) throw err;
            console.log("________ GENERATED _________");
          });
        }
      )
    })
  }
}