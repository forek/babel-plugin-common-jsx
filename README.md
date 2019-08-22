
# @babel/plugin-common-jsx
`@babel/plugin-common-jsx` 是一个可以将JSX语法代码转译成JS语法的`babel插件`。它将JSX语法结构转译成嵌套调用函数的形式，并且支持开发者指定调用的函数名，同时还具备完整的JSX语法支持。

## 安装
```
npm install --save-dev @babel/plugin-common-jsx
```

## 使用
### .babelrc
```javascript
{
  "plugins": [["@babel/plugin-common-jsx", options]]
}
```

### 设置(options)
* functionName: 新建 `JSX标签` 时调用的函数名 (默认值: 'createElement')

* fragmentName: 新建 `JSX片段` 时调用的函数名 (默认值: 'createFragment')

* tagMode: 如何处理标签名是否转换为`变量引用`, 取值: 

  * normal: 标准模式, 大写字母开头的标签名转换为`变量引用`, 其他转换为字符串, 默认情况下使用 `normal` 模式
  
  * scope: 作用域模式, 查找标签所在局部作用域是否存在与标签名一致的变量, 存在时转换为`变量引用`, 否则转换为字符串

设置示例: 
```javascript
{
  "plugins": [
    [
      "@babel/plugin-common-jsx", {
        "functionName": "createElement",
        "fragmentName": "createFragment",
        "tagMode": "normal"
      }
    ]
  ]
}

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