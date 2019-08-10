// enum是保留关键字
const { TYPE, CODE, COLOR, FLUSH_TYPE } = require('./enum')

//#region  ======================================= 牌型检测 ===================================================

/**
 * 获取一手牌的牌型（eg: 同花顺，三张）
 * @param {Object} handPocker 一手牌
 */
function getPockerType(handPocker) {
    let staright = isStaright(handPocker)
    let flush = isFlush(handPocker)
    let bomb = isBomb(handPocker)
    let threeZone = isThreeZone(handPocker)
    let threeOfAkind = isThreeOfAkind(handPocker)
    let twoPair = isTwoPair(handPocker)
    let onePair = isOnePair(handPocker)
    // 皇家同花顺
    if (staright.flag && flush.type === FLUSH_TYPE.MAX) return {type: TYPE.MAX_STRAIGHT_FLUSH, codes: flush.codes}
    // 同花顺
    else if (staright.flag && flush.type === FLUSH_TYPE.NORMAL) return {type: TYPE.STRAIGHT_FLUSH, codes: flush.codes}
    // 四条 
    else if (bomb.flag) return {type: TYPE.BOMB, codes: bomb.codes}
    // 三带一对
    else if (threeZone.flag) return {type: TYPE.THREE_ZONE, codes: threeZone.codes}
    // 同花
    else if (staright.flag) return {type: TYPE.STRAIGHT, codes: staright.codes}
    // 最大的顺子
    else if (flush.type === FLUSH_TYPE.MAX) return {type: TYPE.MAX_FLUSH, codes: flush.codes}
    // 顺子
    else if (flush.type === FLUSH_TYPE.NORMAL) return {type: TYPE.FLUSH, codes: flush.codes}
    // 三条
    else if (threeOfAkind.flag) return {type: TYPE.THREE_OF_A_KIND, codes: threeOfAkind.codes}
    // 两对
    else if (twoPair.flag) return {type: TYPE.TWO_PAIR, codes: twoPair.codes}
    // 对子（一对）
    else if (onePair.flag) return {type: TYPE.ONE_PAIR, codes: onePair.codes}
    // 散牌，没有任何牌型
    else return {type: TYPE.HIGHTCARD, codes: isHight(handPocker)}
}
// 同花
function isStaright(handPocker) {
    let cards = handPocker.cards
    // 检测是否同花
    let isSameColor = true
    for (let i = 0, len = cards.length - 1; i < len; i++) {
        if (COLOR[cards[i].color] !== COLOR[cards[i + 1].color]) isSameColor = false
    }
    // 获取散牌的权重值
    let _codes = isHight(handPocker)
    return {flag: isSameColor, codes: _codes}
}

/**
 * 顺子
 * @param {Object} handPocker 手牌
 * @returns {Object} 顺子类型
 */
