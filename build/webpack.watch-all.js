module.exports = {
  devServer: {
    port: 8002,
  },
  watch: true,
  entry:'./index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
        // exclude: /node_modules/
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
    ]
  },
  externals: [{
    'React': 'React',
    'react': 'React',
    'react-dom': {
      'commonjs': 'react-dom',
      'commonjs2': 'react-dom',
      'amd': 'react-dom',
      'root': 'ReactDOM'
    },
    '@mybricks/rxui':'rxui',
  }],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  output: {
    globalObject: 'this',
    filename: 'compiler-web.js',
    libraryTarget: 'umd',
    library: 'xgCompilerWeb'
  }
}
