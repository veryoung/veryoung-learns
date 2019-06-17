class MiddleWare  {
    constructor() {
        this.queue  = []; // 任务队列
    }
    
    use(fn) {
        this.queue.push(fn);// 将任务加入任务队列
    }

    // 按次序执行中间件
    start(req,rep) {
        let i = 0; // 执行指针

        // 执行器
        const next = (err)=> {
              //如果有错误就将错误信息挂在response上并直接退出
            if(err){
                res.hasError = true;
                res.data = err.toString();
                return;
            }

            //如果没有错误就查看是否到达队尾，若没到则继续执行下一个中间件
            if(i < this.queue.length){
                this.queue[i++](req, res, next);
                /*将next直接传入当前执行的函数作为回调
                 当前执行函数执行到任何一步，通过主动调用next方法即可将相关信息传给下一个中间件。*/
            }else{
                //如果已经到队尾了则结束
                console.log('finish');
            }

        }
        //启动第一个
        next();
    }
}

//添加第一个中间件
/*
此处演示了一个基本的错误捕捉的写法，当中间件中出现错误时,会捕捉到错误并传入next
*/
const middleware = new MiddleWare();

middleware.use(function(req, res, next){
    try{
       req.addon1 = 'I add something';  
    }catch(err){
       next(err);
    }
    next();
});

//添加第二个中间件
middleware.use(function(req, res, next){
     res.addon2 = 'I add something more';
     next();
});

//添加第三个中间件
middleware.use(function(req, res, next){
     if (req.addon2) {
       delete req.addon2;
     }
     res.addon3 = 'I add something a lot';
     next();
});


let req = {};
let res = {};
let result = middleware.start(req,res);
console.log(req, res);