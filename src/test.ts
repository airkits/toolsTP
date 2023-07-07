/**计算从nTime1到nTime2过去了多少自然天天*/
function passedDays2(nTime1: number, nTime2: number): number {
    let t = new Date(nTime1)
    nTime1 = nTime1 - (t.getHours() * 3600 + t.getMinutes() * 60 + t.getSeconds())
    const offset = (nTime2 - nTime1) / 86400
    return Math.ceil(offset)
}

const now = Date.now()
const start = now - 36000
console.log(passedDays2(start, now))
