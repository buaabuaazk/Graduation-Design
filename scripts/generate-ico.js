/*
 * @Author: buaabuaazk 2447230029@qq.com
 * @Date: 2025-04-22 21:55:49
 * @LastEditors: buaabuaazk 2447230029@qq.com
 * @LastEditTime: 2025-04-22 22:34:52
 * @FilePath: \my-vue-electron-app\scripts\generate-ico.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function generateIco() {
    try {
        const buffer = await pngToIco('build/icons/icon.png');
        fs.writeFileSync('build/icons/icon.ico', buffer);
        console.log('Successfully generated icon.ico');
    } catch (error) {
        console.error('Error generating ico:', error);
    }
}

generateIco(); 