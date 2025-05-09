# SVGO Fix Path

> Fix SVG path direction using SVGO

## What is it?

SVGO plugin for autofixing path `fill-rule: evenodd` which not supported when you converted using [svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont). This plugin detect and tried to correct path direction automatically.

## Installation

```sh
npm install --save-dev svgo-fix-path
```

And then add in your `svgo.config.mjs`

```js
import { FixPathPlugin } from 'svgo-fix-path'

export default {
  plugins: [
    FixPathPlugin,
    // Make sure add before default's preset
    {
      name  : 'preset-default',
      params: {},
    }
  ]
}
```
## Using without SVGO

This plugin also provide utils for usage outside SVGO

```js
import { fixPath } from 'svgo-fix-path'

const result = fixPath('M20.1 120.8Q27.7 120.8 33.2 118.5Q38.7 ...')

console.log(result) // 'M20.1 120.8L20.1 120.8Q11.2 120.8 5.6 ...'
```
## Limitations

> [!CAUTION]
> This plugin doesn't work well with SVG that have intersect paths or self-intersect path due very hard determine what is it should be look like.

## Related Projects
- [Fix Path Directions](https://github.com/herrstrietzel/fix-path-directions) by [@herrstrietzel](https://github.com/herrstrietzel) - the original algorithm for this library
- [Vector Path Editor](https://www.figma.com/community/plugin/1391765568770221941/vector-path-editor) - Figma plugin for reverse path orientations manually

## License

[MIT License](./LICENSE)
