/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */

  function ListNode(val) {
      this.val = val;
      this.next = null;
}
var mergeTwoLists = function(l1, l2) {
    const dummy = new ListNode(-1)
    let p = dummy
    let p1 = l1
    let p2 = l2

    while (p1 != null && p2 != null) {
        // 比较 p1 和 p2 两个指针
        // 将值较小的的节点接到 p 指针
        if (p1.val > p2.val) {
            p.next = p2;
            p2 = p2.next;
        } else {
            p.next = p1;
            p1 = p1.next;
        }
        // p 指针不断前进
        p = p.next;
    }
    
    if (p1 != null) {
        p.next = p1;
    }
    
    if (p2 != null) {
        p.next = p2;
    }
    return dummy.next;
}



const l1 = {
    val: 1,
    next: {
        val: 2,
        next: {
          val: 3,
          next: null
        }
      }
}

const l2 = {
    val: 1,
    next: {
      val: 2,
      next: {
        val: 4,
        next: null
      }
    }
}

console.log(JSON.stringify(mergeTwoLists(l1, l2)));


