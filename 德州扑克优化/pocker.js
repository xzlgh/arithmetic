
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
    '1': 1,
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
    let aUserPockers = handleCardsLength === 5 ? getPockerTypeFive(aHandlePockers, laiziPocker) : getUserPockersSenven(aHandlePockers, laiziPocker)
    let bUserPockers = handleCardsLength === 5 ? getPockerTypeFive(bHandlePockers, laiziPocker) : getUserPockersSenven(bHandlePockers, laiziPocker)
    // console.log(aUserPockers, bUserPockers)
    // 比较两手牌大小
    return compairHandleHightPockers(aUserPockers, bUserPockers).result
}

// 获取七张牌的情况下最大的一手牌
function getUserPockersSenven(pockers, laiziPocker) {
    let userMaxPockers = { pockers: [], type: TYPE.NO }
    for (let index = 0; index < pockers.length; index++) {
        const element = pockers[index]
        // 获取用户的牌型
        let userPockers = getPockerTypeFive(element, laiziPocker)
        if (userMaxPockers.type < userPockers.type) {
            userMaxPockers = userPockers
        } else if (userMaxPockers.type === userPockers.type) {
            userMaxPockers = compairHandleHightPockers(userMaxPockers, userPockers).pockers
        }
    }
    return userMaxPockers
}

// 获取一手牌的牌型
function getPockerTypeFive(pockers, laiziPocker) {
    // 如果有癞子牌取出癞子牌
    let laizi = pockers[4] === laiziPocker ? pockers.pop() : ''
    // 区分是否包含两张或两张以上牌面值的牌,检测是否同花
    let codePockers = {}, isHight = true, firstColor = pockers[0][1], isStaright = true
    for (let index = 0; index < pockers.length; index++) {
        const element = pockers[index];
        const code = CODE[element[0]], color = element[1];
        !codePockers[code] ? codePockers[code] = 1 : codePockers[code] += 1;
        (codePockers[code] > 1) && (isHight = false);
        isStaright = color !== firstColor ? false : isStaright;
    }
    
    let codes = Object.keys(codePockers)

    let _checkFlush = {}, maxTimes = {}
    // 如果都是单牌有可能组成顺子
    if (isHight) {
        _checkFlush = checkFlush(codes, laizi)
    }
    // 获取牌面值出现最多的次数以及牌面值
    maxTimes = getCardsMaxNumber(codePockers, codes, laizi)

    let type = TYPE.NO;
    switch(true) {
        case (isStaright && _checkFlush.isMaxFlush): // 如果是最大的顺子且是同花，皇家同花顺
            type = TYPE.MAX_STRAIGHT_FLUSH
            break;
        case (isStaright && _checkFlush.isFlush): // 同花顺
            type = TYPE.STRAIGHT_FLUSH
            codes = _checkFlush.codes
            break;
        case (maxTimes.max >= 4): // 四条
            type = TYPE.BOMB
            codes = maxTimes.codes
            break;
        case (maxTimes.isThreeZone): // 三带一对（葫芦）
            type = TYPE.THREE_ZONE
            codes = maxTimes.codes
            break;
        case (!!isStaright): // 同花
            type = TYPE.STRAIGHT
            codes = maxTimes.codes
            break;
        case (_checkFlush.isMaxFlush): // 最大的顺子 10、J、Q、K、A
            type = TYPE.MAX_FLUSH
            break;       
        case (_checkFlush.isFlush): // 普通顺子
            type = TYPE.FLUSH
            codes = _checkFlush.codes
            break;
        case (maxTimes.max === 3): // 三条
            type = TYPE.THREE_OF_A_KIND
            codes = maxTimes.codes
            break;        
        case (maxTimes.isTwoPair): // 两对
            type = TYPE.TWO_PAIR
            codes = maxTimes.codes
            break; 
        case (maxTimes.max === 2): // 一对
            type = TYPE.ONE_PAIR
            codes = maxTimes.codes
            break;
        default: // 单牌
            type = TYPE.HIGHTCARD;
            codes = maxTimes.codes
            break;
    }
    return {type, codes, laizi}
}

/**
 * 比较两手牌牌面值大小
 * @param {*} aPockers 第一手牌 
 * @param {*} bPockers 第二手牌
 * @returns res->{pockers: 手牌， result: 0} 0 一样大，1表示第一手牌大，2表示第二手牌大
 */
function compairHandleHightPockers(aPockers, bPockers) {
    const _pairArr = [TYPE.HIGHTCARD, TYPE.FLUSH, TYPE.STRAIGHT_FLUSH, TYPE.STRAIGHT]
    const _pairMax = [TYPE.MAX_FLUSH, TYPE.MAX_STRAIGHT_FLUSH] 

    // 如果牌型不一样，直接比较牌型，得出比较结果
    if (aPockers.type !== bPockers.type) {
        return {
            result: aPockers.type > bPockers.type ? 1 : 2,
            pockers: aPockers.type > bPockers.type ? aPockers.codes : bPockers.codes
        }
    }

    // 如果都是最大顺子或者是皇家同花顺，那么直接返回相同
    if (_pairMax.indexOf(aPockers.type) > -1 && _pairMax.indexOf(bPockers.type) > -1) return { result: 0, pockers: aPockers } 

    // 单牌或者普通顺子,确定癞子具体为什么值, 有癞子又不是同花的的时候不可能有癞子
    if (!!aPockers.laizi && _pairArr.indexOf(aPockers.type) > -1) {
        aPockers.codes = ensureLaizi(aPockers)
        aPockers.laizi = ''
    }
    if (!!bPockers.laizi && _pairArr.indexOf(bPockers.type) > -1) {
        bPockers.codes = ensureLaizi(bPockers)
        bPockers.laizi = ''
    }
    
    // 按顺序比较大小
    let result = compairHightCards(aPockers.codes, bPockers.codes)
    return {
        result: result,
        pockers: result === 2 ? bPockers : aPockers
    }
}

