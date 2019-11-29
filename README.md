
# babel-plugin-common-jsx
`babel-plugin-common-jsx` 是一个可以将JSX语法代码转译成JS语法的`babel插件`。它将JSX语法结构转译成嵌套调用函数的形式，并且支持开发者指定调用的函数名，同时还具备完整的JSX语法支持。

## 安装
```
npm install --save-dev babel-plugin-common-jsx
```

## 使用
### .babelrc
```javascript
{
  "plugins": [["babel-plugin-common-jsx", options]]
}
```

### 设置(options)
* functionName: 新建 `JSX标签` 时调用的函数名 (默认值: 'createElement')

* fragmentName: 新建 `JSX片段` 时调用的函数名 (默认值: 'createFragment')

* tagMode: 如何处理标签名是否转换为`变量引用`, 取值: 

  * normal: 标准模式, 大写字母开头的标签名转换为`变量引用`, 其他转换为字符串, 默认情况下使用 `normal` 模式
  
  * scope: 作用域模式, 查找标签所在局部作用域是否存在与标签名一致的变量, 存在时转换为`变量引用`, 否则转换为字符串

  * static: 静态模式, 需要额外提供一个参数`staticTags`描述那些标签名应该转换成字符串, 而其他标签转换为`变量引用` 

* staticTags: 当`tagMode`值为`static`时需要提供该参数, 该参数是一个由若干字符串组成的数组. 当标签名被包含在该数组内时, 该标签名会转换为字符串

设置示例: 
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

## 示例
JSXElement:
```javascript
// 转换前
const el = <div></div>;
// 转换后
const el = createElement("div", {}, []);
```

JSXFragment:
```javascript
// 转换前
const el = <><div></div></>;
// 转换后
const el = createFragment([createElement("div", {}, [])]);
```

JSXAttributes:
```javascript
// 转换前
const el = <div foo="baz"></div>;
// 转换后
const el = createElement("div", {\n  foo: "baz"\n}, []);
```

JSXSpreadAttribute:
```javascript
// 转换前
const el = <div foo {...props} bar="baz"></div>;
// 转换后
const el = createElement("div", Object.assign({}, {\n  foo: true\n}, props, {\n  bar: "baz"\n}), []);
```

JSXChildExpression:
```javascript
// 转换前
const el = <div>{<span></span>} {}</div>;
// 转换后
const el = createElement("div", {}, [createElement("span", {}, [])]);
```

## JSX语法参考
详见: [Draft: JSX Specification](https://facebook.github.io/jsx/) 

## JSX语法支持情况
除 `JSXNamespacedName` 相关功能外所有语法均已实现支持。

## 运行测试
```shell
npm run test
```

```shell
npm run test-coverage
```