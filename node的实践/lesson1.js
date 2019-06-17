// 引入Nodejs的自带模块
const http = require("http");

// 引入NodeJS自带的child_process的子模块
const childProcess = require("child_process");

const hostName = "localhost";
const port = 3030;

// 创建一个服务器

const server = http.createServer((req,rep)=>{
    rep.statusCode = 200;
    rep.setHeader("Content-Type","text/plain"); // 设置响应头
    rep.end("hello world"); 
})

server.listen(port,hostName,()=>{
    console.log(`已经在 http://${hostName}:${port}`)

    // 使用默认浏览器打开地址
    childProcess.exec(`打开 http://${hostName}:${port}`)
})