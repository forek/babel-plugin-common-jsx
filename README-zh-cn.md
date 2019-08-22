# @babel/plugin-common-jsx
`@babel/plugin-common-jsx` 是一个可以将JSX语法代码转译成JS语法的`babel插件`。它将JSX语法结构转译成嵌套调用函数的形式，并且支持开发者指定调用的函数名，同时还具备完整的JSX语法支持。

## 安装
```
npm install --save-dev babel-plugin-common-jsx
```

## 使用
### Node.js
```javascript
const babel = require('@babel/core')
```

## 设置
```javascript
const babel = require('@babel/core')
```

## 示例
```javascript
// 转换前
const Div = 123
const a = <div>123 {123}{} <Div c="654"/></div>
const b = <div b={(123)}/>
const c = <Div c="654" {...props} d="123" {...abc} f=<br />/>
const d = <this el={<> 123</>}/>
const e = <> </>
const f = <this.b el=<> 123    123</> />

// 转换后
const Div = 123;
const a = createElement("div", {}, ["123", 123, "", createElement(Div, {
  c: "654"
}, [])]);
const b = createElement("div", {
  b: 123
}, []);
const c = createElement(Div, Object.assign({}, {
  c: "654"
}, props, {
  d: "123"
}, abc, {
  f: createElement("br", {}, [])
}), []);
const d = createElement(this, {
  el: createFragment(["123"])
}, []);
const e = createFragment([""]);
const f = createElement(this.b, {
  el: createFragment(["123 123"])
}, []);
```

## JSX语法参考
详见: [Draft: JSX Specification](https://facebook.github.io/jsx/) 

## JSX语法支持情况
除 `JSXNamespacedName` 相关功能外所有语法均已实现支持。