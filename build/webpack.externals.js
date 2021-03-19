module.exports = {
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
    'axios': 'axios',
    '@ant-design/icons': '@ant-design',
    'BizCharts': 'BizCharts',
    'bizcharts': 'BizCharts',
    'Mock': 'mockjs',
    '@antv/data-set': 'DataSet',
    '@turf/turf': 'turf'
  }]
}
