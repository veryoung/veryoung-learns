// function MyFavorite(house, car, money) {
    
//     money = money || '一亿元';
    
//     console.log(arguments);
//     console.log(arguments.callee);
//     console.log("----------------");
// }

// MyFavorite();
// MyFavorite("别墅");
// MyFavorite("别墅", "法拉利");
// MyFavorite("别墅", "法拉利", "一亿元");

// function MyFavorite(house, car, money, ...other){

//     console.log(other);
//     console.log('What my favorite are' + house + ',' + car + ',' + money + ',' + other);

// }

// MyFavorite("别墅", "法拉利", "一亿");
// MyFavorite("别墅", "法拉利", "一亿", "老婆", "孩子");

function add() {
    var len = arguments.length,
        sum = 0;
    for(;len--;){
        sum += arguments[len];
    }
    return sum;
}

console.log( add(1,2,3) );   //6
console.log( add(1,3) );     //4
console.log( add(1,2,3,5,6) );   //17
