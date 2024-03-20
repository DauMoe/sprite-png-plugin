const spritesheet = require("spritesheet-js");

const _PACKAGE_NAME = "SpritePNG_Plugin";

/**
 * @NOTE
 *  - Compiler docs: https://webpack.js.org/api/compiler-hooks
 *  - Compilation docs: https://webpack.js.org/api/compilation-hooks/
 */

module.exports = class SpritePNG_Plugin {
  constructor(options = {}) {
    this.relativePaths        = options.relativePaths; // list relative png paths that will be combine into sprite
    this.outputDir            = options.outputDir;
    // this.manifestFileName     = this.getManifestFileName(options.manifestFileName);
    this.spriteSheetName      = options.spriteSheetName;
    // this.relativeManifestPath = path.join(this.outputDir, this.manifestFileName);
    // this.relativeSpritePath   = path.join(this.outputDir, this.spriteFileName);
  }

  isPng = (filePath) => filePath?.endsWith('.png');

  apply(compiler) {
    compiler.hooks.thisCompilation.tap({ name: _PACKAGE_NAME }, (compilation) => {
      // Start creating SVG sprite sheet after all assets are move to chunk
      compilation.hooks.processAssets.tap(
        {
          name: _PACKAGE_NAME,
          stage: "PROCESS_ASSETS_STAGE_OPTIMIZE"
        },
        (assets) => {
          /**
           * @NOTE
           *  - EXEC get from "node:child-process" instead of "platform-command"
           */

          /**
           * @todo
           *  - [ ] Get relative path from assets or chunks instead of pass as prop
           *  - [ ] How can I import sprite and json into js file if they are emitted to asset in webpack hooks?
           */

          // Lib option: https://github.com/krzysztof-o/spritesheet.js/blob/master/index.js#L166
          spritesheet(this.relativePaths.filter(this.isPng), {
            format: "json",
            path: this.outputDir,
            name: this.spriteSheetName
          }, err => {
            if (err) throw err;
            console.log("________ GENERATED _________");
          });
        }
      )
    })
  }
}