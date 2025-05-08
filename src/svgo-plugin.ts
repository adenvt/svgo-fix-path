import type { CustomPlugin } from 'svgo'
import { fixPath } from './fix-path'

export const FixPathPlugin: CustomPlugin = {
  name: 'fix-path',
  fn  : () => {
    return {
      element: {
        enter (node) {
          if (node.name === 'path' && node.attributes.d)
            node.attributes.d = fixPath(node.attributes.d)
        },
      },
    }
  },
}
