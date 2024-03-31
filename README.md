# Sprite PNG plugin
Webpack plugin helps to create PNG sprite image and coordinate mapping file (`manifest.json`)
## Usage:
Suppose you want a manifest.json file in `src/asset/manifest.json`. You can import it into any place without creating it, plugin will handle that  
```js
import React from "react";
...
import { getIcon } from ...; // outputDir + getIcon.js

const example = getIcon("example_example-small.png"); // iconName = parent folder + "_" + icon name

return (
  <YourComponent>
)
```

**webpack.config.js**
```js
const SpritePNG = require("sprite-png-plugin");
...

...
module.exports = {
  ...,
  module: {
    ...,
    plugins: [
      ...,
      new SpritePNG({
        ...options
      })
      ...
    ],
    ...
  }
}
```

## Options:  
  
| Option        | Type                                                          | Required | Default     | Description                            |
| ------------- | ------------------------------------------------------------- | -------- | ----------- | -------------------------------------- |
| **outputDir** | `String`                                                      | No       | ./          | Output directory for sprite sheet data |
| **excludes**  | `RegExp` &#124; `Array`                                       | No       | `undefined` | Reg to filter the images for sprite    |
| **entry**     | `String` &#124; `RegExp` &#124; `Array<String`&#124;`RegExp>` | No       | []          | images entry                           |
