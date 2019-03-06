// 引入C语言基础的头文件
#include<stdio.h>
// 引入C语言分配内存空间的头文件
#include<malloc.h>
// 引入C语言的库的头文件: malloc的使用
#include<stdlib.h>

// 为int类型创建一个别名，这里创建一个简单的链表，直接使用int类型
typedef int ELEMENT_TYPE;

// 声明创建一个链表节点的结构体
typedef struct ListNode {
    ELEMENT_TYPE element; // 节点的数据域
    ListNode* next; // 节点的指针域
}Node, *pNode;

// 创建链表函数声明和定义
pNode create(void) 
{
    int len; // 存储输入长度
    int val; // 存储输入值
    // 分配一个节点的空间，分配一个Node节点的存储单元，并将返回的首地址存储的pNode指针中
    pNode pHead = (pNode)malloc(sizeof(Node));
    // 检测内存分配是否成功
    if (pHead == NULL) 
    {
        // 在终端输出
        printf("分配节点失败！\n");
        // 退出控制台
        exit(-1);
    }
    // 创建一个尾节点
    pNode pTail = pHead;
    // 尾节点的指针域指向NULL
    pTail->next = NULL; 
    // 提示：
    printf("请输入您需要创建的链表节点数量：\n");
    // 等待用户输入
    scanf("%d", &len);
    // 分别接受用户输入数据
    for(int i = 0; i < len; i++) 
    {
        // 创建一个新的节点
        pNode pNew = (pNode)malloc(sizeof(Node));
        // 检查节点是否创建成功
        if (pNew == NULL)
        {
            printf("创建节点失败！\n");
        }
        // 提示用户输入节点数据
        printf("请输入第%d个节点数据：", i+1);
        scanf("%d", &val);
        // 将用户输入的节点赋值给新创建的节点
        pNew->element = val;
        // 将首节点的指针域指向新的节点
        pTail->next = pNew;
        // 新的节点变成尾节点
        pTail = pNew;
    }
    printf("创建链表成功！\n");
    // 返回头节点
    return pHead;
}

// 遍历链表函数
void TraverseList(pNode List) {
    // 创建一个空的节点指针, 将传入的链表头节点指向的内容赋给p
    pNode p = List->next;
    // 校验p
    if (p == NULL) printf("链表为空");
    // 逐个打印出链表值
    while(p != NULL)
    {
        int val = p->element;
        printf("%d, ", val);
        p = p->next;
    }
    // 控制台换行
    printf("\n");
}

// 插入链表操作,确定插入的位置，确定插入的值
void InsertList(pNode List, int pos, int val) 
{
    int position = 0;
    pNode p = List;    // 定义节点p指向头节点
    // 寻找pos节点的前驱结点
    while (p->next != NULL && position < pos - 1)
    {
        p = p->next;
        ++position;
    }
    pNode Tmp = (pNode)malloc(sizeof(Node));    // 分配一个临时节点用来存储要插入的数据
    if (Tmp == NULL)
    {
        printf("内存分配失败！\n");
        exit(-1);
    }
    // 插入节点
    Tmp->element = val;
    Tmp->next = p->next;
    p->next = Tmp;
}

//定义删除整个链表函数
void DeleteTheList(pNode List) {
    pNode p, Tmp;
    p = List->next;    // 定义指针P指向链表要删除的链表List的第一个点节点
    List->next = NULL;
    while (p != NULL) {
        Tmp = p->next;        // 临时Tmp指向要删除的节点的下个节点
        free(p);    // 释放指针P指向的节点
        p = Tmp;    // 重新赋值
    }
    printf("删除链表成功！\n");
}

//  删除链表中的第pos节点
int DeleteList(pNode List, int pos) {
    int position = 0;
    pNode p = List;    // 定义一个指针p指向链表头节点
    // 寻找pos节点位置的前驱节点
    while (p->next != NULL && position < pos - 1) {
        p = p->next;
        ++position;
    }

    if (pos > position) 
    {   
        printf("找不到您要删除的链表位置\n");
        return 0;
    }

    // 删除节点
    pNode Tmp = p->next;    // 定义临时指针Tmp指向要删除的节点
    p->next = Tmp->next;    // 使要删除节点的前驱结点指向其后驱节点
    free(Tmp);    // 释放删除节点的内存空间，防止内存泄漏
    Tmp = NULL;    // 使q指向空指针，防止产生野指针
}


int main() 
{      
    // 创建链表
    pNode list = NULL;
    // 提示用户操作
    while(true) 
    {
        printf("请输入您需要操作的内容（-1: 退出 0:创建 1：查询 2: 插入节点 3:删除链表中的某个节点 4：删除整个链表 ）：");        
        int scf;
        scanf("%d", &scf);
        switch(scf) {
            case -1:
                exit(-1);
                break;
            case 0: 
                list = create();
            case 1:
                TraverseList(list);
                break;
            case 2: 
                int pos;
                int value;
                printf("请输入您需要插入的节点位置和值: ");
                scanf("%d %d", &pos, &value);
                InsertList(list, pos, value);
                printf("插入后的链表：\n");
                TraverseList(list);
                break;
            case 3:
                int posit;
                printf("请输入您需要删除的节点位置: ");
                scanf("%d", &posit);
                DeleteList(list, posit);
                printf("删除操作执行后的链表：\n");
                TraverseList(list);
                break;
            case 4: 
                DeleteTheList(list);
                break;
            default: 
                break;      
        }
    }
    
    return 0;
}



