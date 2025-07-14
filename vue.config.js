/*
 * @Author: buaabuaazk 2447230029@qq.com
 * @Date: 2025-03-02 16:15:15
 * @LastEditors: buaabuaazk 2447230029@qq.com
 * @LastEditTime: 2025-04-22 22:57:08
 * @FilePath: \3_2\my-vue-electron-app\vue.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      fallback: {
        "path": false,
        "fs": false,
        "crypto": false
      }
    },
    externals: {
      'webpack/hot/emitter': 'window'
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      mainProcessFile: 'src/background.js',
      rendererProcessFile: 'src/main.js',
      builderOptions: {
        "appId": "com.example.my-vue-electron-app",
        "productName": "用例分析工具",
        "copyright": "Copyright © 2025",
        "directories": {
          "output": "dist_electron"
        },
        "mac": {
          "category": "public.app-category.utilities",
          "target": ["dmg", "zip"],
          "icon": "build/icons/icon.icns"
        },
        "win": {
          "target": [
            {
              "target": "nsis",
              "arch": ["x64"]
            }
          ],
          "icon": "build/icons/icon.ico",
          "signingHashAlgorithms": null,
          "sign": null
        },
        "linux": {
          "target": ["AppImage", "deb"],
          "icon": "build/icons"
        },
        "nsis": {
          "oneClick": false,
          "allowToChangeInstallationDirectory": true,
          "perMachine": false,
          "deleteAppDataOnUninstall": true,
          "createDesktopShortcut": true,
          "createStartMenuShortcut": true,
          "shortcutName": "用例分析工具"
        },
        "files": [
          "**/*"
        ],
        "extraResources": [
          {
            "from": "build/icons",
            "to": "icons",
            "filter": ["**/*"]
          }
        ],
        "asar": false
      }
    }
  }
})
