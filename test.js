const arr = [4, 3, 2, 1];
const oldIndex = 3;
const newIndex = 0;

const moveIndex = (arr, oldI, newI) => {
console.log('🚀 ~ file: test.js ~ line 6 ~ moveIndex ~ arr', arr)
  const val = arr.splice(oldI, 1);
  console.log("🚀 ~ file: test.js ~ line 8 ~ moveIndex ~ val", val);
  arr.splice(newI, 0, val[0]);
};
moveIndex(arr, oldIndex, newIndex);

console.log(arr);
