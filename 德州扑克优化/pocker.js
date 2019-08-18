
//#region ===============  enum ==================
// 扑克牌牌型大小，按照牌型大小进行设置
const TYPE = {
    NO: -1,  // 不是任何一种牌型
    HIGHTCARD: 0, // 散牌——单牌
    ONE_PAIR: 1,  // 对子
    TWO_PAIR: 2,  // 两对
    THREE_OF_A_KIND: 3, // 三条
    FLUSH: 4, // 顺子
    MAX_FLUSH: 5, // 最大的顺子
    STRAIGHT: 6, // 同花
    THREE_ZONE: 7, // 三带一对（满堂彩）
    BOMB: 8, // 四条（炸弹）
    STRAIGHT_FLUSH: 9,  // 同花顺，皇家同花顺也是同花顺的一种，这里只定义同花顺即可
    MAX_STRAIGHT_FLUSH: 10 // 皇家同花顺
}

// 扑克牌牌面值
const CODE = {
    '2': 2,  // 数值2
    '3': 3,  // 数值3
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'T': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14,
    'X': 20  // x不能去组合顺子，只能单独处理，这里理解为鬼牌（大小王）,这里没有鬼牌，预留
}
//#endregion ============================
// 游戏开始
function onStart(alicPockers, bobPockers, laiziPocker) {
    // 转换牌值
    let aPockers = turnOfPocker(alicPockers)
    let bPockers = turnOfPocker(bobPockers) 
    let handleCardsLength = aPockers.length
    // 排列组合取出指定个数
    let aHandlePockers = permutation(aPockers)
    let bHandlePockers = permutation(bPockers)
    // 获取用户最大的一手牌的牌型以及牌值
    let aUserPockers = handleCardsLength === 5 ? getUserPockersFive(aHandlePockers, laiziPocker) :getUserPockersSenven(bHandlePockers, laiziPocker)
}

// 获取七张牌的情况下最大的一手牌
function getUserPockersSenven(pockers, laiziPocker) {
    let userMaxPockers = { pockers: [], type: TYPE.NO }
    for (let index = 0; index < pockers.length; index++) {
        const element = pockers[index]
        // 获取用户的牌型
        const userPockers = getUserPockersFive(element, laiziPocker)
        userMaxPockers = userMaxPockers.type < userPockers.type ? userPockers : 
            userMaxPockers.type >= userPockers.type ? userMaxPockers : compairHightPockers(userMaxPockers, userPockers) 
    }
}

// 获取一手牌的牌型
function getUserPockersFive(pockers, laiziPocker) {
    // 如果有癞子牌取出癞子牌
    let laizi = pockers[4] === laiziPocker ? pockers.pop() : ''
    // 区分是否包含两张或两张以上牌面值的牌,检测是否同花
    let codePockers = {}, isHight = true, firstColor = pockers[0][1], isStaright = true
    for (let index = 0; index < pockers.length; index++) {
        const element = pockers[index];
        const code = CODE[element[0]], color = element[1]
        !codePockers[code] ? codePockers[code] = 1 : codePockers[code] += 1;
        (codePockers[code] > 1) && (isHight = false)
        isStaright = color !== firstColor ? false : isStaright
    }
    
    let codes = Object.keys(codePockers)

    let _checkFlush = {}, maxTimes = {}
    // 如果都是单牌有可能组成顺子
    if (isHight) {
        _checkFlush = checkFlush(codes, laizi)
    } else {
        // 获取牌面值出现最多的次数以及牌面值
        maxTimes = getCardsMaxNumber(codePockers, codes, laizi)
    } 

    let type = TYPE.NO;
    switch(true) {
        case (isStaright && _checkFlush.isMaxFlush): // 如果是最大的顺子且是同花，皇家同花顺
            type = TYPE.MAX_STRAIGHT_FLUSH
            break;
        case (isStaright && _checkFlush.isFlush): // 同花顺
            type = TYPE.STRAIGHT_FLUSH
            break;
        case (maxTimes.max >= 4): // 四条
            type = TYPE.BOMB
            break;
        case (maxTimes.isThreeZone): // 三带一对（葫芦）
            type = TYPE.THREE_ZONE
            break;
        case (!!isStaright): // 同花
            type = TYPE.STRAIGHT
            break;
        case (_checkFlush.isMaxFlush): // 最大的顺子 10、J、Q、K、A
            type = TYPE.MAX_FLUSH
            break;       
        case (_checkFlush.isFlush): // 普通顺子
            type = TYPE.FLUSH
            break;        
        case (maxTimes.max === 3): // 三条
            type = TYPE.THREE_OF_A_KIND
            break;        
        case (maxTimes.isTwoPair === 2):
            type = TYPE.TWO_PAIR
            break; // 两对
        case (maxTimes.max === 2): // 一对
            type = TYPE.ONE_PAIR
            break;
        default: // 单牌
            type = TYPE.HIGHTCARD;
            break;
    }

    return {type, codes, laizi}
}

