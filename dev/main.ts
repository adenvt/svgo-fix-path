import { fixPath, PathTree } from '../src/fix-path'
import {
  splitPath,
  pathToString,
  normalizePath,
} from 'svg-path-commander'

const showDirections = document.querySelector('#showDirections') as HTMLInputElement
const input          = document.querySelector('#input') as HTMLTextAreaElement
const svg            = document.querySelector('#preview') as SVGSVGElement
const path           = document.querySelector('#preview > path') as SVGPathElement
const fixButton      = document.querySelector('#fix-button') as HTMLButtonElement
const treeView       = document.querySelector('#treeview') as HTMLDivElement

showDirections.addEventListener('input', () => {
  if (showDirections.checked)
    document.body.classList.add('showMarkers')
  else
    document.body.classList.remove('showMarkers')
})

input.addEventListener('input', () => {
  render()
})

fixButton.addEventListener('click', () => {
  input.value = fixPath(input.value)

  render()
})

function render () {
  path.setAttribute('d', input.value)

  const bb = svg.getBBox()

  svg.setAttribute('viewBox', [
    bb.x,
    bb.y,
    bb.width,
    bb.height,
  ].join(' '))

  renderTree()
}

function renderTree () {
  const d     = input.value
  const path  = normalizePath(d)
  const paths = splitPath(path)
  const root  = PathTree.from(paths)
  const ul    = document.createElement('ul')

  renderTreeNode(ul, root)

  treeView.replaceChildren(ul)
}

function renderTreeNode (ul: HTMLUListElement, tree: PathTree) {
  for (const node of tree.children) {
    const li = document.createElement('li')

    li.textContent = node.value ? pathToString(node.value) : ''

    if (node.dir)
      li.classList.add(node.dir)

    if (node.children.size > 0) {
      const cul = document.createElement('ul')

      renderTreeNode(cul, node)

      li.classList.add('has-child')
      li.append(cul)
    }

    ul.append(li)
  }
}

render()
