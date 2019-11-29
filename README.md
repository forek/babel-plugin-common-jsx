
# babel-plugin-common-jsx
`babel-plugin-common-jsx` is a babel plugin that can translate JSX syntax code into JavaScript. It translates the JSX syntax structure into the form of nested calling functions, and supports developers to specify the function name to be called, and also has full JSX syntax support.

This README is also available in other languages:

 * [简体中文](https://github.com/forek/babel-plugin-common-jsx/blob/master/README.zh.md) 

## Install
```
npm install --save-dev babel-plugin-common-jsx
```

## Usage
### .babelrc
```javascript
{
  "plugins": [["babel-plugin-common-jsx", options]]
}
```

### Options
* functionName: Function name to be called when creating a new JSX tag (default: 'createElement').

* fragmentName: Function name to be called when creating a new JSX fragment (default: 'createFragment').

* tagMode: Handle whether tag name is translated to `variable reference`:

  * normal: `normal` mode. Tag names starting with uppercase letters are translated to `variable references`, others are translated to strings, and the normal mode is used by default.
  
  * scope: `scope` mode. Find whether a variable with the same name as the tag exists in the local scope where the tag is located. If it exists, it is translated to a `variable reference`.

  * static: `static` mode. Need to provide an additional parameter `staticTags` describing which tag names should be translated to strings, while other tags are translated to `variable references`.

* staticTags: This parameter is required when the `tagMode` value is` static`. This parameter is an array of several strings. When the tag name is included in the array, the tag name is translated to a string.

example: 
```javascript
{
  "plugins": [
    [
      "babel-plugin-common-jsx", {
        "functionName": "createElement",
        "fragmentName": "createFragment",
        "tagMode": "normal"
      }
    ]
  ]
}

```

## Example
JSXElement:
```javascript
// Before
const el = <div></div>;
// After
const el = createElement("div", {}, []);
```

JSXFragment:
```javascript
// Before
const el = <><div></div></>;
// After
const el = createFragment([createElement("div", {}, [])]);
```

JSXAttributes:
```javascript
// Before
const el = <div foo="baz"></div>;
// After
const el = createElement("div", {\n  foo: "baz"\n}, []);
```

JSXSpreadAttribute:
```javascript
// Before
const el = <div foo {...props} bar="baz"></div>;
// After
const el = createElement("div", Object.assign({}, {\n  foo: true\n}, props, {\n  bar: "baz"\n}), []);
```

JSXChildExpression:
```javascript
// Before
const el = <div>{<span></span>} {}</div>;
// After
const el = createElement("div", {}, [createElement("span", {}, [])]);
```

## JSX syntax reference
Detail: [Draft: JSX Specification](https://facebook.github.io/jsx/)

## JSX syntax support
All syntaxes have been implemented except for `JSXNamespacedName`.

## Test
```shell
npm run test
```

```shell
npm run test-coverage
```