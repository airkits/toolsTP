import { createCanvas } from 'canvas'

const fontWidthCanvas = createCanvas(120, 120)
const tempCXtx = fontWidthCanvas.getContext('2d')

export function getSymbolSafeSubstring(str: string, index: number, endIndex?): string {
    const length = str.length
    let len = 0
    let count = 0
    let start = 0
    let charCode = 0
    if (endIndex === undefined) {
        endIndex = length
    }
    let out = []
    for (let i = 0; i < length; i++) {
        charCode = str.charCodeAt(i)
        if (charCode === 0x200d) {
            len++
            continue
        }
        if (charCode >= 0xd800 && charCode <= 0xdbff) {
            len++
            charCode = str.charCodeAt(i + 1)
            if (charCode >= 0xdc00 && charCode <= 0xdfff) {
                if (i + 2 < length && str.charCodeAt(i + 2) === 0x200d) {
                    len++
                } else {
                    len++
                    if (count >= index && count < endIndex) {
                        out.push(str.slice(start, start + len))
                    }
                    start += len
                    count++
                    len = 0
                }
                i++
                continue
            }
        }
        if (count >= index && count < endIndex) {
            out.push(str.charAt(i))
        }
        start = i + 1
        count++
        len = 0
    }
    return out.join('')
}

export function getSymbolLength(str: string): number {
    const length = str.length
    let len = 0
    let count = 0
    let start = 0
    let charCode = 0
    for (let i = 0; i < length; i++) {
        charCode = str.charCodeAt(i)
        if (charCode === 0x200d) {
            len++
            continue
        }
        if (charCode >= 0xd800 && charCode <= 0xdbff) {
            len++
            charCode = str.charCodeAt(i + 1)
            if (charCode >= 0xdc00 && charCode <= 0xdfff) {
                if (i + 2 < length && str.charCodeAt(i + 2) === 0x200d) {
                    len++
                } else {
                    len++
                    start += len
                    count++
                    len = 0
                }
                i++
                continue
            }
        }
        start = i + 1
        count++
        len = 0
    }
    return count
}

export function getSymbolAt(str: string, index: number): string {
    const length = str.length
    let len = 0
    let count = 0
    let start = 0
    let charCode = 0
    for (let i = 0; i < length; i++) {
        charCode = str.charCodeAt(i)
        if (charCode === 0x200d) {
            len++
            continue
        }
        if (charCode >= 0xd800 && charCode <= 0xdbff) {
            len++
            charCode = str.charCodeAt(i + 1)
            if (charCode >= 0xdc00 && charCode <= 0xdfff) {
                if (i + 2 < length && str.charCodeAt(i + 2) === 0x200d) {
                    len++
                } else {
                    len++
                    if (index === count) {
                        return str.slice(start, start + len)
                    }
                    start += len
                    count++
                    len = 0
                }
                i++
                continue
            }
        }
        if (index === count) {
            return str.charAt(i)
        }
        start = i + 1
        count++
        len = 0
    }
    return ''
}

export function getSymbolCodeAt(str: string, index: number): string {
    const length = str.length
    let len = 0
    let count = 0
    let start = 0
    let charCode = 0
    for (let i = 0; i < length; i++) {
        charCode = str.charCodeAt(i)
        if (charCode === 0x200d) {
            len++
            continue
        }
        if (charCode >= 0xd800 && charCode <= 0xdbff) {
            len++
            charCode = str.charCodeAt(i + 1)
            if (charCode >= 0xdc00 && charCode <= 0xdfff) {
                if (i + 2 < length && str.charCodeAt(i + 2) === 0x200d) {
                    len++
                } else {
                    len++
                    if (index === count) {
                        return str.slice(start, start + len)
                    }
                    start += len
                    count++
                    len = 0
                }
                i++
                continue
            }
        }
        if (index === count) {
            return `${str.charCodeAt(i)}`
        }
        start = i + 1
        count++
        len = 0
    }
    return ''
}
function getSymbolStartIndex(targetString, index: number): number {
    if (index >= targetString.length) {
        return targetString.length
    }
    let startCheckIndex = index
    let startChar = targetString[startCheckIndex]
    while (startCheckIndex >= 0) {
        if (startChar === '\u200d') {
            startCheckIndex--
        }
        startChar = targetString[startCheckIndex]
        if (startChar >= '\uDC00' && startChar <= '\uDFFF') {
            // lowSurrogateRex
            if (startCheckIndex - 1 >= 0) {
                startCheckIndex--
                startChar = targetString[startCheckIndex]
            }
        }
        if (startChar >= '\uD800' && startChar <= '\uDBFF') {
            // highSurrogateRex
            if (startCheckIndex - 1 >= 0 && targetString[startCheckIndex - 1] === '\u200d') {
                startCheckIndex--
                startChar = targetString[startCheckIndex]
            } else {
                break
            }
        } else {
            break
        }
    }
    return startCheckIndex
}

