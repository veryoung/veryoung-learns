/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
 var moveZeroes = function(nums) {
    let p = removeElement(nums, 0)
    for (; p < nums.length; p++) {
        nums[p] = 0;
    }
};

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
let nums = [0,1,0,3,12]
moveZeroes(nums)
console.log(nums)
