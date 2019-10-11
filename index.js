const titleCaseRgx = /^[A-Z]/

function throwSyntaxError (type) {
  throw new Error(`Does not support syntax: ${JSON.stringify(type)}`)
}

const buildTools = (t, { functionName, fragmentName, tagMode }) => ({
  callExporession (path) {
    const { node } = path
    const children = this.jsxChildren(node.children)
    if (t.isJSXFragment(node)) return t.callExpression(t.identifier(fragmentName), [children])
    const opEl = this.jsxOpeningElementInfo(node.openingElement, path)
    return t.callExpression(t.identifier(functionName), [opEl.tag, opEl.props, children])
  },
  jsxOpeningElementInfo (node, path) {
    let { name } = node
    if (t.isJSXMemberExpression(name)) {
      name = this.memberExpression(name)
    } else {
      let needIdentifier = null

      if (name.name === 'this') {
        needIdentifier = true
      } else {
        switch (tagMode) {
          case 'normal': needIdentifier = titleCaseRgx.test(name.name); break
          case 'scope': needIdentifier = path.scope.hasOwnBinding(name.name, true /* noGlobals */); break
        }
      }

      name = needIdentifier ? this.identifier(name) : this.stringLiteral(name)
    }

    return {
      tag: name,
      props: this.jsxProps(node.attributes)
    }
  },
  memberExpression (node) {
    return t.memberExpression(
      t.isJSXMemberExpression(node.object)
        ? this.memberExpression(node.object)
        : this.identifier(node.object),
      this.identifier(node.property)
    )
  },
  jsxProps (attr = []) {
    const hasJSXSpreadAttribute = !!attr.find(node => t.isJSXSpreadAttribute(node))
    if (!hasJSXSpreadAttribute) return t.objectExpression(attr.map(node => this.objectProperty(node)))
    const args = [t.objectExpression([])].concat(attr.map(node =>
      t.isJSXSpreadAttribute(node)
        ? node.argument
        : t.objectExpression([this.objectProperty(node)])
    ))
    return t.callExpression(t.memberExpression(t.identifier('Object'), t.identifier('assign')), args)
  },
  objectProperty (node) {
    if (t.isJSXAttribute(node)) {
      const key = this.identifier(node.name)
      let value = t.booleanLiteral(true)
      if (node.value) {
        if (t.isStringLiteral(node.value)) value = node.value
        else if (t.isJSXElement(node.value) || t.isJSXFragment(node.value)) value = node.value
        else value = node.value.expression
      }
      return t.objectProperty(key, value)
    }
  },
  identifier (node) {
    if (t.isJSXIdentifier(node)) return t.identifier(node.name)
    throwSyntaxError(node.type)
  },
  stringLiteral (node) {
    if (t.isJSXIdentifier(node)) return t.stringLiteral(node.name)
    if (t.isJSXText(node)) return t.stringLiteral(node.value.trim().replace(/\s+/g, ' '))
    throwSyntaxError(node.type)
  },
  jsxChildren (children) {
    const arr = []
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      if (t.isJSXText(node)) {
        arr.push(this.stringLiteral(node))
        continue
      } else if (t.isJSXExpressionContainer(node)) {
        if (t.isJSXEmptyExpression(node.expression)) continue
        arr.push(node.expression)
      } else if (t.isJSXElement(node) || t.isJSXFragment(node)) {
        arr.push(node)
      }
    }
    return t.arrayExpression(arr)
  }
})

const defaultOptions = {
  functionName: 'createElement',
  fragmentName: 'createFragment',
  tagMode: 'normal' // or scope
}

module.exports = function ({ types: t }) {
  let build = null
  return {
    inherits: require('babel-plugin-syntax-jsx'),
    visitor: {
      Program: {
        enter (_path, { opts = {} }) {
          if (!build) {
            build = buildTools(t, Object.assign({}, defaultOptions, opts))
          }
        }
      },
      JSXElement (path) {
        path.replaceWith(build.callExporession(path))
      },
      JSXFragment (path) {
        path.replaceWith(build.callExporession(path))
      }
    }
  }
}