function isFlush(handPocker) {
    let _cards = handPocker.cards.concat(), num = 0, hasA = false, maxA = false
    // 顺子权重
    let weight = 0;
    
    // 数组去重复
    _cards = unique(_cards)
    // 如果去重复后加上癞子牌没有五张牌,或者牌的数量不是5，那么直接返回false，不可能有顺子存在 
    if (_cards.length + handPocker.laiziNumber !== 5) return {type: FLUSH_TYPE.NO, codes: []}
    // 如果五张牌全部是癞子，直接返回最大顺子牌型
    if (_cards.length === 0 && handPocker.laiziNumber === 5) return {type: FLUSH_TYPE.MAX, codes: ['60']}
    // 如果有四张是癞子牌，直接返回顺子
    if (_cards.length === 1 && handPocker.laiziNumber === 4) {
        let _card = CODE[_cards[0].code]
        // 计算权重（根据求和公式计算）往最大的组合，a1项就是_card
        weight = _card * 5 + (5 * 4) / 2
        // 能够组成最大的顺子，返回最大的顺子
        if (CODE[_cards[0].code] >= CODE['T']) return {type: FLUSH_TYPE.MAX, codes: []}
        // 只能组成普通顺子
        return {ype: FLUSH_TYPE.NORMAL, codes: [weight]}
    }

    // 对牌值进行检测,获取组成顺子需要的癞子数量,先检测前四张，最大的牌需要检测是否是A,做特殊顺子的判断
    for (let i = 0, len = _cards.length - 2; i < len; i++) {
        weight += CODE[_cards[i].code]
        let dist = CODE[_cards[i + 1].code] - CODE[_cards[i].code]
        // 如果不能够组成顺子，癞子来替换
        if ( dist === 1)  continue
        num += dist - 1
        // 计算顺子牌权重
        let a1 = CODE[_cards[i].code] + 1
        weight += a1 * (dist - 1) + ((dist - 1) * (dist -2)) / 2 
    } 
    // 加上倒数第二张牌的权重和倒数第一张牌的权重
    weight += CODE[_cards[_cards.length-2].code]

    // 检测最大的牌是否是A
    if (CODE[_cards[_cards.length - 1].code] !== CODE["A"]) {
        weight += CODE[_cards[_cards.length - 1].code]
        maxA = true
        // 如果不存在A
        let dist = CODE[_cards[_cards.length - 1].code] - CODE[_cards[_cards.length - 2].code]
        // 如果不能够组成顺子，癞子来替换
        if ( dist !== 1) {
            num += dist - 1
            // 计算顺子牌权重缺的牌值权重
            let a1 = CODE[_cards[_cards.length - 1].code] + 1
            weight += a1 * (dist - 1) + ((dist - 1) * (dist -2)) / 2 
        }
    } else {
        hasA = true
        // 存在A,且A只能作为最大值来用
        if (CODE[_cards[0].code] >= CODE["T"]) {
            let dist = CODE["A"] - CODE[_cards[_cards.length - 2].code]
            if ( dist !== 1) {
                num += dist - 1
                // 计算顺子牌权重缺的牌值权重
                let a1 = CODE[_cards[_cards.length - 1].code] + 1
                weight += a1 * (dist - 1) + ((dist - 1) * (dist -2)) / 2 
            } else weight += CODE[_cards[_cards.length - 1].code]
        } else if (CODE[_cards[_cards.length - 2].code] <= CODE["5"]) {
            // 把A当1来用，看缺少的癞子数量
            let dist = CODE[_cards[0].code] - 1
            if ( dist !== 1) {
                num += dist - 1
                // 计算顺子牌权重缺的牌值权重
                let a1 = 1
                weight += a1 * (dist - 1) + ((dist - 1) * (dist -2)) / 2 
            } else weight += 1
        // 否则含有A，又不是不可能组成最大顺子也不可能组成最小顺子，那么就不是顺子
        } else return {type: FLUSH_TYPE.NO, codes: []}
    }

    // 如果需要的癞子数不能满足，直接返回不是顺子
    if (num > handPocker.laiziNumber) return  {type: FLUSH_TYPE.NO, codes: []}

    // 是顺子
    if (hasA && maxA) return {type: FLUSH_TYPE.MAX, codes: ['60']}

    return {type: FLUSH_TYPE.NORMAL, codes: [weight]}
}

// 四条
function isBomb(handPocker) {
    let _cards = handPocker.cards.concat(), laiziNumber = handPocker.laiziNumber
    // 保存牌面值出现次数
    let {_tmp, keys} = conutArrEl(_cards)
    // 检测是否能满足四条
    let { flag, obj, codes, laiziNum } = checkCountEl(keys, _tmp, 4, laiziNumber)
   
    // 如果单独的一张是癞子牌，保存权重为A最大的牌值
    if (laiziNum > 0) codes.push(CODE['A'])
    for (let i = 0, len = keys.length; i < len; i++) {
        if (!obj[keys[i]]) continue
        codes.push(keys[i])
    }
    return {flag, codes: flag ? codes : []}
}

