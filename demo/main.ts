import { fixPath, PathTree } from '../src/fix-path'
import {
  splitPath,
  pathToString,
  normalizePath,
} from 'svg-path-commander'
import { SAMPLE_2 } from './sample'

const showDirections = document.querySelector('#showDirections') as HTMLInputElement
const input          = document.querySelector('#input') as HTMLTextAreaElement
const svg            = document.querySelector('#preview') as SVGSVGElement
const path           = document.querySelector('#preview-fill') as SVGPathElement
const g              = document.querySelector('#preview-stroke') as SVGGElement
const fixButton      = document.querySelector('#fix-button') as HTMLButtonElement
const treeView       = document.querySelector('#treeview') as HTMLDivElement
const treeViewPath   = new Map<HTMLSpanElement, SVGPathElement>()

showDirections.addEventListener('input', () => {
  if (showDirections.checked)
    document.body.classList.add('show-marker')
  else
    document.body.classList.remove('show-marker')
})

input.addEventListener('input', () => {
  render()
})

fixButton.addEventListener('click', () => {
  input.value = fixPath(input.value)

  render()
})

treeView.addEventListener('mouseover', (event) => {
  const target = event.target as HTMLSpanElement

  if (target?.matches('.node')) {
    const path = treeViewPath.get(target)

    if (path)
      path.classList.add('active')
  }
})

treeView.addEventListener('mouseout', (event) => {
  const target = event.target as HTMLSpanElement

  if (target?.matches('.node')) {
    const path = treeViewPath.get(target)

    if (path)
      path.classList.remove('active')
  }
})

function render () {
  path.setAttribute('d', input.value)

  const bb = path.getBBox()

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

  treeViewPath.clear()

  renderTreeNode(ul, root)

  treeView.replaceChildren(ul)
  g.replaceChildren(...treeViewPath.values())
}

function renderTreeNode (ul: HTMLUListElement, tree: PathTree) {
  for (const node of tree.children) {
    const li = document.createElement('li')

    if (node.value) {
      if (node.value.at(-1)?.[0] !== 'Z')
        node.value.push(['Z'])

      const span = document.createElement('span')
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const d    = pathToString(node.value)

      span.textContent = d

      span.classList.add('node')
      path.setAttribute('d', d)

      if (node.dir) {
        path.classList.add(`path-${node.dir}`)
        li.classList.add(node.dir)
      }

      treeViewPath.set(span, path)
      li.append(span)
    }

    if (node.children.size > 0) {
      const cul = document.createElement('ul')

      renderTreeNode(cul, node)

      li.classList.add('has-child', 'expand')
      li.append(cul)
    }

    ul.append(li)
  }
}

input.value = SAMPLE_2

render()
