const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin


const ignoreWarningPlugin = require('./ignoreWarningPlugin')

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {//for prod
      '@mybricks/compiler-web': require('path').resolve(__dirname, '../src'),
      // 'rxui': require('path').resolve(__dirname, '../node_modules/@hb/rxui'),
      // 'antd': require('path').resolve(__dirname, '../node_modules/antd'),
      //'@mybricks/compiler-js': require('path').resolve(__dirname, '../node_modules/@hb/xgraph.compiler'),
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-react'  // jsx支持
                //['@babel/preset-env', { useBuiltIns: 'usage', corejs: 2 }] // 按需使用polyfill
              ],
              plugins: [
                ['@babel/plugin-proposal-class-properties', {'loose': true}] // class中的箭头函数中的this指向组件
              ],
              cacheDirectory: true // 加快编译速度
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        exclude: /\.d\.ts$/,
        //include: [pathSrc, testSrc],
        use: [
          // {
          //   loader: './config/test-loader'
          // },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-react'  // jsx支持
                //['@babel/preset-env', { useBuiltIns: 'usage', corejs: 2 }]
              ],
              plugins: [
                ['@babel/plugin-proposal-class-properties', {'loose': true}]
              ],
              cacheDirectory: true
            }
          },
          {
            loader: 'ts-loader',
            options: {
              silent: true,
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        // exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      },
      // {
      //   test: /\.nmd(?=\.less)$/gi,
      //   use: ['style-loader', 'css-loader', 'less-loader']
      // },
      {
        test: /\.less$/i,
        use: [
          {loader: 'style-loader'},
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]-[hash:5]'
              }
            }
          },
          {loader: 'less-loader'}
        ]
      },
      {
        test: /\.xml$/i,
        use: [
          {loader: 'raw-loader'}
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100000
            }
          },
        ],
      },
    ]
  },
  optimization: {
    concatenateModules: false//name_name
  },
  plugins: [
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: JSON.stringify('production')
    //   }
    // }),
    // new webpack.ProvidePlugin({
    //   'React': 'react'
    // }),
    new ignoreWarningPlugin(),   // All warnings will be ignored
    //new BundleAnalyzerPlugin()
  ]
}