/**
 * 按单张牌大小顺序比较大小,传入的两手牌的code值长度需一致
 * @param {*} aCodes 一手牌牌面值
 * @param {*} bCodes 一手牌牌面值
 * @returns 0: 同样大; 1: 第一个大; 2: 第二个大;
 */
function compairHightCards(aCodes, bCodes) {
    let len = aCodes.length - 1, result = 0
    for (let i = len; i >= 0; i--) {
        if (aCodes[i] === bCodes[i]) continue;
        result = +aCodes[i] > +bCodes[i] ? 1 : 2
        break;
    }
    return result
}

// 确定具体的癞子值
function ensureLaizi(userPockers) {
    const _pairFlush = [TYPE.FLUSH, TYPE.STRAIGHT_FLUSH]    
    // 癞子当A
    let _codes = userPockers.codes, len = userPockers.codes.length, isFlush = _pairFlush.indexOf(userPockers.type) > -1
    let hasA = +_codes[_codes.length - 1] === CODE['A']
    let _distance = +_codes[_codes.length - 1] - _codes[0]
    
    // 如果是单牌且最大的牌面值不是A,癞子当A
    if (!isFlush && !hasA) {
        _codes.push(CODE['A']+'')
        return _codes
    }

    // 如果是顺子,且癞子牌在两边
    if (isFlush && !hasA && _distance === 3) {
        let _tmp = +_codes[_codes.length - 1] + 1
        _codes.push(_tmp + '')
        return _codes
    }

    // 癞子在中间按顺序补值
    for (let i = len - 1; i > 0; i--) {
        let next = _codes[i-1] // 下一个值
        let cur = _codes[i] // 当前值
        if (cur - next > 1) {
            _codes.splice(i, 0, (cur - 1) + '');
            break;
        }
    }
    return _codes
}

// 获取牌面值出现最多的次数
function getCardsMaxNumber(pockersObj, codes, laizi) {
    let max = 0, maxCode = -1, adjCode = -1, pairTimes=0, hasThreeKind = false, isThreeZone = false, _codes = [...codes]
    for (const key in pockersObj) {
        if (!pockersObj.hasOwnProperty(key)) continue;
        const element = pockersObj[key];
        if (max <= element) {
            max = element
            maxCode = key // key -> 确保为number
        } 

        element === 3 && (hasThreeKind = true)
        if (element === 2) {
            pairTimes++;
            pairTimes === 1 && adjCode === -1 && (adjCode = key);
        }
    }
    // 如果没有癞子是三带一对，如果有癞子且是两对
    if ((!laizi && pairTimes === 1 && hasThreeKind) || (!!laizi && pairTimes === 2)) {
        isThreeZone = true
    } else if (!!laizi) {
        max++
    }

    // 如果不是单牌，则返回出现多张相同牌的值
    if (max > 1) {
        // 获取第一个需要插入的值
        let _firstInsert = maxCode
        let _secondInsert = adjCode !== -1 && adjCode !== maxCode && adjCode
        _codes.splice(_codes.indexOf(_firstInsert), 1)
        if (!!_secondInsert) {
            _codes.splice(_codes.indexOf(_secondInsert), 1)
            _codes.push(_secondInsert)            
        }
        _codes.push(_firstInsert)        
    }

    return {max, isThreeZone, isTwoPair: pairTimes === 2, codes: _codes}
}

// 检测是否顺子 eg -- codes: [1, 3, 5, 7, 8] laizi = 'Xn'
function checkFlush(codes, laizi) {
    let _codes = [...codes]
    let _distance = _codes[_codes.length - 1] - _codes[0] // 最大牌面值和最小牌值差
    let hasA = +_codes[_codes.length - 1] === CODE['A'] // 手牌中有A
    let maxCode = hasA ? _codes[_codes.length - 2] : _codes[_codes.length - 1] // 最大的code值
    // 是否顺子，是否最大的顺子
    let isFlush = false, isMaxFlush = false
    // 如果是顺子，检查是否是最大的顺子
    if ((!!laizi && _distance <= 4) || (!laizi && _distance === 4)) {
        isFlush = true
        if (hasA || (!!laizi && _codes[0] === CODE['T'])) isMaxFlush = true
    }

    // 如果不是最大的顺子且手中有A，那么A则必定最为最小值1
    let _minDistance = maxCode - _codes[0]
    if (!isMaxFlush && hasA && +maxCode <= 5 && ((!laizi && _minDistance === 3) || (!!laizi && _minDistance <= 3))) {
        isFlush = true
        _codes.pop()
        _codes.unshift('1')
    }
    // console.log(isFlush, isMaxFlush, codes, laizi)
    return {isFlush, isMaxFlush, codes: _codes}
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
    _pockers = _pockers.sort(function(x, y) {return CODE[x[0]] > CODE[y[0]]})
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