// 三带一对
function isThreeZone(handPocker) {
    let _cards = handPocker.cards.concat(), laiziNumber = handPocker.laiziNumber
    // 获取每张牌的数量
    let {_tmp, keys} = conutArrEl(_cards)
    // 检查三张
    let { flag, obj, codes, laiziNum } = checkCountEl(keys, _tmp, 3, laiziNumber)
    // 如果不能组成三张，直接返回false
    if (!flag) return {flag: false, codes: []}
    // 检查是否还能够组成一对
    let result = checkCountEl(keys, obj, 2, laiziNum) 
    // 如果能够组成三带一对，返回结果和权重
    if (result.flag) return {flag: true, codes: [...codes, ...result.codes]}

    return {flag: false, codes: []}
}

// 三条
function isThreeOfAkind(handPocker) {
    let _cards = handPocker.cards.concat(), laiziNumber = handPocker.laiziNumber
    // 获取每张牌的数量
    let {_tmp, keys} = conutArrEl(_cards)

    // 检查三张
    let { flag, obj, codes } = checkCountEl(keys, _tmp, 3, laiziNumber)
    // 如果不能组成三张，直接返回false
    if (!flag) return {flag: false, codes: []}

    for (let i = 0, len = keys.length; i < len; i++) {
        if (!obj[keys[i]]) continue
        codes.push(keys[i])
    }
    return {flag: true, codes: codes}
}

// 两对
function isTwoPair(handPocker) {
    let _cards = handPocker.cards.concat()
    let laiziNumber = handPocker.laiziNumber
    let {_tmp, keys} = conutArrEl(_cards)
    let num = 0
    let _codes =[]
    for (let i = 0, len = keys.length; i < len; i++) {
        if (!_tmp[keys[i]]) continue
        if (_tmp[keys[i]] === 2) {
            num++
            isTree = true
            _tmp[keys[i]] = null
            _codes.push(keys[i])
        } else if (_tmp[keys[i]] + laiziNumber >= 2) {
            num++ 
            isTree = true
            laiziNumber -= 2 - _tmp[keys[i]]
            _tmp[keys[i]] = null
            _codes.push(keys[i])
        }
    }
    // 如果不够两对直接返回false
    if (num < 2) return {flag: false, codes: []}
    
    for (let i = 0, len = keys.length; i < len; i++) {
        if (!_tmp[keys[i]]) continue
        _codes.push(keys[i])
    }

    return {flag: true, codes: _codes}
}

// 一对（对子）
function isOnePair(handPocker) {
    let _cards = handPocker.cards.concat()
    let laiziNumber = handPocker.laiziNumber
    let ispair = false, _codes = []
    let {_tmp, keys} = conutArrEl(_cards)

    // 检测对子
    for (let i = 0, len = keys.length; i < len; i++) {
        if (!_tmp[keys[i]]) continue
        if (_tmp[keys[i]] === 2) {
            ispair = true
            _tmp[keys[i]] = null
            _codes.push(keys[i])
        } else if (_tmp[keys[i]] + laiziNumber >= 2) {
            ispair = true
            laiziNumber -= 2 - _tmp[keys[i]]
            _tmp[keys[i]] = null
            _codes.push(keys[i])
        }
    }
    // 没有对子直接返回
    if (!ispair) return {flag: false, codes: []}
    // 如果有对子，依次返回权重值
    for (let i = 0, len = keys.length; i < len; i++) {
        if (!_tmp[keys[i]]) continue
        _codes.push(keys[i])
    }
    return {flag: true, codes: _codes}
}

// 散牌
function isHight(handPocker) {
    let cards = handPocker.cards.concat()
    // 获取权重
    let _codes = cards.map(item => {
        return CODE[item.code]
    })
    // 按从大到小的顺序排序
    _codes.sort((x, y) => {
        return x < y
    })
    return _codes
}

