// 添加节点函数
function addNode(list, node) {
  if (JSON.stringify(list.next) === '{}') {
    list.next = node
  } else addNode(list.next, node)
}

// 创建链表
function createList(arr) {
  // 新创建一个节点
  let list = {data: 'head', next: {}}
  // 生成一个链表
  arr.map(item => {
    let _obj = {
      data: item,
      next: {}
    }
    addNode(list, _obj)
  })
  return list
}

// 遍历链表
function traverList(list) {
  if (!list) {
    console.log("链表为空")
    return
  }
  let tmp = list.next
  if (JSON.stringify(tmp) === '{}') {
    console.log("链表为空!")
    return
  }
  // 循环打印出节点里面的数据
  while (JSON.stringify(tmp.next) !== '{}') {
    console.log(tmp.data)
    tmp = tmp.next
  }
  // 最后一个节点也打印出来
  console.log(tmp.data)
}

// 遍历链表中的某个值
function traveListOfElement(list, element) {
  if (!list) {
    console.log("链表为空")
    return
  }
  // 将首节点赋值给tmp
  let tmp = list.next
  if (JSON.stringify(tmp) === '{}') {
    console.log("在链表中找不到您要遍历的值!:", element)
    return
  }
  // 遍历链表
  let pos = 0
  while(JSON.stringify(tmp.next) !== '{}') {
    pos++
    if (tmp.data === element) {
      console.log("找到了您需要遍历的值,该值所在的节点位置:", pos, "  值:", element)
    }
    tmp = tmp.next
  }
  if (tmp.data === element) {
    console.log("该值在尾节点上,值为: ", element)
  }
}

// 在链表中插入节点
function insertElement(list, pos , element) {
  if (!list) {
    console.log("链表为空")
    return
  }
  // 将list的头节点赋值给tmp
  let tmp = list
  let position = 0
  // 遍历链表中的节点
  while(JSON.stringify(tmp.next) !== '{}' && position < pos - 1) {
    position++
    tmp = tmp.next
  }

  // 新建一个节点
  let _obj = {
    data: element,
    next: {}
  }

  // 如果希望插入节点的位置,超过链表的长度,则直接插入到末尾
  if (pos > position + 1) {
    tmp.next = _obj
    return
  }

  // 插入节点
  _obj.next = tmp.next
  tmp.next = _obj
}

// 删除链表中某个位置的节点
function deletPos(list, pos) {
  if (!list) return
  let tmp = list
  let position = 0
  while(tmp.next && JSON.stringify(tmp.next) !== '{}' && position < pos - 1) {
    position++
    tmp = tmp.next
  }
  // 如果要删除的位置不是当前节点
  if (tmp.next &&JSON.stringify(tmp.next) === '{}') {
    console.log("没找到您要删除的节点位置:")
    return
  }
  // 删除后一个节点, js不需要释放内存空间
  let p = tmp.next
  tmp.next = p.next
}

// 删除链表中某个符合条件的节点
function deleteElement(list, element) {
  if (!list) return
  // tmp为链表首节点
  let tmp = list.next
  // pre为链表前一个节点
  let pre = list
  while(tmp.next && JSON.stringify(tmp.next) !== '{}') {
    // 如果当前节点等于要删除的节点
    if (tmp.data === element) {
      // 将当前节点的下一个节点赋值给p
      let p = tmp.next
      // 将前一个节点的下一个节点指向p
      pre.next = p
      // tmp指向下一个节点p
      tmp = p
    } else {
      // 移到下一个节点
      pre = tmp
      tmp = tmp.next
    }
  }
  // 如果最后一个节点的值是需要删除的节点值,那么删除节点
  if (tmp.data === element) {
    // 删除当前的tmp节点
    pre.next = {}
  }
}


// 主函数
function main() {
  console.log("创建节点:")
  let listData = [3, 2, 5, 3, 6, 7]
  let list = createList(listData)
  console.log(list)
  console.log("遍历节点元素值:")
  traverList(list)
  console.log("遍历节点中的3出现的位置:")
  traveListOfElement(list, 3)
  console.log("插入节点: 11 到第3个位置")
  insertElement(list, 3, 11)
  traverList(list)
  console.log("删除链表中第3个节点:")
  deletPos(list, 3)
  traverList(list)
  console.log("删除这个链表中的3节点:")
  deleteElement(list, 3)
  traverList(list)
  console.log("删除这个链表:")
  list = null
  traverList(list)
}

main()


