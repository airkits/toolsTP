#!/usr/bin/env ts-node

import clc = require('cli-color')

import { getParams, isEmptyParams, Utils } from './utils/Utils'
import { FileUtils } from './utils/FileUtils'

/*
 * @Author: ankye
 * @since: 2021-08-11 10:52:53
 * @lastTime: 2021-08-11 14:22:53
 * @LastAuthor: ankye
 * @message:
 * @文件相对于项目的路径: /toolsTP/src/main.ts
 */

function doDefault(): void {
    console.log('start script')
}
// doHelp read help.md and show content
function doHelp(): void {
    console.log(FileUtils.showMarkdown('help.md'))
}

async function main() {
    console.log(clc.green('Tool start [' + Utils.date() + '] \n') + clc.blue('Home:' + FileUtils.toolHome()))
    const args = getParams()
    console.log(args)
    console.log('=============================')
    if (args['help'] || args['h']) {
        doHelp()
    } else {
        doDefault()
    }
}

main()
