let sum = 0;
const BubbleSort = (arr) => {
  if (!arr || arr.length === 0) return [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
};


console.log(BubbleSort([4, 3, 2, 1]));
