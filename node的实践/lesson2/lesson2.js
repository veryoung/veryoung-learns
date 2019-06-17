const fs = require("fs");

const data= new Uint8Array(Buffer.from("I am just a test"))

fs.writeFile("./test.txt",data, (error)=>{
    if(error) {
        console.log("文件写入失败", error);
    } else {
        console.log("文件写入成功")
    }
})

fs.readFile("./test.txt",(err,data)=>{
    if(error) {
        console.log("文件写入失败", error);
    } else {
        console.log("文件写入成功")
    }
})