function getSymbolEndIndex(targetString, index: number): number {
    let newEndIndex = index
    let endCheckIndex = index
    let endChar = targetString[endCheckIndex]
    while (endCheckIndex < targetString.length) {
        if (endChar === '\u200d') {
            endCheckIndex++
            newEndIndex++
            endChar = targetString[endCheckIndex]
            if (endChar >= '\uD800' && endChar <= '\uDBFF') {
                // highSurrogateRex
                endCheckIndex++
                newEndIndex++
            }
        }
        endChar = targetString[endCheckIndex]
        if (endChar >= '\uD800' && endChar <= '\uDBFF') {
            // highSurrogateRex
            endCheckIndex++
            newEndIndex++
            endChar = targetString[endCheckIndex]
        } else if (endChar >= '\uDC00' && endChar <= '\uDFFF') {
            // lowSurrogateRex
            endCheckIndex++
            if (endCheckIndex < targetString.length && targetString[endCheckIndex] === '\u200d') {
                newEndIndex++
                endChar = targetString[endCheckIndex]
            } else {
                break
            }
        } else {
            break
        }
    }
    return newEndIndex
}
function _safeSubstring(targetString, startIndex, endIndex?): string {
    let newStartIndex = getSymbolStartIndex(targetString, startIndex)
    if (newStartIndex < startIndex) {
        newStartIndex = getSymbolEndIndex(targetString, startIndex) + 1
    }
    let newEndIndex = endIndex

    if (endIndex !== undefined) {
        endIndex = Math.max(0, endIndex - 1)
        newEndIndex = getSymbolEndIndex(targetString, endIndex)
        let newStartEndIndex = getSymbolStartIndex(targetString, endIndex)
        if (newStartEndIndex < newStartIndex || (newStartEndIndex == newStartIndex && startIndex > newStartIndex)) {
            newEndIndex = newStartIndex
        } else {
            newEndIndex = newEndIndex + 1
        }
    }
    return targetString.substring(newStartIndex, newEndIndex) as string
}

let txt = 'w大熊🐻👨‍👩‍👧‍👦🐼'
console.log(txt, txt.length)
// console.log(getSymbolStartIndex(txt, 0), 0)
// console.log(getSymbolStartIndex(txt, 1), 1)
// console.log(getSymbolStartIndex(txt, 2), 2)
// console.log(getSymbolStartIndex(txt, 3), 3)
// console.log(getSymbolStartIndex(txt, 4), 3)
// console.log(getSymbolStartIndex(txt, 5), 5)
// console.log(getSymbolStartIndex(txt, 6), 5)
// console.log(getSymbolStartIndex(txt, 7), 5)
// console.log(getSymbolStartIndex(txt, 8), 5)
// console.log(getSymbolStartIndex(txt, 9), 5)
// console.log(getSymbolStartIndex(txt, 10), 5)
// console.log(getSymbolStartIndex(txt, 11), 5)
// console.log(getSymbolStartIndex(txt, 12), 5)
// console.log(getSymbolStartIndex(txt, 13), 5)
// console.log(getSymbolStartIndex(txt, 14), 5)
// console.log(getSymbolStartIndex(txt, 15), 5)
// console.log(getSymbolStartIndex(txt, 16), 16)
// console.log(getSymbolStartIndex(txt, 17), 16)

