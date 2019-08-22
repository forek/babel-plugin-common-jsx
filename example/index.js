var babel = require('@babel/core');
var codePath = require('path').join(__dirname, 'code.js');
var commonJSX = require('../index.js');

babel.transformFile(codePath, {
  plugins: [
    [commonJSX, { functionName: 'wjsx.create', fragmentName: 'wjsx.fragment' }]
  ]
}, function(err, result) {
  if (err) return console.error(err);
  console.log('\n\033[01;34mresult - code: \033[0m\n');
  console.log(result.code);
  console.log('\n\033[01;34mend.\033[0m\n');
});
