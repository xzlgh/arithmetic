// js模拟枚举类型

// 扑克牌花色，为了方便判断，直接使用对应的缩写
const COLOR = {
    'c': 0,  // 梅花
    'd': 1,  // 方块
    'h': 2,  // 红桃
    's': 3,  // 黑桃
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

// 顺子类型
const FLUSH_TYPE = {
    NO: 0, // 不是顺子
    MIN: 1, // 最小的顺子： A,2,3,4,5
    NORMAL: 2, // 普通顺子
    MAX: 3, // 最大的顺子： T,J,Q,K,A
}

module.exports = {
    COLOR,
    CODE,
    TYPE,
    FLUSH_TYPE
}