// console.log(getSymbolEndIndex(txt, 0), 0)
// console.log(getSymbolEndIndex(txt, 1), 1)
// console.log(getSymbolEndIndex(txt, 2), 2)
// console.log(getSymbolEndIndex(txt, 3), 4)
// console.log(getSymbolEndIndex(txt, 4), 4)
// console.log(getSymbolEndIndex(txt, 5), 15)
// console.log(getSymbolEndIndex(txt, 6), 15)
// console.log(getSymbolEndIndex(txt, 7), 15)
// console.log(getSymbolEndIndex(txt, 8), 15)
// console.log(getSymbolEndIndex(txt, 9), 15)
// console.log(getSymbolEndIndex(txt, 10), 15)
// console.log(getSymbolEndIndex(txt, 11), 15)
// console.log(getSymbolEndIndex(txt, 12), 15)
// console.log(getSymbolEndIndex(txt, 13), 15)
// console.log(getSymbolEndIndex(txt, 14), 15)
// console.log(getSymbolEndIndex(txt, 15), 15)
// console.log(getSymbolEndIndex(txt, 16), 17)
// console.log(getSymbolEndIndex(txt, 17), 17)

//console.log(_safeSubstring(txt, 0, 6), '&&', _safeSubstring(txt, 7, 15), '&&', _safeSubstring(txt, 16, 17))

// console.log(_safeSubstring(txt, 0, 3), '&&', _safeSubstring(txt, 4, 5), '&&', _safeSubstring(txt, 6, 17))
// console.log(_safeSubstring(txt, 0, 2), '&&', _safeSubstring(txt, 3, 8), '&&', _safeSubstring(txt, 9, 17))

