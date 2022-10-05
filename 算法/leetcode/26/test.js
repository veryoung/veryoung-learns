const nums = [0,0,1,1,1,2,2,3,3,4];

const removeDuplicates = (nums) => {
    if(!nums || nums.length === 0 ) return [];
    let fast = 0;
    let slow = 0;
    while(fast < nums.length) {
        if(nums[fast] !== nums[slow]) {
            slow++;
            console.log(slow);
            console.log(fast);
            nums[slow] = nums[fast];
        }
        fast++
    }
    return slow+1
}

console.log(removeDuplicates(nums))
