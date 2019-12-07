const babel7 = require('@babel/core')

const commonJSX = require('../index')

function transform (code, opts = {}) {
  return babel7.transform(code, {
    plugins: [
      [commonJSX, opts]
    ]
  }).code
}

describe('Syntax support test:', () => {
  it('JSXElement', () => {
    const input = 'const el = <div></div>;'
    const expected = 'const el = createElement("div", {}, []);'
    expect(transform(input)).toBe(expected)
  })

  it('JSXFragment', () => {
    const input = 'const el = <><div></div></>;'
    const expected = 'const el = createFragment([createElement("div", {}, [])]);'
    expect(transform(input)).toBe(expected)
  })

  it('JSXOpeningElement JSXChildren JSXClosingElement', () => {
    const input = 'const el = <div><span>test case</span></div>;'
    const expected = 'const el = createElement("div", {}, [createElement("span", {}, ["test case"])]);'
    expect(transform(input)).toBe(expected)
  })

  it('JSXSelfClosingElement', () => {
    const input = 'const el = <div />;'
    const expected = 'const el = createElement("div", {}, []);'
    expect(transform(input)).toBe(expected)
  })

  it('JSXElementName - JSXMemberExpression', () => {
    {
      // JSXIdentifier . JSXIdentifier
      const input = 'const el = <foo.bar></foo.bar>;'
      const expected = 'const el = createElement(foo.bar, {}, []);'
      expect(transform(input)).toBe(expected)
    }

    {
      // JSXMemberExpression . JSXIdentifier
      const input = 'const el = <foo.bar.baz></foo.bar.baz>;'
      const expected = 'const el = createElement(foo.bar.baz, {}, []);'
      expect(transform(input)).toBe(expected)
    }

    {
      // this
      const input = 'const el = <this></this>;'
      const expected = 'const el = createElement(this, {}, []);'
      expect(transform(input)).toBe(expected)
    }
  })

  it('JSXAttributes', () => {
    const input = 'const el = <div foo="baz"></div>;'
    const expected = 'const el = createElement("div", {\n  foo: "baz"\n}, []);'
    expect(transform(input)).toBe(expected)
  })

  it('JSXAttributes - no JSXAttributeValue', () => {
    const input = 'const el = <div foo></div>;'
    const expected = 'const el = createElement("div", {\n  foo: true\n}, []);'
    expect(transform(input)).toBe(expected)
  })

  it('JSXAttributeValue - JSXSingleStringCharacters', () => {
    const input = 'const el = <div foo=\'baz\'></div>;'
    const expected = 'const el = createElement("div", {\n  foo: \'baz\'\n}, []);'
    expect(transform(input)).toBe(expected)
  })

  it('JSXAttributeValue - AssignmentExpression', () => {
    const input = 'const el = <div foo={true}></div>;'
    const expected = 'const el = createElement("div", {\n  foo: true\n}, []);'
    expect(transform(input)).toBe(expected)
  })

  it('JSXAttributeValue - JSXElement', () => {
    const input = 'const el = <div foo=<div />></div>;'
    const expected = 'const el = createElement("div", {\n  foo: createElement("div", {}, [])\n}, []);'
    expect(transform(input)).toBe(expected)
  })

  it('JSXAttributeValue - JSXFragment', () => {
    const input = 'const el = <div foo=<>test fragment</>></div>;'
    const expected = 'const el = createElement("div", {\n  foo: createFragment(["test fragment"])\n}, []);'
    expect(transform(input)).toBe(expected)
  })

  it('JSXSpreadAttribute', () => {
    {
      // without other attribute
      const input = 'const el = <div {...props}></div>;'
      const expected = 'const el = createElement("div", Object.assign({}, props), []);'
      expect(transform(input)).toBe(expected)
    }

    {
      // with other attribute
      const input = 'const el = <div foo {...props} bar="baz"></div>;'
      const expected = 'const el = createElement("div", Object.assign({}, {\n  foo: true\n}, props, {\n  bar: "baz"\n}), []);'
      expect(transform(input)).toBe(expected)
    }
  })

  it('JSXChild - JSXChildExpression', () => {
    {
      // JSXElement
      const input = 'const el = <div>{<span></span>} {}</div>;'
      const expected = 'const el = createElement("div", {}, [createElement("span", {}, [])]);'
      expect(transform(input)).toBe(expected)
    }

    {
      // AssignmentExpression
      const input = 'const el = <div>{foo.bar}</div>;'
      const expected = 'const el = createElement("div", {}, [foo.bar]);'
      expect(transform(input)).toBe(expected)
    }
  })
})

describe('Options test:', () => {
  it('functionName: foo.createEl', () => {
    const opts = { functionName: 'foo.createEl' }
    const input = 'const el = <div></div>;'
    const expected = 'const el = foo.createEl("div", {}, []);'
    expect(transform(input, opts)).toBe(expected)
  })

  it('fragmentName: foo.createFm', () => {
    const opts = { fragmentName: 'foo.createFm' }
    const input = 'const el = <><div></div></>;'
    const expected = 'const el = foo.createFm([createElement("div", {}, [])]);'
    expect(transform(input, opts)).toBe(expected)
  })

  it('tagMode: normal', () => {
    const input = 'const el = <Div></Div>;'
    const expected = 'const el = createElement(Div, {}, []);'
    expect(transform(input)).toBe(expected)
  })

  it('tagMode: scope', () => {
    const opts = { tagMode: 'scope' }
    const input = 'const div = null;\n const el = <div></div>;\n const el2 = <Div></Div>;\n const el3 = <this></this>;'
    const expected = 'const div = null;\nconst el = createElement(div, {}, []);\nconst el2 = createElement("Div", {}, []);\nconst el3 = createElement(this, {}, []);'
    expect(transform(input, opts)).toBe(expected)
  })

  it('tagMode: static', () => {
    const opts = { tagMode: 'static', staticTags: ['div', 'Text'] }
    const input = 'const el = <div></div>;\n const el2 = <Text></Text>;\n const el3 = <span></span>;'
    const expected = 'const el = createElement("div", {}, []);\nconst el2 = createElement("Text", {}, []);\nconst el3 = createElement(span, {}, []);'
    expect(transform(input, opts)).toBe(expected)
  })
})

describe('Not support test:', () => {
  it('JSXElementName - JSXNamespacedName', () => {
    const input = 'const el = <div:foo></div:foo>;'
    expect(transform.bind(null, input)).toThrow('Does not support syntax: "JSXNamespacedName"')
  })

  it('JSXAttributeName - JSXNamespacedName', () => {
    const input = 'const el = <div foo:bar></div>;'
    expect(transform.bind(null, input)).toThrow('Does not support syntax: "JSXNamespacedName"')
  })
})