// for (let i = 1; i < txt.length - 1; i++) {
//     console.log(_safeSubstring(txt, 0, i), _safeSubstring(txt, i + 1))
// }
const WORD_REG = /([a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôûа-яА-ЯЁё]+|\S)/
// eslint-disable-next-line no-useless-escape
const SYMBOL_REG = /^[!,.:;'}\]%\?>、‘“》？。，！]/
const LAST_WORD_REG =
    /([a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôûаíìÍÌïÁÀáàÉÈÒÓòóŐőÙÚŰúűñÑæÆœŒÃÂãÔõěščřžýáíéóúůťďňĚŠČŘŽÁÍÉÓÚŤżźśóńłęćąŻŹŚÓŃŁĘĆĄ-яА-ЯЁёáàảạãăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệiíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢẠÃĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆIÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]+|\S)$/
const LAST_ENGLISH_REG =
    /[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôûаíìÍÌïÁÀáàÉÈÒÓòóŐőÙÚŰúűñÑæÆœŒÃÂãÔõěščřžýáíéóúůťďňĚŠČŘŽÁÍÉÓÚŤżźśóńłęćąŻŹŚÓŃŁĘĆĄ-яА-ЯЁёáàảạãăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệiíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢẠÃĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆIÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]+$/
const FIRST_ENGLISH_REG =
    /^[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôûаíìÍÌïÁÀáàÉÈÒÓòóŐőÙÚŰúűñÑæÆœŒÃÂãÔõěščřžýáíéóúůťďňĚŠČŘŽÁÍÉÓÚŤżźśóńłęćąŻŹŚÓŃŁĘĆĄ-яА-ЯЁёáàảạãăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệiíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢẠÃĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆIÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]/
const WRAP_INSPECTION = true

export function safeMeasureText(ctx, string: string, desc?: string): number {
    ctx.font = desc || '24px sans-serif'
    const metric = ctx.measureText(string)
    const width = (metric && metric.width) || 0

    return width
}
export function fragmentText(stringToken: string, allWidth: number, maxWidth: number, measureText: (string: string) => number): string[] {
    // check the first character
    const wrappedWords: string[] = []
    // fast return if strArr is empty
    if (stringToken.length === 0 || maxWidth < 0) {
        wrappedWords.push('')
        return wrappedWords
    }

    let text = stringToken
    while (allWidth > maxWidth && text.length > 1) {
        let fuzzyLen = (text.length * (maxWidth / allWidth)) | 0
        let tmpText = _safeSubstring(text, fuzzyLen)
        let width = allWidth - measureText(tmpText)
        let sLine = tmpText
        let pushNum = 0

        let checkWhile = 0
        const checkCount = 100

        // Exceeded the size
        while (width > maxWidth && checkWhile++ < checkCount) {
            fuzzyLen *= maxWidth / width
            fuzzyLen |= 0
            tmpText = _safeSubstring(text, fuzzyLen)
            width = allWidth - measureText(tmpText)
        }

        checkWhile = 0

        // Find the truncation point
        // if the 'tempText' which is truncated from the next line content equals to '',
        // we should break this loop because there is no available character in the next line.
        while (tmpText && width <= maxWidth && checkWhile++ < checkCount) {
            const exec = WORD_REG.exec(tmpText)
            pushNum = exec ? exec[0].length : 1
            sLine = tmpText

            fuzzyLen += pushNum
            tmpText = _safeSubstring(text, fuzzyLen)
            width = allWidth - measureText(tmpText)
        }

        fuzzyLen -= pushNum
        // in case maxWidth cannot contain any characters, need at least one character per line
        if (fuzzyLen === 0) {
            fuzzyLen = 1
            sLine = _safeSubstring(text, 1)
        } else if (fuzzyLen === 1 && text[0] >= '\uD800' && text[0] <= '\uDBFF') {
            // highSurrogateRex
            fuzzyLen = 2
            sLine = _safeSubstring(text, 2)
        }

        let sText = _safeSubstring(text, 0, fuzzyLen)
        //  fuzzyLen = sText.length
        let result

        // Symbols cannot be the first character in a new line.
        // In condition that a symbol appears at the beginning of the new line, we will move the last word of this line to the new line.
        // If there is only one word in this line, we will keep the first character of this word and move the rest of characters to the new line.
        if (WRAP_INSPECTION) {
            if (SYMBOL_REG.test(sLine || tmpText)) {
                result = LAST_WORD_REG.exec(sText)
                fuzzyLen -= result ? result[0].length : 0
                if (fuzzyLen === 0) {
                    fuzzyLen = 1
                }

                sLine = _safeSubstring(text, fuzzyLen)
                sText = _safeSubstring(text, 0, fuzzyLen)
            }
        }

        // To judge whether a English words are truncated
        // If it starts with an English word in the next line and it ends with an English word in this line,
        // we consider that a complete word is truncated into two lines. The last word without symbols of this line will be moved to the next line.
        if (FIRST_ENGLISH_REG.test(sLine)) {
            result = LAST_ENGLISH_REG.exec(sText)
            if (result && sText !== result[0]) {
                fuzzyLen -= result[0].length
                sLine = _safeSubstring(text, fuzzyLen)
                sText = _safeSubstring(text, 0, fuzzyLen)
            }
        }

        // The first line And do not wrap should not remove the space
        if (wrappedWords.length === 0) {
            wrappedWords.push(sText)
        } else {
            sText = sText.trim()
            if (sText.length > 0) {
                wrappedWords.push(sText)
            }
        }
        text = sLine || tmpText
        allWidth = measureText(text)
    }

    if (wrappedWords.length === 0) {
        wrappedWords.push(text)
    } else {
        text = text.trim()
        if (text.length > 0) {
            wrappedWords.push(text)
        }
    }
    return wrappedWords
}
function _measureText(ctx, fontDesc): (str: string) => number {
    return (str: string): number => safeMeasureText(ctx, str, fontDesc)
}
txt =
    '啥都发😧👨‍👩‍👧‍👦啥都发😧👨‍👩‍👧‍👦啥都发😧👨‍👩‍👧‍👦啥都发😧👨‍👩‍👧‍👦啥都发😧👨‍👩‍👧‍👦啥都发😧👨‍👩‍👧‍👦lsfjasldfjsaf;jfladsjfljalkfjsaklfjklsdjfkldsajflakdsjfklads fjadskl fjdsfjadsfjads;fjdsa fasdjlfjdsa;fjasdlkjlsafjlksajf;lsdajfl;sdljsadf'

const allWidth = safeMeasureText(tempCXtx, txt, '24px sans-serif')
let textFragment = fragmentText(txt, allWidth, 200, _measureText(tempCXtx, '24px sans-serif'))
console.log(textFragment)
