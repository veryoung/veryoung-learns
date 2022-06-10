/** 链表
 * 1. 链表中的每一个节点至少包含两个部分：数据域和指针域。
 * 2. 链表中的每一个节点的数据域都是唯一的，但指针域可以重复出现。
 * 3. 链表中的每一个节点的指针域都是指向下一个节点的指针。
 * 4. 链表中的每一个节点的指针域都可以为空，即指针域可以为空。
 * 5. 链表中的每一个节点，通过指针域的值,形成一个线性结构
 * 6. 查找节点O(n),插入节点O(1),删除节点O(1)
 * 7. 不适合快速的定位数据，适合动态的插入和删除数据的应用场景
 */

#include <iostream>
using namespace std;

struct node
{
    node(int data) : data(data), next(NULL) {}
    int data;
    node *next;
};

int main()
{
    node *head = NULL;
    head = new node(1);
    head->next = new node(2);
    head->next->next = new node(3);
    head->next->next->next = new node(4);

    node *p = head;

    while (p != NULL)
    {
        cout << p->data;
        p = p->next;
    }
    cout << endl;

    return 0;
} 
