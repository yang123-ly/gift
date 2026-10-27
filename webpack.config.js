const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDev = argv.mode !== 'production';

  return {
    mode: isDev ? 'development' : 'production',
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      // 'auto' 让打包后的 JS/CSS/图片按页面实际 URL 推导资源地址,
      // 支持部署到 GitHub Pages 子目录(如 /gift/)等任意路径前缀下
      publicPath: 'auto'
    },
    module: {
      rules: [
        {
          // 静态资源解析: 图片/字体/音视频等通过 import 或 new URL 引入时输出到 dist
          test: /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|mp3|mp4)$/,
          type: 'asset',
          parser: { dataUrlCondition: { maxSize: 8 * 1024 } },
          generator: { filename: 'assets/[name][ext]' }
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-react',
                  {
                    runtime: 'automatic',
                    development: isDev
                  }
                ],
                '@babel/preset-env',
                '@babel/preset-typescript'
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    devServer: {
      port: 3015,
      allowedHosts: 'all',
      // HMR 客户端从页面自身 location 推导 WS 地址,避免把内部端口拼到网关域名后面
      // auto -> 跟随页面协议(https->wss);0.0.0.0 -> 用页面 hostname;0 -> 用页面端口(443 即省略)
      client: {
        webSocketURL: 'auto://0.0.0.0:0/ws'
      },
      historyApiFallback: {
        index: '/index.html',
        rewrites: [
          { from: /^\/_p\/\d+\//, to: '/index.html' }
        ]
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        inject: 'body'
      })
    ]
  };
};
