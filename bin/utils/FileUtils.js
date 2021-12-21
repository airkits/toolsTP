"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtils = void 0;
const path = require("path");
const fs = require("fs-extra");
const marked = require("marked");
/*
 * @Author: ankye
 * @since: 2021-08-11 12:39:38
 * @lastTime: 2021-08-11 13:09:31
 * @LastAuthor: ankye
 * @message:
 * @文件相对于项目的路径: /toolsTP/src/utils/FileUtils.ts
 */
class FileUtils {
    /**
     * 工具的绝对路径
     * @param filename
     * @returns
     */
    static toolHome() {
        let outPath = path.join(__dirname, '../../');
        return outPath;
    }
    /**
     * 显示markdown
     * @param file 先对工具目录的相对路径
     */
    static showMarkdown(file) {
        file = path.join(this.toolHome(), file);
        let data = this.readFile(file);
        if (data) {
            console.log(marked(data));
        }
        else {
            console.log('file is empty:', file);
        }
    }
    /**
     * 向文件写入JSON数据
     *
     * @export
     * @param {File} file 拖入的文件
     * @param {string} directory 要存储的文件路径
     * @param {*} data 数据
     * @returns {string}   存储成功返回文件路径<br/>
     *                     存储失败返回null
     */
    static writeJSONData(fname, directory, data) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        if (fs.existsSync(directory)) {
            let stat = fs.statSync(directory);
            if (stat.isDirectory()) {
                let outpath = path.join(directory, fname + '.json');
                fs.writeFileSync(outpath, JSON.stringify(data));
                return outpath;
            }
        }
        return null;
    }
    static writeCfgJSONData(fname, cfgpath, data) {
        if (fs.existsSync(cfgpath)) {
            let datas = fs.readFileSync(cfgpath, 'utf8');
            let cfgs = JSON.parse(datas);
            cfgs[fname] = data;
            fs.writeFileSync(cfgpath, JSON.stringify(cfgs));
            return cfgpath;
        }
        return null;
    }
    static readFile(file) {
        if (fs.existsSync(file)) {
            let data = fs.readFileSync(file, 'utf8');
            return data;
        }
        else {
            console.error('file not found ', file);
        }
        return null;
    }
    static writeStringData(fname, directory, data, suffix) {
        if (fs.existsSync(directory)) {
            let stat = fs.statSync(directory);
            if (stat.isDirectory()) {
                let outpath = path.join(directory, fname + suffix);
                fs.writeFileSync(outpath, data);
                return outpath;
            }
        }
        return null;
    }
    static walk(dir, needDir, recursive, callback) {
        fs.readdir(dir, function (err, files) {
            if (err)
                throw err;
            files.forEach(function (file) {
                var filepath = path.join(dir, file);
                fs.stat(filepath, function (err, stats) {
                    if (stats.isDirectory()) {
                        if (recursive)
                            this.walk(filepath, needDir, recursive, callback);
                        if (needDir) {
                            callback(filepath, file, stats);
                        }
                    }
                    else if (stats.isFile()) {
                        if (!needDir) {
                            callback(filepath, file, stats);
                        }
                    }
                });
            });
        });
    }
    static walkSync(dir, needDir, recursive, out) {
        let files = fs.readdirSync(dir);
        files.forEach(function (file) {
            var filepath = path.join(dir, file);
            let stats = fs.statSync(filepath);
            if (stats.isDirectory()) {
                if (recursive)
                    this.walkSync(filepath, needDir, recursive, out);
                if (needDir) {
                    out.push([filepath, file]);
                }
            }
            else if (stats.isFile()) {
                if (!needDir) {
                    out.push([filepath, file]);
                }
            }
        });
    }
    static saveZip(zip, dist) {
        // 压缩
        zip.generateAsync({
            // 压缩类型选择nodebuffer，在回调函数中会返回zip压缩包的Buffer的值，再利用fs保存至本地
            type: 'nodebuffer',
            // 压缩算法
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9,
            },
        }).then(function (content) {
            // 写入磁盘
            fs.writeFile(dist, content, function (err) {
                if (!err) {
                    // 是否删除源文件
                }
                else {
                    console.log(dist + '压缩失败');
                }
            });
        });
    }
}
exports.FileUtils = FileUtils;
