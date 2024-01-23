import { createCanvas } from 'canvas'

const fontWidthCanvas = createCanvas(120, 120)
const tempCXtx = fontWidthCanvas.getContext('2d')

export const BASELINE_RATIO = 0.26
export const MIDDLE_RATIO = (BASELINE_RATIO + 1) / 2 - BASELINE_RATIO
export function getBaselineOffset(): number {
    return 0
}
export const BASELINE_OFFSET = getBaselineOffset()

export class FontInfo {
    h: string
    char: string
    fontSize: number
    orignFontSize: number
    fontScale: number

    fontFamily: string //Microsoft Yahei
    enableBold: boolean
    enableItalic: boolean
    enableUnderline: boolean
    fillStyle: string //rgba(255,255,255,0.9)
    //描边
    strokeStyle: string = `rgba(255,0,0,1.0)` //rgba(255,255,255,0.9)
    lineWidth: number = 1 // lineWidth * fontScale
    //投影
    shadowColor: string = `rgba(0,255,0,1.0)` //rgba(255,255,255,0.9)
    shadowBlur: number = 2 //shadowBlur * fontScale
    shadowOffsetX: number = -4 //shadowOffsetX * fontScale
    shadowOffsetY: number = -4 //-shadowOffsetY * fontScale

    width: number = 0
    height: number = 0
    refCount: number = 0
    offsetX: number = 0
    offsetY: number = 0
    constructor(char, enableBold, enableItalic, enableUnderline, fillStyle, fontSize, fontFamily = 'Microsoft Yahei') {
        this.char = char
        this.orignFontSize = fontSize

        this.fontScale = 1.0
        this.fontFamily = fontFamily
        this.enableBold = enableBold
        this.enableItalic = enableItalic
        this.enableUnderline = enableUnderline
        this.fillStyle = fillStyle
        this.calcFontSize()
        this.calcContentSize()
        // this.strokeStyle = fillStyle
        // this.lineWidth = 1
        // this.shadowColor = 'rgba(0, 0, 0, 1)'
        // this.shadowBlur = 0
        // this.shadowOffsetX = 0
        // this.shadowOffsetY = 0
    }
    hash() {
        this.h = `${this.fontSize}_${this.fontFamily}_${this.char}_${this.enableBold ? 1 : 0}_${this.enableItalic ? 1 : 0}`
        return this.h
    }
    protected calcFontSize() {
        if (this.orignFontSize < 28) {
            this.fontSize = 32
        } else if (this.orignFontSize < 44) {
            this.fontSize = 48
        } else if (this.orignFontSize < 60) {
            this.fontSize = 64
        } else if (this.orignFontSize < 76) {
            this.fontSize = 80
        } else if (this.orignFontSize < 90) {
            this.fontSize = 96
        } else {
            this.fontSize = 128
        }
        this.fontScale = +(this.fontSize / this.orignFontSize).toFixed(2)
    }
    public getFontDesc() {
        let fontDesc = this.fontSize + 'px ' + this.fontFamily
        if (this.enableBold) {
            fontDesc = 'bold ' + fontDesc
        }
        if (this.enableItalic) {
            fontDesc = 'italic ' + fontDesc
        }
        return fontDesc
    }
    public calcContentSize() {
        tempCXtx.font = this.getFontDesc()
        tempCXtx.fillStyle = this.fillStyle
        tempCXtx.textAlign = 'center'
        tempCXtx.textBaseline = 'alphabetic'
        let data = tempCXtx.measureText(this.char)
        let width = Math.max(Math.ceil(Math.abs(data.actualBoundingBoxRight) + Math.abs(data.actualBoundingBoxLeft)), Math.ceil(data.width))

        const offset = this.enableItalic ? width * Math.tan(12 * 0.0174532925) : 0
        width += offset
        // this.offsetX = -offset / 2.0
        if (this.lineWidth > 0) {
            width += this.lineWidth * 2
        }
        if (this.shadowOffsetX != 0) {
            width += Math.abs(this.shadowOffsetX)
            this.offsetX = -this.shadowOffsetX / 2.0
        }
        if (this.shadowOffsetY != 0) {
            this.offsetY = this.shadowOffsetY / 2.0
        }
        const height = Math.ceil((1 + BASELINE_RATIO) * this.fontSize)
        //half pixel 修正
        this.width = width % 2 == 0 ? width : width + 1
        this.height = height % 2 == 0 ? height : height + 1
        if (this.char == '\\') {
            //fixed 斜杠
            this.width += 4
        }
    }
}

export class Rect {
    public width: number
    public height: number
    public x: number
    public y: number
    fontInfo: FontInfo
    constructor(width: number, height: number, x: number, y: number, fontInfo: FontInfo) {
        this.width = width
        this.height = height
        this.x = x
        this.y = y
        this.fontInfo = fontInfo
    }

    public getArea(): number {
        return this.width * this.height
    }

    public collide(rect: Rect): boolean {
        return rect.x < this.x + this.width && rect.x + rect.width > this.x && rect.y < this.y + this.height && rect.y + rect.height > this.y
    }

