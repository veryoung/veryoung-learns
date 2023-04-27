// const add = (a, b) => {
//     return a + b;
// }

// const curryAdd = (a, b) => {
//     return function(b) {
//         return a + b;
//     }
// }

// var sum = curryAdd(5)
// var result = sum(5)
// console.log(result)


// function curry(fn) {
//     var _args = []
//     console.log('🚀 ~ file: curry.js:20 ~ returnfunction ~ arguments:', [...arguments])
//     return function() {
//         _args = Array.prototype.concat(_args, [...arguments])
//         if (_args.length === fn.length) {
//             const args = _args
//             _args = []
//             return fn.apply(this, args);
//         }
        
//        return arguments.callee
//     }
// }

// var abc = function(a, b, c) {
//     return [a, b, c];
// }

// var curried = curry(abc);
// console.log('🚀 ~ file: curry.js:26 ~ curried:', curried)

// console.log(curried(1)(2)(3))

// console.log(curried(1, 2)(3))


function curry(fn) {
    var _args = [];
    return function () {
        [].push.apply(_args, [].slice.call(arguments));
        if (_args.length === fn.length) {
            const args = _args
            _args = []
            return fn.apply(this, args);
        }
        
        return arguments.callee;
    }
}
var abc = function(a, b, c) {
  return [a, b, c];
};

var curried = curry(abc)

console.log(curried(1)(2)(3))

console.log(curried(1, 2)(3))
