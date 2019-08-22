# babel-plugin-common-jsx
Build your own jsx-transformer!

## Installation
```
npm install --save-dev babel-plugin-common-jsx
```

## Usage
Add export-from-ie8/loader into webpack.config.js
```
  postLoaders: [
    {
      test: /\.(js|jsx)$/,
      loader: 'export-from-ie8/loader'
    }
  ]
```

