/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
 var hasCycle = function(head) {
  if(!head) return false;
  let first = head;
  let second = head.next;
    while(first !== second && second && second.next) {
        first = first.next;
        second = second.next.next;
    }
    return first === second;
};