    public contain(rect: Rect): boolean {
        return rect.x >= this.x && rect.y >= this.y && rect.x + rect.width <= this.x + this.width && rect.y + rect.height <= this.y + this.height
    }
}

export class MaxRects {
    public width = 0
    public height = 0
    public padding = 0
    public border = 0
    public freeRects: Rect[] = []
    public rects: Rect[] = []
    constructor(maxWidth, maxHeight, padding, border) {
        this.width = maxWidth
        this.height = maxHeight
        this.padding = padding
        this.border = border
        this.freeRects.push(new Rect(this.width + this.padding - this.border * 2, this.height + this.padding - this.border * 2, this.border, this.border, null))
        this.rects = []
    }

    public reset() {
        this.freeRects = []
        this.rects = []
        this.freeRects.push(new Rect(this.width + this.padding - this.border * 2, this.height + this.padding - this.border * 2, this.border, this.border, null))
    }
    public add(width: number, height: number, fontInfo: FontInfo): Rect | null {
        const rect = new Rect(width, height, 0, 0, fontInfo)
        const result = this.placeRect(rect)
        if (result) {
            this.rects.push(result)
            console.log('add rect', result.fontInfo.h)
        }
        return result
    }
    public remove(rect: Rect): boolean {
        const index = this.rects.indexOf(rect)
        if (index !== -1) {
            this.freeRects.push(new Rect(rect.width, rect.height, rect.x, rect.y, null))
            let a = this.rects.splice(index, 1)
            console.log('remove rect', rect.fontInfo.h)
            return true
        }
        return false
    }
    public placeRect(rect: Rect): Rect | null {
        const node = this.findNode(rect.width + this.padding, rect.height + this.padding)
        if (node) {
            let numFreeRects = this.freeRects.length
            let i = 0
            while (i < numFreeRects) {
                if (this.splitNode(this.freeRects[i], node)) {
                    this.freeRects.splice(i, 1)
                    numFreeRects--
                    i--
                }
                i++
            }
            this.pruneFreeList()
            rect.x = node.x
            rect.y = node.y
            return rect
        }
        return null
    }
    public findNode(width: number, height: number): Rect | null {
        let score = Number.MAX_VALUE
        let areaFit = 0
        let bestNode: Rect | null = null
        for (let i = 0; i < this.freeRects.length; i++) {
            const rect = this.freeRects[i]
            if (rect.width >= width && rect.height >= height) {
                areaFit = rect.getArea() - width * height
                if (areaFit < score) {
                    bestNode = new Rect(width, height, rect.x, rect.y, null)
                    score = areaFit
                }
            }
        }
        return bestNode
    }

    public splitNode(freeRect: Rect, usedNode: Rect): boolean {
        if (!freeRect.collide(usedNode)) return false

        // Do vertical split
        if (usedNode.x < freeRect.x + freeRect.width && usedNode.x + usedNode.width > freeRect.x) {
            // New node at the top side of the used node
            if (usedNode.y > freeRect.y && usedNode.y < freeRect.y + freeRect.height) {
                const newNode = new Rect(freeRect.width, usedNode.y - freeRect.y, freeRect.x, freeRect.y, null)
                this.freeRects.push(newNode)
            }
            // New node at the bottom side of the used node
            if (usedNode.y + usedNode.height < freeRect.y + freeRect.height) {
                const newNode = new Rect(freeRect.width, freeRect.y + freeRect.height - (usedNode.y + usedNode.height), freeRect.x, usedNode.y + usedNode.height, null)
                this.freeRects.push(newNode)
            }
        }

        // Do Horizontal split
        if (usedNode.y < freeRect.y + freeRect.height && usedNode.y + usedNode.height > freeRect.y) {
            // New node at the left side of the used node.
            if (usedNode.x > freeRect.x && usedNode.x < freeRect.x + freeRect.width) {
                const newNode = new Rect(usedNode.x - freeRect.x, freeRect.height, freeRect.x, freeRect.y, null)
                this.freeRects.push(newNode)
            }
            // New node at the right side of the used node.
            if (usedNode.x + usedNode.width < freeRect.x + freeRect.width) {
                const newNode = new Rect(freeRect.x + freeRect.width - (usedNode.x + usedNode.width), freeRect.height, usedNode.x + usedNode.width, freeRect.y, null)
                this.freeRects.push(newNode)
            }
        }
        return true
    }

    public pruneFreeList() {
        // Go through each pair of freeRects and remove any rects that is redundant
        let i = 0
        let j = 0
        let len = this.freeRects.length
        while (i < len) {
            j = i + 1
            const tmpRect1 = this.freeRects[i]
            while (j < len) {
                const tmpRect2 = this.freeRects[j]
                if (tmpRect2.contain(tmpRect1)) {
                    this.freeRects.splice(i, 1)
                    i--
                    len--
                    break
                }
                if (tmpRect1.contain(tmpRect2)) {
                    this.freeRects.splice(j, 1)
                    j--
                    len--
                }
                j++
            }
            i++
        }
    }
}
