function fnc () {
    let i = 0
    const start = performance.now()
    while (performance.now() - start <= 5000) {
        i++
    }
    console.log(i)
    return i
}

setTimeout(() => {
    fnc()
}, 1000)

// generator 处理原来的函数
// function * fnc_ () {
//     let i = 0
//     const start = performance.now()
//     while (performance.now() - start <= 5000) {
//         yield i++
//     }

//     return i
// }

// // 简易时间分片
// function timeSlice (fnc, cb = setTimeout) {
//     if(fnc.constructor.name !== 'GeneratorFunction') return fnc()

//     return async function (...args) {
//         const fnc_ = fnc(...args)
//         let data

//         do {
//             data = fnc_.next(await data?.value)
//             // 每执行一步就休眠，注册一个宏任务 setTimeout 来叫醒他
//             await new Promise( resolve => cb(resolve))
//         } while (!data.done)

//         return data.value
//     }
// }

// // setTimeout(async () => {
// //     const fnc = timeSlice(fnc_)
// //     const start = performance.now()
// //     console.log('开始')
// //     const num = await fnc()
// //     console.log('结束', `${(performance.now() - start)/ 1000}s`)
// //     console.log(num)
// // }, 1000)

// // 精准时间分片
// function timeSlice_ (fnc, time = 25, cb = setTimeout) {
//     if(fnc.constructor.name !== 'GeneratorFunction') return fnc()

//     return function (...args) {
//         const fnc_ = fnc(...args)
//         let data

//         return new Promise(async function go (resolve, reject) {
//             try {
//                 const start = performance.now()

//                 do {
//                     data = fnc_.next(await data?.value)
//                 } while (!data.done && performance.now() - start < time)

//                 if (data.done) return resolve(data.value)

//                 cb(() => go(resolve, reject))
//             } catch(e) {
//                 reject(e)
//             }
//         })
//     }
// }

// setTimeout(async () => {
//     setTimeout(async () => {
//         const fnc = timeSlice(fnc_)
//         const fnc1 = timeSlice_(fnc_)
//         let start = performance.now()
    
//         console.log('开始')
//         const a = await fnc()
//         console.log('结束', `${(performance.now() - start)/ 1000}s`)
    
//         console.log('开始')
//         start = performance.now()
//         const b = await fnc1()
//         console.log('结束', `${(performance.now() - start)/ 1000}s`)
    
//         console.log(a, b)
//     }, 1000);
// })