// TODO 比较两手牌牌面值大小
function compairHightPockers(aPockers, bPockers) {
    // 单牌比较大小，不能组成顺子的牌
}

// 获取牌面值出现最多的次数
function getCardsMaxNumber(pockersObj, codes, laizi) {
    let max = 0, maxCode = -1, adjCode = -1, pairTimes=0, hasThreeKind = false, isThreeZone = false
    
    for (const key in pockersObj) {
        if (!pockersObj.hasOwnProperty(key)) continue;
        const element = pockersObj[key];
        if (max < element) {
            max = element
            maxCode = +key // key -> 确保为number
        } 
        
        if (element === 2) {
            pairTimes++;
            adjCode = +key // key -> 确保为number
        } 
        element === 3 && (hasThreeKind = true)
    }

    // 如果没有癞子是三带一对，如果有癞子且是两对
    if ((!laizi && pairTimes === 1 && hasThreeKind) || (!!laizi && pairTimes === 2)) {
        isThreeZone = true
    } else if (!!laizi) {
        max++
    }

    // 如果不是单牌，则返回出现多张相同牌的值
    if (max > 1) {
        codes = codes.splice(codes.indexOf(maxCode), 1)
        codes = codes.splice(codes.indexOf(adjCode), 1)
        adjCode !== -1 && codes.push(adjCode)
        codes.push(maxCode)
    }
    
    return {max, isThreeZone, isTwoPair: pairTimes === 2}
}

// 检测是否顺子 eg -- codes: [1, 3, 5, 7, 8] laizi = 'Xn'
function checkFlush(codes, laizi) {
    let _distance = codes[codes.length - 1] - codes[0]
    let isFlush = false, isMaxFlush = false
    // 如果是顺子，检查是否是最大的顺子
    if ((!!laizi && _distance <= 4) || (!laizi && _distance === 4)) {
        isFlush = true
        if ((codes[codes.length - 1] === CODE['A']) || (!!laizi && codes[0] === CODE['T'])) isMaxFlush = true
    }
    return {isFlush, isMaxFlush}
}

/**
 * 转换传入的牌值
 * @param {*} pockers string 一手牌 
 */
function turnOfPocker(pockers) {
    let  _pockers = []
    for (let i = pockers.length - 2; i >= 0; i = i - 2) { 
        let _str = pockers.slice(i, i+2)
        _pockers.push(_str)
    }
    // _pockers = _pockers.sort(function(x, y) {return CODE[x[0]] < CODE[y[0]]})
    return _pockers
}

/**
 * 七张选取五张牌,五张选取五张
 */
function permutation(arr) {
    let length = arr.length
    if(length === 5) return arr
    if(length === 7) return [
        [arr[0], arr[1], arr[2], arr[3], arr[4]],
        [arr[0], arr[1], arr[2], arr[3], arr[5]],
        [arr[0], arr[1], arr[2], arr[3], arr[6]],
        [arr[0], arr[1], arr[2], arr[4], arr[5]],
        [arr[0], arr[1], arr[2], arr[4], arr[6]],
        [arr[0], arr[1], arr[2], arr[5], arr[6]],
        [arr[0], arr[1], arr[3], arr[4], arr[5]],
        [arr[0], arr[1], arr[3], arr[4], arr[6]],
        [arr[0], arr[1], arr[3], arr[5], arr[6]],
        [arr[0], arr[1], arr[4], arr[5], arr[6]],
        [arr[0], arr[2], arr[3], arr[4], arr[5]],
        [arr[0], arr[2], arr[3], arr[4], arr[6]],
        [arr[0], arr[2], arr[3], arr[5], arr[6]],
        [arr[0], arr[2], arr[4], arr[5], arr[6]],
        [arr[0], arr[3], arr[4], arr[5], arr[6]],
        [arr[1], arr[2], arr[3], arr[4], arr[5]],
        [arr[1], arr[2], arr[3], arr[4], arr[6]],
        [arr[1], arr[2], arr[3], arr[5], arr[6]],
        [arr[1], arr[2], arr[4], arr[5], arr[6]],
        [arr[1], arr[3], arr[4], arr[5], arr[6]],
        [arr[2], arr[3], arr[4], arr[5], arr[6]],
    ]
}

module.exports = {
    onStart
}

