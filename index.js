var t = require('babel-types');

var defaultOptions = {
  factory: 'Factory.create'
}

module.exports = function(options) {
  var o = Object.assign({}, defaultOptions, options);

  return function(babel) {
    return {
      inherits: require('babel-plugin-syntax-jsx'),
      visitor: {
        JSXElement: function(path) {
          var expr = buildCallExpression(path.node, o.factory);
          path.replaceWith(expr);
        }
      }
    }
  }
}

function buildCallExpression(node, fnIdentifier) {
  var opEl = node.openingElement;
  var tag = buildTag(opEl);
  var args = [tag];
  args.push(t.objectExpression(buildAttributes(opEl.attributes)));
  args.push(t.ArrayExpression(buildChildren(node.children)));
  return t.CallExpression(t.Identifier(fnIdentifier || 'create'), args)
}

function buildChildren(children) {
  if (!children || !children.length) return [];
  return children.map(function(c) {
    switch (c.type) {
      case 'JSXText':
        return t.stringLiteral(buildTextString(c.value));
      case 'JSXElement':
        return c;
      case 'JSXExpressionContainer':
        return c.expression;
      default:
        return null;
    }
  });
}

function buildTag(node) {
  return convertIdentifier(node.name, node);
}

function convertIdentifier(node, parent) {
  if (t.isJSXIdentifier(node)) {
    if (node.name === 'this' && t.isReferenced(node, parent)) {
      return t.thisExpression();
    } else if (!/[A-Z]/.test(node.name[0]) && !t.isJSXMemberExpression(parent)) {
      return t.stringLiteral(node.name);
    }

    node.type = 'Identifier';
  } else if (t.isJSXMemberExpression(node)) {
    return t.memberExpression(convertIdentifier(node.object, node), convertIdentifier(node.property, node));
  }

  return node;
}

function buildAttributes(attrs) {
  if (!attrs.length) return [];
  return attrs.map(function(a) {
    return t.objectProperty(t.Identifier(a.name.name) , a.value)
  });
}

function buildTextString(text) {
  return text.replace(/\s+/g, ' ').replace(/^\s?(.*)\s?$/, '$1');
}