# PNG Sprite creator
Webpack plugin helps to create PNG sprite image and coordinate mapping file (`manifest.json`)
## Usage:
Suppose you want a manifest.json file in `src/asset/manifest.json`. You can import it into any place without creating it, plugin will handle that  
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
const spriter = new SpritePNG();

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
| **manifestFileName** | `string`                | No       | `manifest.json`     | Coordinate file name                                         |
  
## Inspiration by:
- [image-sprite-webpack-plugin](https://github.com/naver/image-sprite-webpack-plugin)
- [webpack-virtual-modules](https://github.com/sysgears/webpack-virtual-modules)