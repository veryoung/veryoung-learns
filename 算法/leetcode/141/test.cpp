/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

class Solution {
public:
    bool hasCycle(ListNode *head) {
         if (head == NULL) return 0;
        ListNode *p = head;
        ListNode *q = head->next;
        while ( p != q && q && q->next) {
            p = p->next;
            q = q->next->next;
        }
        return p == q;
    }
};
