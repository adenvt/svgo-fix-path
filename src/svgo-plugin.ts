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

export const RemoveClipPathPlugin: CustomPlugin = {
  name: 'remove-clip-path',
  fn  : () => {
    return {
      element: {
        exit (node, parentNode) {
          if (node.name === 'g' && node.attributes['clip-path']) {
            parentNode.children = node.children.map((child) => {
              return child
            })
          }
        },
      },
    }
  },
}
