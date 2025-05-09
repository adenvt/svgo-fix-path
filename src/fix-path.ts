import type {
  Point,
  PathArray,
  PathBBox,
} from 'svg-path-commander'
import {
  normalizePath,
  splitPath,
  pathToString,
  reversePath,
  getTotalLength,
  getPointAtLength,
  getPathBBox,
} from 'svg-path-commander'

function isInside (inner: Point[], outer: Point[], outerBBox: PathBBox) {
  return inner.every((point) => {
    return isPoinInBBox(point, outerBBox) && isPointInPoly(point, outer)
  })
}

function isPoinInBBox (point: Point, bbox: PathBBox) {
  return (point.x >= bbox.x && point.x <= bbox.x2)
    && (point.y >= bbox.y && point.y <= bbox.y2)
}

function isPointInPoly (point: Point, polygon: Point[]) {
  let c = false

  for (let i = -1, l = polygon.length, j = l - 1; ++i < l; j = i) {
    if (
      ((polygon[i].y <= point.y && point.y < polygon[j].y) || (polygon[j].y <= point.y && point.y < polygon[i].y))
      && (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)
    )
      c = !c
  }

  return c
}

function getPolygon (path: PathArray, precission = 30) {
  const points: Point[] = []
  const length          = getTotalLength(path)
  const inc             = Math.ceil(length / precission)

  for (let d = 0; d < length; d += inc)
    points.push(getPointAtLength(path, d))

  return points
}

function getArea (points: Point[]) {
  const n = points.length

  let area = 0

  for (let i = 0; i < n; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % n]

    area += (p1.x * p2.y - p2.x * p1.y)
  }

  return area
}

export class PathTree {
  protected path?: PathArray
  protected area?: number
  protected polygon?: Point[]
  protected bbox?: PathBBox

  public parent?: PathTree
  public children: Set<PathTree>

  constructor (path?: PathArray) {
    this.children = new Set()
    this.value    = path
  }

  set value (path: PathArray | undefined) {
    if (path) {
      const polygon = getPolygon(path)
      const area    = getArea(polygon)
      const bbox    = getPathBBox(path)

      this.path    = path
      this.polygon = polygon
      this.area    = area
      this.bbox    = bbox
    }
  }

  get value () {
    return this.path
  }

  get dir () {
    if (this.area !== undefined)
      return this.area >= 0 ? 'cw' : 'ccw'
  }

  addChild (target: PathTree) {
    for (const child of this.children) {
      const c = child.compare(target)

      if (c === -1) {
        child.setParent(target)

        return this
      }

      if (c === 1) {
        child.addChild(target)

        return this
      }
    }

    this.children.add(target)

    target.parent = this

    return this
  }

  setParent (parent: PathTree) {
    const grandParent = this.parent

    if (grandParent) {
      grandParent.children.delete(this)
      grandParent.addChild(parent)
    }

    parent.addChild(this)

    return this
  }

  compare (other: PathTree) {
    if (this.polygon && other.polygon && this.bbox && other.bbox) {
      if (isInside(other.polygon, this.polygon, this.bbox))
        return 1

      if (isInside(this.polygon, other.polygon, other.bbox))
        return -1
    }

    return 0
  }

  reverse () {
    if (this.value)
      this.value = reversePath(this.value)

    return this
  }

  static from (paths: PathArray[]) {
    const root = new PathTree()

    for (const path of paths)
      root.addChild(new PathTree(path))

    return root
  }
}

export function fixPath (d: string): string {
  const path  = normalizePath(d)
  const paths = splitPath(path)
  const root  = PathTree.from(paths)

  const nodes  = [...root.children]
  const result = [] as PathArray[]

  while (nodes.length > 0) {
    const node = nodes.shift()

    if (node) {
      if (node.value) {
        const pDir = node.parent?.dir ?? 'ccw'
        const dir  = node.dir

        if (pDir === dir)
          node.reverse()

        result.push(node.value)
      }

      if (node.children.size > 0)
        nodes.push(...node.children)
    }
  }

  return pathToString(result.flat() as PathArray)
}
