
var findRepeatNumber = function(nums) {
    const repeatMap = {}
    if(!nums || nums.length === 0) return
    for(let i = 0;i <nums.length;i++) {
        if(repeatMap[nums[i]]) {
            return nums[i]
        } else {
            repeatMap[nums[i]] = true
        }
    }
};

let nums = [3,4,2,1,1,0]
console.log(findRepeatNumber(nums))
