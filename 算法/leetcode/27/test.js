/**
 * @param {number[]} nums
 * @param {number} val
 * @return {number}
 */
 var removeElement = function(nums, val) {
    let fast = 0 ;
    let slow = 0;
    for(;fast < nums.length;fast++) {
        if(nums[fast] !== val) {
            nums[slow] = nums[fast]
            slow++
        }
    }
    return slow
};

let nums = [3,2,2,3], val = 3

removeElement(nums, val)
