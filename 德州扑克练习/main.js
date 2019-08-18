/**
 * 游戏中所有的牌型（依次变小）：
 * - 皇家同花顺 - 同花顺 - 四条 - 满堂彩（葫芦，三带二）- 同花 - 顺子 - 三条 - 两对 - 一对 - 单牌
 * 
 * 人数： 可多人，可两人
 * 
 * 特殊规则： 可指定癞子牌
 * 
 * 一手牌数量： 可五张，可七张 —— 写成可以多张牌
 * 
 * 当前传入牌型结构：
 * {牌持有者：手牌，牌持有者：手牌，比牌结果}
 * {"alice":"8sAhAc7sJc6hQd","bob":"6s7c8sAhAc7sJc","result":0}
 * 
 * 自己设定的牌型结构方便比牌：
 * [{一手牌(牌的花色-type,牌值-code,牌拥有者-user)},{一手牌}]
 * eg: [{cards: [{code: 8, color: h},{code: 7, color: d},{code: 6, color: c},{code: T, color: s}], pocker: '8h7d6cTs', user: 'bob', laizi: [{code: '', color: ''}], laiziNum: 1 }
 * ,{pocker: "", cards: [], user: ...}]
 */

//  加载测试的数据
const cards_test_seven = require('./testData/seven_cards_with_lazarillo_result')
const cards_seven = require('./testData/seven_result')
const cards_test_five = require('./testData/five_with_lazarillo_result')
const cards_five = require('./testData/five_result')
const Pocker = require('./Poker')

// 五张不带癞子
function fiveTest(cards) {
    let success = 0, err = 0
    let total = cards.length
    let startTime = new  Date().getTime()
    cards.map((item, index) => {
        let res = Pocker.gameStart(item, 'X')
        if (res.result !== item.result) {
            err++
            console.log('============================错误结果=============')
            console.log('错误值位置：', index + 1) // 显示行数
            console.log('返回值：', res)
            console.log('原始数据：', item)
        } else success++
    })
    let endTime = new Date().getTime()
    console.log("test total: ", total)
    console.log("test success: ", success)
    console.log("test error:", err)
    console.log("开始时间：", startTime, '结束时间：', endTime)
    console.log("耗时：", endTime - startTime)
}

// 七张牌不带癞子的情况
function sevenTest(cards) {
    success = 0, err = 0
    total = cards.length
    startTime = new  Date().getTime()
    cards.map((item, index) => {
        let res = Pocker.gameStartMore(item, 'X')
        if (res.result !== item.result) {
            err++
            console.log('============================错误结果=============')
            console.log('错误值位置：', index + 1) // 显示行数
            console.log('返回值：', res)
            console.log('原始数据：', item)
        } else success++
    })
    let endTime = new Date().getTime()
    console.log("test total: ", total)
    console.log("test success: ", success)
    console.log("test error:", err)
    console.log("开始时间：", startTime, '结束时间：', endTime)
    console.log("耗时：", endTime - startTime)
}

function main () {
    console.log('=========== 五张不带癞子的情况 ===========')
    fiveTest(cards_five)
    console.log('=========== 五张带癞子的情况 ===========')
    fiveTest(cards_test_five)
    console.log('=========== 七张不带癞子的情况 ===========')
    sevenTest(cards_seven)
    console.log('=========== 七张带癞子的情况 ===========')
    sevenTest(cards_test_seven)
}

main()