/**
 * 检测对象中的值出现次数是否达到要求
 * @param {Arrary} keys 对象key值抽出类的数组
 * @param {Object} obj 检测对象： eg: {1: 3, 5:4}
 * @param {Number} count 需要检测的次数
 * @param {Number} laiziNumber 当前的癞子数量
 * @return {Objec} eg: {flag: true, laiziNumber: 1, codes: []} codes保存权重
 */
function checkCountEl(keys, obj, count, laiziNumber) {
    let flag = false, _codes=[], laiziNum = laiziNumber
    for (let i = 0, len = keys.length; i < len; i++) {
        if (!obj[keys[i]]) continue
        if (obj[keys[i]] === count ) {
            flag = true
            obj[keys[i]] = null
            _codes.push(keys[i])
        } else if (obj[keys[i]] + laiziNum >= count) {
            flag = true
            obj[keys[i]] = null
            laiziNum -= count - obj[keys[i]]
            _codes.push(keys[i])
        }
    }
    return {flag, obj, laiziNum, codes: _codes}
}

// 统计一手牌中某一个值出现的次数
function conutArrEl(arr) {
    let _tmp = {}
    arr.map(card => {
        if (_tmp[CODE[card.code]]) _tmp[CODE[card.code]] += 1
        else _tmp[CODE[card.code]] = 1
    })
    // 如果有三条，按照权重从大到小push到数组里面去
    let keys = Object.keys(_tmp)
    // 从大到小的顺序排序
    keys.sort((x, y) => {
        return parseInt(x) < parseInt(y)
    })
    return {_tmp, keys}
}

//#endregion  =================================================================

//#region  ======================================= 当前文件夹公共逻辑函数 ===================================================
/**
 * 比较两手牌的权重值大小
 * @param {*} pockerA 第一个人的手牌
 * @param {*} pockerB 第二个人的手牌
 * @returns {Number} -1 表示第一个人的牌值大，0表示两个人牌值一样大， 1表示第二个人的牌值大
 */
const compareWeightCode = function(pockerA, pockerB) {
    let weightCodes1 = pockerA.weightCode, weightCodes2 = pockerB.weightCode
    if (weightCodes1.length !== weightCodes2.length) {
        console.log("获取权重错误")
        return
    }
    // 循环遍历数组中每一个值的大小
    for (let i = 0, len = weightCodes1.length; i < len; i++) {
        let weight1 = parseInt(weightCodes1[i])
        let weight2 = parseInt(weightCodes2[i])
        if (weight1 !== weight2) return weight1 > weight2 ? -1 : 1
    }
    // 如果所有权重值都相同，则一样大
    return 0
}

/**
 * 比较两个玩家牌的大小
 * @param {Array} pockers 所有玩家牌
 */
const comparePockerAndWeight = function(pockers) {
    let handPockers = pockers
    // 每个人的手牌两两比较找出最大的一个, result: 0 表示都一样大
    let maxHandPocker=handPockers[0], maxType = handPockers[0].pockerType, result = 1, maxHandPockers = []
    for (let j = 1, len = handPockers.length; j < len; j ++) {
        let handPocker = handPockers[j]
        if (maxType < handPocker.pockerType) {
            maxHandPocker = handPocker
            maxType = handPocker.pockerType
            result = j + 1
            maxHandPockers = []
            continue
            // 如果当前的用户手牌和最大的牌型相等，则开始比较牌面值，通过牌面值，获取大小
        } else if (maxType === handPocker.pockerType) {
            // 如果已经是没有可比性的牌型，直接返回相同牌型
            if (maxType === TYPE.MAX_STRAIGHT_FLUSH || maxType === TYPE.MAX_FLUSH) {
                maxHandPockers.push(maxHandPocker)
                maxHandPockers.push(handPocker)
                result = 0
                continue
            } 
            // 有可比性，比较权重大小
            let res = compareWeightCode(maxHandPocker, handPocker)
            // 如果后面的手牌比较大，保存较大手牌的用户信息
            if (res === 1) {
                maxHandPocker = handPocker
                result = j + 1
                maxHandPockers = []
                // 如果一样大
            } else if (res === 0) {
                maxHandPockers.push(maxHandPocker)
                maxHandPockers.push(handPocker)
                result = 0
            }
            // 否则不操作
        }
    }
    return result
}

