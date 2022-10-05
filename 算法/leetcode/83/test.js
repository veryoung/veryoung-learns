let head = {
    val: 1,
    next: {
        val: 1,
        next: {
          val: 2,
          next: {
            val: 3,
            next: {
                val: 3,
                next: null
            }
          }
        }
    }
}

let node = {
    val: 666
}
node.next  = head
head = node
console.log(head)

// var deleteDuplicates = function(node) {
//     if(!node) return node;
//     if(!node.next) return node
//     let start = node;
//     let rig = node.next;
//     while(node) {
//         if(node.val !== rig.val ) {
//             node.next = rig;
//             if(rig.next === null) {
//                 break;
//             }
//             node = rig;
//             rig = rig.next;
//         } else {
//             if(rig.next === null) {
//                 break;
//             }
//             rig = rig.next;
//         }
//     }
//     if(node.val === rig.val) {
//         node.next = null;
//     }
//     return start
// };

var deleteDuplicates = function(head) {
    if(!head) return null;
    let slow = head;
    let fast = head.next;
    while(fast) {
        console.log('----------')
        console.log('head-->old',JSON.stringify(head))
        console.log('slow',JSON.stringify(slow))
        console.log('fast',JSON.stringify(fast))
        if(fast.val !== slow.val) {
            slow.next = fast;
            console.log('head -->new',JSON.stringify(head))
            console.log('slow-->old',JSON.stringify(slow))
            slow = slow.next;
            console.log('slow-->new',JSON.stringify(slow))

        }
        fast = fast.next;
    }
    console.log('head',JSON.stringify(head))
    console.log('slow',JSON.stringify(slow))
    slow.next = null;
    return head
};


console.log(JSON.stringify(deleteDuplicates(head)));
