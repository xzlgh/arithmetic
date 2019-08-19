//  加载测试的数据
const fiveCards = require('./testData/five_result')
const fiveLaiziCards = require('./testData/five_with_lazarillo_result')
const sevenCards = require('./testData/seven_result')
const sevenLaiziCards = require('./testData/seven_cards_with_lazarillo_result')
const poker = require('./pocker')

function onTest(sourcePockers, laizi) {
    let total=0, success = 0, err = 0
    var startTime = new Date().getTime()
    sourcePockers.forEach((currentItem, index) => {
        total++;
        let a = currentItem['alice'], b = currentItem['bob']
        let res = poker.onStart(a, b, laizi)
        if (res !== currentItem.result) {
            console.log("error data:", currentItem, index)
            err++
        } else success++
    })
    var endTime = new Date().getTime()
    console.log("total: ", total)
    console.log("success: ", success, "  error: ", err)
    console.log(endTime - startTime)
}

function main() {
    // onTest(sevenLaiziCards, 'Xn')
    onTest([sevenLaiziCards[605]], 'Xn')
}

main()
