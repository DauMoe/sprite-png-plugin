# Sprite PNG plugin
Webpack plugin helps to create PNG sprite image and coordinate mapping file (`manifest.json`)
## Usage:
- Make sure your assets in `png` format. You can use converter tool online. DO NOT change file extension name directly (I do it and got error `Invalid signature`)  
- The manifest path should be relative path from current webpack config container directory  
- Manifest file will be generated automatically. You must remember exactly where it is. Help you a lot to import it into code base  
  
## Example
**Folder structure**  
```
├── code_base/
│   └── src/
│       ├── index.js
│       └── media/
│           ├── image_1.png
│           ├── image_2.png
│           └── ...
└── webpack.config.js
```

**main.js**
```js
import React from "react";
...
import * as mappingData from "src/asset/manifest.json"; // no need to create this file. Just remember the path

return (
  <YourComponent>
)
```

**webpack.config.js**
```js
const SpritePNG = require("sprite-png-plugin");
...
const spriter = new SpritePNG({
  manifestFileName: "src/asset/manifest.json" // Path to generate manifest file
});

...
module.exports = {
  ...,
  module: {
    ...,
    rules: [
      ...,
      {
        test: /\.png$/,
        type: 'asset/resource'
      },
      ...
    ],
    plugins: [
      ...,
      spriter,
      ...
    ],
    ...
  }
}
```

## Options:  
  
| Option               | Type                    | Required | Default             | Description                                                  |
|----------------------|-------------------------|----------|---------------------|--------------------------------------------------------------|
| **outputPath**       | `string`                | No       | Webpack output path | Your output build path. Default will get from webpack output |
| **includes**         | `RegExp` &#124; `Array` | No       | `undefined`         | Reg to filter the images for sprite                          |
| **manifestFileName** | `string`                | No       | `manifest.json`     | Coordinate file name (path name is accepted)                 |
  
## Inspiration by:
- [image-sprite-webpack-plugin](https://github.com/naver/image-sprite-webpack-plugin)
- [webpack-virtual-modules](https://github.com/sysgears/webpack-virtual-modules)