const titleCaseRgx = /^[A-Z]/

const buildTools = (t, fn) => ({
  callExporession (node) {
    const opEl = this.jsxOpeningElementInfo(node.openingElement)
    const children = this.jsxChildren(node.children)
    return t.callExpression(t.identifier(fn), [opEl.tag, opEl.props, children])
  },
  jsxOpeningElementInfo (node) {
    let { name } = node
    if (t.isJSXMemberExpression(name)) {
      name = this.memberExpression(name)
    } else {
      name = titleCaseRgx.test(name.name) || name.name === 'this' ? this.identifier(name) : this.stringLiteral(name)
    }

    return {
      tag: name,
      props: this.jsxProps(node.attributes)
    }
  },
  memberExpression (node) {
    if (t.isJSXMemberExpression(node)) {
      return t.memberExpression(
        t.isJSXMemberExpression(node.object)
          ? this.memberExpression(node.object)
          : this.identifier(node.object),
        this.identifier(node.property)
      )
    }
    throw new Error(`memberExpression - ${JSON.stringify(node)}`)
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
      const value = node.value ? (t.isStringLiteral(node.value) ? node.value : node.value.expression) : t.booleanLiteral(true)
      return t.objectProperty(key, value)
    }
    throw new Error(`objectProperty - ${JSON.stringify(node)}`)
  },
  identifier (node) {
    if (t.isJSXIdentifier(node)) return t.identifier(node.name)
    throw new Error(`identifier - ${JSON.stringify(node)}`)
  },
  stringLiteral (node) {
    if (t.isJSXIdentifier(node)) return t.stringLiteral(node.name)
    if (t.isJSXText(node)) return t.stringLiteral(node.value.trim())
    throw new Error(`stringLiteral - ${JSON.stringify(node)}`)
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
      } else if (t.isJSXElement(node)) {
        arr.push(this.callExporession(node))
      } else {
        throw new Error(`jsxChildren - ${JSON.stringify(node)}`)
      }
    }
    return t.arrayExpression(arr)
  }
})

module.exports = function (functionName = 'create') {
  return function ({ types: t }) {
    const build = buildTools(t, functionName)
    return {
      inherits: require('babel-plugin-syntax-jsx'),
      visitor: {
        JSXElement (path) {
          path.replaceWith(build.callExporession(path.node))
        }
      }
    }
  }
}