/**
 * 将一手字符串的牌值转换成自定义的一手牌,且取出癞子牌
 * @param {String} str 预先设定一手牌
 * @returns {Array} eg:  { cards: [{code: 8, color: h},{code: 7, color: d},{code: 6, color: c},{code: T, color: s}...], laizi: []}
 */
const strTurnToCards = function(str, lazarillo) {
    // 校验传入值
    if (typeof str !== 'string') return {laizi: {}, cards: {}}
    let laizi = [], cards = []
    // 字符串转成数组
    let _cards = str.split('')
    // 奇数下标为花色，偶数下标为牌面值
    for (let i = _cards.length - 2; i >= 0; i = i - 2) {
        let _card = {
            code: _cards[i], // 牌面值
            color: _cards[i + 1] // 花色
        }
        // 检测是否是癞子，如果是癞子牌，添加到癞子牌列表  
        if (lazarillo && _cards[i] === lazarillo) {
            laizi.push(_card)
        } else {
            // 如果不是癞子牌，添加到普通牌值列表
            cards.push(_card)
        }
    }
    // 排序一手牌的牌值
    cards = cards.sort((x, y) => {
        // 按从小到大的顺序排序
        return CODE[x.code] > CODE[y.code]
    })
    return {laizi, cards}
}

/**
 * 拆分出玩家
 * @param {Object} handPockers 参加游戏的人和扑克牌组成的对象
 * @returns {Array} [Object,Object] 每个object对应一个玩家
 */
const getUser = function(userPocker) {
    let pockers = []
    for (const key in userPocker) {
        if (!userPocker.hasOwnProperty(key)) continue
        const element = userPocker[key];
        if (typeof element !== 'string') continue
        pockers.push({
            user: key,
            pocker: element
        })
    }
    return pockers
}

/**
 * 初始化手牌（转化为自己设定的牌型）（五张牌的情况）
 * @param {Objcet} handPockers 待初始化的牌
 * @param {String} lazarillo 癞子牌
 * @returns {Array} pockers 自己设定的牌型
 */
const initPocker = function (handPockers, lazarillo) {
    const _pockers = handPockers
    // 获取用户
    let pockers = getUser(_pockers)
    pockers.map(userPocker => {
        const newCards = strTurnToCards(userPocker.pocker, lazarillo) 
        userPocker.laizi = newCards.laizi // 保存癞子牌
        userPocker.cards = newCards.cards // 保存普通牌
        userPocker.laiziNumber = newCards.laizi.length  // 添加癞子牌数量字段
    })
    return pockers
}

/**
 * 开始比较牌大小
 * @param {Array} handPockers 待比较的牌（有多少手牌，就有多少个数组元素）
 * @returns {Number}  arrIndex 返回数组元素的下标（即第几手牌最大） 如果为-1表示平手牌，0表示第一个人
 */
const comparePockers = function (handPockers) {
    // 检验是否是数组
    if (!(handPockers instanceof Array)) return 
    // 获取牌的牌型
    handPockers.map(item => {
        let check = getPockerType(item)
        item.pockerType = check.type
        item.weightCode = check.codes
    })
    // 比较获取最终的result结果
    return {result: comparePockerAndWeight(handPockers)}
}

//#endregion ==========================================================================

//#region  ======================================= 对外的接口（API） ===================================================
/**
 * 游戏开始入口
 * @param {Object} handPockers 待测试的几手牌
 * @param {*} lazarillo 
 */
function gameStart (handPockers, lazarillo) {
    // 初始化传入的牌
    let pockers = initPocker(handPockers, lazarillo)
    // 比较牌大小
    return comparePockers(pockers)
}

