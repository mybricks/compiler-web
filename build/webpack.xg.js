const path = require('path')
const merge = require("webpack-merge")
const commonCfg = require('./webpack.common')


//process.env.NODE_ENV = 'dev'

module.exports = merge(commonCfg, {
  entry: './_demo/main.tsx',
  output: {
    path: path.resolve(__dirname, '../_demo'),
    filename: './bundle.js',
    libraryTarget: 'umd'
  },
  externals: [{
    // '@mybricks/rxui':'@mybricks/rxui',
    'React': 'React',
    'react': 'React',
    'react-dom': 'ReactDOM',
    'antd': 'antd',
    'blockly': 'Blockly',
    'blocks': 'blocks',
    'BizCharts': 'BizCharts',
    'bizcharts': 'BizCharts',
    '@ant-design/icons': '@ant-design',
    'moment':'moment'
  }],
  devtool: 'cheap-source-map',//devtool: 'cheap-source-map',
  resolve: {
    alias: Object.assign({}, {//for dev
      'react': require('path').resolve(__dirname, '../node_modules/react'),
      'react-dom': require('path').resolve(__dirname, '../node_modules/react-dom'),
      '@mybricks/rxui':require('path').resolve(__dirname, '../../rxui/src/'),
      '@mybricks/compiler-web':require('path').resolve(__dirname, '../index.ts'),
      '@mybricks/compiler-js': require('path').resolve(__dirname, '../../compiler-js/index.ts'),
    }),
    // alias: {//for dev
    //   '@hb/app-designer': require('path').resolve(__dirname, '../src'),
    //   'react': require('path').resolve(__dirname, '../node_modules/react'),
    //   'react-dom': require('path').resolve(__dirname, '../node_modules/react-dom'),
    //   'rxui': require('path').resolve(__dirname, '../../rxui/src/'),
    //   'xgraph.compiler': require('path').resolve(__dirname, '../node_modules/@hb/xgraph.compiler'),
    //   'xgraph.desn-sdk': require('path').resolve(__dirname, '../node_modules/@hb/xgraph.desn-sdk'),
    //   'xgraph.desn-dblview': require('path').resolve(__dirname, '../node_modules/@hb/xgraph.desn-dblview')
    // }
  },
  devServer: {
    port: 8001,  //端口设置
    contentBase: path.join(__dirname, '../_demo'),
    disableHostCheck: true,
    //progress: true,
    inline: true
  }
})