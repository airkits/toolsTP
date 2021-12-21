"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyParams = exports.getParams = exports.Utils = void 0;
/*
 * @Author: ankye
 * @since: 2021-08-11 11:32:18
 * @lastTime: 2021-08-11 14:02:49
 * @LastAuthor: ankye
 * @message:
 * @文件相对于项目的路径: /toolsTP/src/utils/Utils.ts
 */
const child_process = require("child_process");
class Utils {
    /**
     * 格式化字符串
     * @param str 需要格式化的字符串，【"这里有{0}个苹果，和{1}个香蕉！", 5,10】
     * @param args 参数列表
     */
    static format(str, ...args) {
        for (let i = 0; i < args.length; i++) {
            str = str.replace(new RegExp('\\{' + i + '\\}', 'gm'), typeof args[i] === 'object' ? JSON.stringify(args[i], null, 4) : args[i]);
        }
        return str;
    }
    /**
     * 执行shell命令
     * @param cli
     * @returns
     */
    static async shell(cli) {
        return new Promise((resolve, reject) => {
            child_process.exec(cli, { maxBuffer: 1024 * 1024 * 1024, encoding: 'utf8' }, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    // console.log(stderr);
                    resolve(stdout);
                }
            });
        });
    }
    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
    // 例子：
    // date("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
    // date("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    static date(fmt = 'yyyy-MM-dd hh:mm:ss.S') {
        let dt = new Date();
        var o = {
            'M+': dt.getMonth() + 1,
            'd+': dt.getDate(),
            'H+': dt.getHours(),
            'm+': dt.getMinutes(),
            's+': dt.getSeconds(),
            'q+': Math.floor((dt.getMonth() + 3) / 3),
            S: dt.getMilliseconds(),
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (dt.getFullYear() + '').substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp('(' + k + ')').test(fmt))
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        return fmt;
    }
}
exports.Utils = Utils;
const LAST_KEY = '__LAST_KEY';
/**
 * 获取命令行的参数
 * @param prefix 前缀
 */
function getParams(prefix = '-') {
    let obj = process.argv.slice(2).reduce((obj, it) => {
        if (it.indexOf('=') > -1) {
            const sp = it.split('=');
            const key = sp[0].replace(prefix, '');
            obj[key] = sp[1] || true; // "",undefined,"string";前两个会转为true
            if (obj[key] == 'true') {
                obj[key] = true;
            }
            else if (obj[key] == 'false') {
                obj[key] = false;
            }
        }
        else if (it.indexOf('-') > -1) {
            if (obj[LAST_KEY]) {
                obj[obj[LAST_KEY]] = true;
            }
            obj[LAST_KEY] = it.replace(prefix, '');
        }
        else {
            if (obj[LAST_KEY]) {
                obj[obj[LAST_KEY]] = it;
                delete obj[LAST_KEY];
            }
            else {
                obj[it] = true;
            }
        }
        return obj;
    }, {});
    if (obj[LAST_KEY]) {
        obj[obj[LAST_KEY]] = true;
        delete obj[LAST_KEY];
    }
    return obj;
}
exports.getParams = getParams;
function isEmptyParams() {
    return process.argv.length < 3;
}
exports.isEmptyParams = isEmptyParams;