/**
 * 游戏开始入口（七张牌-或更多张选取5张）
 */
function gameStartMore (handPockers, lazarillo) {
    // 获取玩家以及手牌
    let userPockers = getUser(handPockers, lazarillo)

    // 将玩家的牌进行排列组合
    userPockers.map(handPocker => {
        // 将玩家的牌拆开每张单独的牌
        let  cards = handPocker.pocker
        let cardsArr = cards.split('')
        let _arr = []
        for (let i = 0, len = cardsArr.length; i < len; i=i+2) {
            _arr.push(cardsArr[i]+cardsArr[i+1]+'')
        }
        // 7张牌选出5张牌，进行牌型判断
        let p = permutation(_arr, 5)
        handPocker.zuhe = p
    })

    // 获取每种组合的玩家手牌牌型
    userPockers.map(handPocker => {
        let pockerTypeArr = [] // 对象数组，存储牌型和权重牌
        handPocker.zuhe.map(item => {
            // 转换之后，赋值给当前的手牌的cards，获取牌型
            let tmp = item.split(",").join("")
            // 将字符串格式手牌转换成自定义格式的手牌
            const newCards = strTurnToCards(tmp, lazarillo) 
            handPocker.laizi = newCards.laizi // 保存癞子牌
            handPocker.cards = newCards.cards // 保存普通牌
            handPocker.laiziNumber = newCards.laizi.length  // 添加癞子牌数量字段
            // 获取手牌牌型
            let check = getPockerType(handPocker)
            pockerTypeArr.push({
                pockerType: check.type,
                weightCode: check.codes,
                cards: newCards.cards
            })
        })
        handPocker.pockerTypeArr = pockerTypeArr
    })

    // 获取每个人的牌的最大牌型和最大权重的牌
    userPockers.map(handPocker => {
        let maxType = handPocker.pockerTypeArr[0].pockerType, weightCode = handPocker.pockerTypeArr[0].weightCode        // 遍历每种牌的组合情况
        let _maxpocker = handPocker.pockerTypeArr[0].cards
        handPocker.pockerTypeArr.map(item => {
            // 如果牌型没有item大，保存item信息为最大的值
            if (maxType < item.pockerType) {
                maxType = item.pockerType
                _maxpocker = item.cards
                weightCode = item.weightCode
            // 如果牌型相同比较权重大小
            } else if (maxType === item.pockerType) {
                // 有可比性，比较权重大小
                let res = compareWeightCode({weightCode}, item)
                // 如果后面的手牌比较大，保存较大手牌的用户信息
                if (res === 1) {
                    maxType = item.pockerType
                    _maxpocker = item.cards
                    weightCode = item.weightCode
                }
            }
        })
        handPocker.pockerType = maxType
        handPocker.cards = _maxpocker
        handPocker.weightCode = weightCode
    })

    // 比较玩家手牌的大小
    return {result: comparePockerAndWeight(userPockers)}
}

module.exports = {
    gameStart,
    gameStartMore
}
//#endregion =======================================

//#region  ======================================= 工具类函数 ===================================================
// 数组去重复
function unique(arr) {
    let obj = {}, _tmp = []
    _tmp = arr.reduce((cur, next) => {
        obj[next.code] ? "" : obj[next.code] = true && cur.push(next);
        return cur;
    }, [])
    return _tmp
}
// 数组排列组合函数
function permutation(arr, x) {
    let result = new Set()
    let all = []
    let tmp = [...arr]
    do {
        // 如果tmp的长度为所需要的取值个数，则保存组合好的值
        if(tmp.length == x) {
            result.add(tmp.sort().join(','))
        }else {
            // 每次先去除一张牌，保存剩下的组合
            for(let i = 0; i < tmp.length; i++) {
                var newArr = [...tmp];
                newArr.splice(i, 1);
                all.push(newArr)
            }
        }
        tmp = all.pop()
    } while(all.length > 0)
    // 返回最终结果
    return [...result]
}
//#endregion =================================================

