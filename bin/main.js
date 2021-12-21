#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./utils/Utils");
const FileUtils_1 = require("./utils/FileUtils");
/*
 * @Author: ankye
 * @since: 2021-08-11 10:52:53
 * @lastTime: 2021-08-11 14:22:53
 * @LastAuthor: ankye
 * @message:
 * @文件相对于项目的路径: /toolsTP/src/main.ts
 */
function doDefault() {
    console.log('start script');
}
// doHelp read help.md and show content
function doHelp() {
    console.log(FileUtils_1.FileUtils.showMarkdown('help.md'));
}
async function main() {
    console.log('Tool start [' + Utils_1.Utils.date() + '] \n' + 'Home:' + FileUtils_1.FileUtils.toolHome());
    const args = Utils_1.getParams();
    console.log(args);
    console.log('=============================');
    if (args['help'] || args['h']) {
        doHelp();
    }
    else {
        doDefault();
    }
}
main();
