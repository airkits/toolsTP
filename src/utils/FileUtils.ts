var path = require('path')
var fs = require('fs-extra')
var JSZip = require('jszip')
var marked = require('marked')

/*
 * @Author: ankye
 * @since: 2021-08-11 12:39:38
 * @lastTime: 2021-08-11 13:09:31
 * @LastAuthor: ankye
 * @message:
 * @文件相对于项目的路径: /toolsTP/src/utils/FileUtils.ts
 */
export class FileUtils {
    /**
     * 工具的绝对路径
     * @param filename
     * @returns
     */
    public static toolHome(): string {
        let outPath = path.join(__dirname, '../../')
        return outPath
    }
    /**
     * 显示markdown
     * @param file 先对工具目录的相对路径
     */
    public static showMarkdown(file: string): void {
        file = path.join(this.toolHome(), file)
        let data = this.readFile(file)
        if (data) {
            console.log(marked(data))
        } else {
            console.log('file is empty:', file)
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
    public static writeJSONData(fname: string, directory: string, data: any): string {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true })
        }
        if (fs.existsSync(directory)) {
            let stat = fs.statSync(directory)
            if (stat.isDirectory()) {
                let outpath = path.join(directory, fname + '.json')
                fs.writeFileSync(outpath, JSON.stringify(data))
                return outpath
            }
        }
        return null
    }

    public static writeCfgJSONData(fname: string, cfgpath: string, data: any): string {
        if (fs.existsSync(cfgpath)) {
            let datas = fs.readFileSync(cfgpath, 'utf8')
            let cfgs = JSON.parse(datas)
            cfgs[fname] = data
            fs.writeFileSync(cfgpath, JSON.stringify(cfgs))
            return cfgpath
        }
        return null
    }

    public static readFile(file: string): string {
        if (fs.existsSync(file)) {
            let data = fs.readFileSync(file, 'utf8')
            return data
        } else {
            console.error('file not found ', file)
        }
        return null
    }
    public static writeStringData(fname: string, directory: string, data: any, suffix: string): string {
        if (fs.existsSync(directory)) {
            let stat = fs.statSync(directory)
            if (stat.isDirectory()) {
                let outpath = path.join(directory, fname + suffix)
                fs.writeFileSync(outpath, data)
                return outpath
            }
        }
        return null
    }

    public static walk(dir: string, needDir: boolean, recursive: boolean, callback: (path: string, file: string, stats: any) => void) {
        fs.readdir(dir, function (err, files) {
            if (err) throw err
            files.forEach(function (file) {
                var filepath = path.join(dir, file)
                fs.stat(filepath, function (err, stats) {
                    if (stats.isDirectory()) {
                        if (recursive) this.walk(filepath, needDir, recursive, callback)
                        if (needDir) {
                            callback(filepath, file, stats)
                        }
                    } else if (stats.isFile()) {
                        if (!needDir) {
                            callback(filepath, file, stats)
                        }
                    }
                })
            })
        })
    }

    public static walkSync(dir: string, needDir: boolean, recursive: boolean, out: any[]) {
        let files = fs.readdirSync(dir)
        files.forEach(function (file) {
            var filepath = path.join(dir, file)
            let stats = fs.statSync(filepath)
            if (stats.isDirectory()) {
                if (recursive) this.walkSync(filepath, needDir, recursive, out)
                if (needDir) {
                    out.push([filepath, file])
                }
            } else if (stats.isFile()) {
                if (!needDir) {
                    out.push([filepath, file])
                }
            }
        })
    }

    public static getFilePath(filename) {
        let outPath = path.join(__dirname, filename)
        return outPath
    }
    public static saveZip(zip: JSZip, dist: string): void {
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
                } else {
                    console.log(dist + '压缩失败')
                }
            })
        })
    }
}
