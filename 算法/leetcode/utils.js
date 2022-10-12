// 给定数组 原地删除对应数据 并返回合适长度
export const removeElement = function(nums, val) {
    let fast = 0 ;
    let slow = 0;
    for(;fast < nums.length;fast++) {
        if(nums[fast] !== val) {
            nums[slow] = nums[fast]
            slow++
        }
        console.log(nums[fast]);
    }
    return slow
};
