const path = require('path')
const merge = require("webpack-merge")
const commonCfg = require('./webpack.common')


module.exports = merge(commonCfg, {
  // entry: {
  //   parse: './src/parse.ts',
  //   renderReact: './src/RenderReact.tsx'
  // },
  entry: './demo/main.tsx',
  //devtool: 'cheap-module-source-map',
  //devtool: 'cheap-module-eval-source-map',
  externals: [{
    'React': 'React',
    'react': 'React',
    // 'react-dom': 'ReactDOM',
    'react-dom': {
      'commonjs': 'react-dom',
      'commonjs2': 'react-dom',
      'amd': 'react-dom',
      'root': 'ReactDOM'
    },
    'rxui':'rxui',
    'antd': 'antd',
    'Mock': 'mockjs',
    '@antv/data-set': 'DataSet',
    '@turf/turf': 'turf',
    'moment': 'moment'
  }],
  resolve: {
    alias: Object.assign({}, {//for dev
      'react': require('path').resolve(__dirname, '../node_modules/react'),
      'react-dom': require('path').resolve(__dirname, '../node_modules/react-dom'),
      'xgraph.compiler-web':require('path').resolve(__dirname, '../renderReact.js'),
      'xgraph.compiler': require('path').resolve(__dirname, '../node_modules/@hb/xgraph.compiler'),
    })
  },
  output: {
    globalObject: 'this',
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../'),
    libraryTarget: 'umd'
  }
})
