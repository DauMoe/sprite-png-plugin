# Sprite PNG plugin
Webpack plugin uses [Spritesmith](https://github.com/twolfson/spritesmith) to helping create PNG sprite image and coordinate mapping file (`manifest.json`)
## Usage:
- Make sure [ImageMagick](https://imagemagick.org/) is installed on your device and add it to PATH. Because `Spritesmith` works on top of it  
- Make sure your assets is actual `png` image. You can use online converter tool (JPG -> PNG, JPEG -> PNG, SVG -> PNG, ...). And DO NOT change file extension directly (I do it and got error `Invalid signature`)  
- The manifest path should be relative path from current webpack config container directory  
- Manifest file will be generated automatically. You must remember exactly where it is. Help you a lot to import it into code base  
  
## Options:  
| Option               | Type                    | Required | Default             | Description                                                  |
|----------------------|-------------------------|----------|---------------------|--------------------------------------------------------------|
| **outputPath**       | `string`                | No       | Webpack output path | Your output build path. Default will get from webpack output |
| **includes**         | `RegExp` &#124; `Array` | No       | `undefined`         | Reg to filter the images for sprite                          |
| **manifestFileName** | `string`                | No       | `manifest.json`     | Coordinate file name (path name is accepted)                 |
  
## Manifest content format
```yaml
{
  "width": <number>,
  "height": <number>,
  "frames": {
    [image_1_name]: {
      "width": <number>,
      "height": <number>,
      "x": <number>
      "y": <number>
    },
    [image_2_name]: {
      ...so_on
    },
    ...
  }
}
```
- **width**: sprite sheet width
- **height**: sprite sheet height
- **frames**: contain each images coordinate (x, y, w, h)
  
## Example
**Folder structure**  
```
├── code_base/
│   └── src/
│       ├── index.js
│       └── assets/
│           ├── image_1.png
│           ├── image_2.png
│           └── ...
└── webpack.config.js
```

**index.js**
```js
import React from "react";
...
import * as mappingData from "./assets/manifest.json"; // no need to create this file. Just remember the path

return (
  <YourComponent>
)
```

**webpack.config.js**
```js
const SpritePNG = require("sprite-png-plugin");
...
const spriter = new SpritePNG({
  manifestFileName: "./src/assets/manifest.json" // Path to generate manifest file
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
  
## Inspiration by:
- [image-sprite-webpack-plugin](https://github.com/naver/image-sprite-webpack-plugin)
- [webpack-virtual-modules](https://github.com/sysgears/webpack-virtual-modules)
