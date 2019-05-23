# 每日的学习课程

## 2019-05-20

### http 常见的状态码

#### 2XX

+ **200 OK** 
表示从客户端发来的请求在服务器端被正常处理了

+ **204 No Content** 
一般在只需要从客户端往服务器发送信息，而对客户端不需要发送新信息内容的情况下使用，无内容返回

+ **206 Partial Content** 
该状态码表示客户端进行了范围请求，而服务器成功执行了这部分的 GET 请求响应报文中包含由 Content-Range 指定范围的实体内容
----
#### 3xx

+ **301 Moved Permanently**
永久性重定向 该状态码表示请求的资源已被分配了新的 URI，以后应使用资源现在所指的 URI。也就是说，如果已经把资源对应的 URI 保存为书签了，这时应该按 Location 首部字段提示的 URI 重新保存

+ **302 Found 临时性重定向**
该状态码表示请求的资源已被分配了新的 URI，希望用户(本次)能使用新的 URI 访问。
和 301 Moved Permanently 状态码相似，但 302 状态码代表的资源不是被永久移动，只是临时性质的。换句话说，已移动的资源对应的 URI 将来还有可能发生改
变。比如，用户把 URI 保存成书签，但不会像 301 状态码出现时那样去更新书签，而是仍旧保留返回 302 状态码的页面对应的 URI。

+ **303 See Other**
该状态码表示由于请求对应的资源存在着另一个 URI，应使用 GET 方法定向获取请求的资源。
303 状态码和 302 Found 状态码有着相同的功能，但 303 状态码明确表示客户端应当采用 GET 方法获取资源，这点与 302 状态码有区别。
比如，当使用 POST 方法访问 CGI 程序，其执行后的处理结果是希望客户端能以 GET 方法重定向到另一个 URI 上去时，返回 303 状态码。虽然 302 Found 状态码也可以实现相同的功能，但这里使用 303 状态码是最理想的

+ **304 Not Modified**
该状态码表示客户端发送附带条件的请求时，服务器端允许请求访问资源，但未满足条件的情况。304 状态码返回时，不包含任何响应的主体部分。304 虽 然被划分在 3XX 类别中，但是和重定向没有关系。
附带条件的请求是指采用 GET 方法的请求报文中包含 If-Match，If-Modified-Since，If-None-Match，If-Range，If-Unmodified-Since 中任一首部
-----

#### 4xx

+ **400 Bad Request**

该状态码表示请求报文中存在语法错误。当错误发生时，需修改请求的内容后再次发送请求。另外，浏览器会像 200 OK 一样对待该状态码。

+ **401 Unauthorized**

该状态码表示发送的请求需要有通过 HTTP 认证(BASIC 认证、DIGEST 认证)的认证信息。另外若之前已进行过 1 次请求，则表示用 户认证失败

+ **403 Forbidden**

该状态码表明对请求资源的访问被服务器拒绝了。服务器端没有必要给出拒绝的详细理由，但如果想作说明的话，可以在实体的主体部分对原因进行描述，这样就能让用户看到了。
未获得文件系统的访问授权，访问权限出现某些问题(从未授权的发送源 IP 地址试图访问)等列举的情况都可能是发生 403 的原因

+ **404 Not Found**

该状态码表明服务器上无法找到请求的资源。除此之外，也可以在服务器端拒绝请求且不想说明理由时使用

+ **404 Method Not Allowed**

该状态码表明，客户端请求的方法虽然能够被服务器识别，但是服务器禁止使用该方法，客户端可以通过 OPTIONS 方法来查看服务器允许的方法，例如 Access-Control-Allow-Methos

---

### 5xx

+ **500 Internal Server Error**

该状态码表明服务器端在执行请求时发生了错误。也有可能是 Web 应用存在的 bug 或某些临时的故障

+ **502 Bad Gateway**

该状态码表明扮演网关或代理角色的服务器，从上游服务器中接收到的响应是无效的

+ **503 Service Unavailable**

该状态码表明服务器暂时处于超负载或正在进行停机维护，现在无法处理请求。如果事先得知解除以上状况需要的时间，最好写入 RetryAfter 首部字段再返回 给客户端

## 2019-05-21

### 执行环境（Execution Context）和执行栈 Context Stack

#### 执行环境
js是单线程语言,即同一时间只能执行一个任务。
当js解释器初始化代码的时候，默认进入全局的执行环境，每调用一个函数，js解释器会创建一个新的执行环境。
```
var a = 1; // 1.默认进入全局执行环境

function b () {  // 3. 进入b的执行环境
    function c() { 5.进入 c的执行环境

    }
    c() 4. 在b的执行环境里面 调用 c 创建c的执行环境
}
b()  // 2.调用 b 创建b的执行环境

```
一个程序只有一个全局对象，即window对象
函数执行环境：函数调用过程会创建函数的执行环境，因此每个程序可以有无数个函数执行环境。
Eval执行环境：eval代码特定的环境。
#### 执行栈(Context Stack)
```
function foo(i) {
  if (i < 0) return;
  console.log('begin:' + i);
  foo(i - 1);
  console.log('end:' + i);
}
foo(2);
```
存储代码运行时的执行环境，就是执行栈。
栈遵循的是前进后出。

**创建全局执行环境-推入当前执行栈-调用一个函数-创建新的执行环境-推入运行栈的顶端-发生新的函数调用-创建环境-推入当前执行栈顶端-无新函数调用-运行栈顶端执行完成-执行栈弹出该函数所在的执行环境-控制权交给下一个执行环境-直到全局执行环境（或者浏览器关闭，全局环境随之销毁**

因此输出的结果为:
```
begin:2
begin:1
begin:0
end:0
end:1
end:2
```
下面解析以下代码运行时的运行栈
```
funciton add ( a, b){
    return a + b;
}
function consoleAdd( x, y) {
    var sum = add (x + y);
    console.log(sum)
}
consleAdd(1,2);
```

1. 进入全局作用域，调用全局方法
2. 调用consoleAdd(1,2),将consoleAdd()加入运行栈,进入consoleAdd(1,2)环境。
3. 进入consoleAdd()作用域,调用 add(x+y),运行栈将 add(x+y) 放在consoleAdd(1,2)之上,进入add(x+y)环境.
4. 无方法调用，执行return，将add(x+y)弹出,返回consoleAdd(1,2)环境。
5. 进入consoleAdd(1,2)环境，调用console.log(),运行栈将console.log()放在consoleAdd(1,2)之上.
6. 执行console.log(),将console.log()弹出，
7.返回全局作用域，无其他方法调用，调用consoleAdd(),清空运行栈。

#### 堆栈溢出
当你达到调用栈最大的大小的时候就会发生这种情况，而且这相当容易发生，特别是在你写递归的时候却没有全方位的测试它。我们来看看下面的代码：
```
funciton foo(){
    foo()
}
foo()
```
在执行的每一步中，相同的函数都会被一次又一次地添加到调用堆栈中,并且在没有任何终止条件的情况下开始调用自己。
在某些时候，调用堆栈中的函数调用数量超过了调用堆栈的实际大小，浏览器决定采取行动，抛出一个错误。

**VM222:1 Uncaught RangeError: Maximum call stack size exceeded**

## 2019-05-22

### 为什么是单线程
假设在浏览器中运行一个复杂的图像转换算法。

当调用堆栈有函数要执行时，浏览器不能做任何其他事情——它被阻塞了。这意味着浏览器不能渲染，不能运行任何其他代码，只是卡住了。那么你的应用 UI 界面就卡住了，用户体验也就不那么好了。

在某些情况下，这可能不是主要的问题。还有一个更大的问题是一旦你的浏览器开始处理调用堆栈中的太多任务，它可能会在很长一段时间内停止响应。这时，很多浏览器会抛出一个错误，提示是否终止页面。

```
var res = ajax("xxxxx");
console.log(res)
```
Ajax(..) 函数还没有返回任何值来分配给变量 res;
可以设置同步Ajax请求，但永远不要那样做。如果设置同步Ajax请求，应用程序的界面将被阻塞——用户将无法单击、输入数据、导航或滚动。这将阻止任何用户交互，这是一种可怕的做法。
```
jQuery.ajax({
    url: "xxxx",
    success: function(res){

    },
    async: false;
})
```
一种等待异步函数返回的结果简单的方式就是 回调函数
```
ajax("xxxx",funciton(res)=>{
    console.log(res)
})
```
还能通过延迟执行达到目的
```
function first() {
    console.log('first');
}
function second() {
    console.log('second');
}
function third() {
    console.log('third');
}
first();
setTimeout(second, 1000); 
third();
```



## 2019-05-23

### 本地存储

#### Cookie
作为一个前端和Cookie打交道的次数肯定不会少了，Cookie算是比较古老的技术了1993 年，网景公司雇员 Lou Montulli 为了让用户在访问某网站时，进一步提高访问速度，同时也为了进一步实现个人化网络，发明了今天广泛使用的 Cookie。
##### Cookie的特点
我们先来看下Cookie的特点:

1. cookie的大小受限制，cookie大小被限制在4KB，不能接受像大文件或邮件那样的大数据。

2. 只要有请求涉及cookie，cookie就要在服务器和浏览器之间来回传送（这解释为什么本地文件不能测试cookie）。而且cookie数据始终在同源的http请求中携带（即使不需要），这也是Cookie不能太大的重要原因。正统的cookie分发是通过扩展HTTP协议来实现的，服务器通过在HTTP的响应头中加上一行特殊的指示以提示浏览器按照指示生成相应的cookie。

3. 用户每请求一次服务器数据，cookie则会随着这些请求发送到服务器，服务器脚本语言如PHP等能够处理cookie发送的数据，可以说是非常方便的。当然前端也是可以生成Cookie的，用js对cookie的操作相当的繁琐，浏览器只提供document.cookie这样一个对象，对cookie的赋值，获取都比较麻烦。而在PHP中，我们可以通过setcookie()来设置cookie，通过$_COOKIE这个超全局数组来获取cookie。

**cookie的内容主要包括：名字，值，过期时间，路径和域。路径与域一起构成cookie的作用范围。若不设置过期时间，则表示这个cookie的生命期为浏览器会话期间，关闭浏览器窗口，cookie就消失。这种生命期为浏览器会话期的cookie被称为会话cookie。会话cookie一般不存储在硬盘上而是保存在内存里，当然这种行为并不是规范规定的。若设置了过期时间，浏览器就会把cookie保存到硬盘上，关闭后再次打开浏览器，这些cookie仍然有效直到超过设定的过期时间。存储在硬盘上的cookie可以在不同的浏览器进程间共享，比如两个IE窗口。而对于保存在内存里的cookie，不同的浏览器有不同的处理方式。**

#### Session
说到Cookie就不能不说Session。

Session机制。session机制是一种服务器端的机制，服务器使用一种类似于散列表的结构（也可能就是使用散列表）来保存信息。当程序需要为某个客户端的请求创建一个session时，服务器首先检查这个客户端的请求里是否已包含了一个session标识（称为session id），如果已包含则说明以前已经为此客户端创建过session，服务器就按照session id把这个session检索出来使用（检索不到，会新建一个），如果客户端请求不包含session id，则为此客户端创建一个session并且生成一个与此session相关联的session id，session id的值应该是一个既不会重复，又不容易被找到规律以仿造的字符串，这个session id将被在本次响应中返回给客户端保存。保存这个session id的方式可以采用cookie，这样在交互过程中浏览器可以自动的按照规则把这个标识发送给服务器。一般这个cookie的名字都是类似于SEEESIONID。但cookie可以被人为的禁止，则必须有其他机制以便在cookie被禁止时仍然能够把session id传递回服务器。经常被使用的一种技术叫做URL重写，就是把session id直接附加在URL路径的后面。比如：
http://damonare.cn?sessionid=123456
还有一种技术叫做表单隐藏字段.就是服务器会自动修改表单，添加一个隐藏字段，以便在表单提交时能够把session id传递回服务器。经常被使用的一种技术叫做URL重写，就是把session。
实际上这种技术可以简单的用对action应用URL重写来代替。

#### Cookie和Session简单对比
Cookie和Session 的区别：

1. cookie数据存放在客户的浏览器上，session数据放在服务器上。

2. cookie不是很安全，别人可以分析存放在本地的cookie并进行cookie欺骗，考虑到安全应当使用session。

3. session会在一定时间内保存在服务器上。当访问增多，会比较占用你服务器的性能考虑到减轻服务器性能方面，应当使用cookie。

4. 单个cookie保存的数据不能超过4K，很多浏览器都限制一个站点最多保存20个cookie。

所以建议：

**将登陆信息等重要信息存放为SESSION,其他信息如果需要保留，可以放在cookie中**

#### document.cookie的属性
1. expires属性

指定了coolie的生存期，默认情况下coolie是暂时存在的，他们存储的值只在浏览器会话期间存在，当用户推出浏览器后这些值也会丢失，如果想让cookie存在一段时间，就要为expires属性设置为未来的一个过期日期。现在已经被max-age属性所取代，max-age用秒来设置cookie的生存期。

2. path属性

它指定与cookie关联在一起的网页。在默认的情况下cookie会与创建它的网页，该网页处于同一目录下的网页以及与这个网页所在目录下的子目录下的网页关联。

3. domain属性

domain属性可以使多个web服务器共享cookie。domain属性的默认值是创建cookie的网页所在服务器的主机名。不能将一个cookie的域设置成服务器所在的域之外的域。例如让位于order.damonare.cn的服务器能够读取catalog.damonare.cn设置的cookie值。如果catalog.damonare.cn的页面创建的cookie把自己的path属性设置为“/”，把domain属性设置成“.damonare.cn”，那么所有位于catalog.damonare.cn的网页和所有位于orlders.damonare.cn的网页，以及位于damonare.cn域的其他服务器上的网页都可以访问这个cookie。

4. secure属性

它是一个布尔值，指定在网络上如何传输cookie，默认是不安全的，通过一个普通的http连接传输

#### cookie实战

借用w3cschool的demo:

```
function getCookie(c_name){
    if (document.cookie.length>0){
        c_start=document.cookie.indexOf(c_name + "=")
        if (c_start!=-1){
            c_start=c_start + c_name.length+1
            c_end=document.cookie.indexOf(";",c_start)
            if (c_end==-1) c_end=document.cookie.length
            return unescape(document.cookie.substring(c_start,c_end))
        }
    }
    return "";
}

function setCookie(c_name,value,expiredays){
    var exdate=new Date()
    exdate.setDate(exdate.getDate()+expiredays)
    document.cookie=c_name+ "=" +escape(value)+
            ((expiredays==null) ? "" : "; expires="+exdate.toUTCString())
}
function checkCookie(){
    username=getCookie('username')
    if(username!=null && username!=""){alert('Welcome again '+username+'!')}
    else{
        username=prompt('Please enter your name:',"")
        if (username!=null && username!=""){
            setCookie('username',username,355)
        }
    }
}
```


3. localStorage

这是一种持久化的存储方式，也就是说如果不手动清除，数据就永远不会过期。它也是采用Key - Value的方式存储数据，底层数据接口是sqlite，按域名将数据分别保存到对应数据库文件里。它能保存更大的数据（IE8上是10MB，Chrome是5MB），同时保存的数据不会再发送给服务器，避免带宽浪费。

1. localStorage的属性方法
下表是localStorge的一些属性和方法
---

属性方法 说明

+ localStorage.length 获得storage中的个数

+ localStorage.key(n) 获得storage中第n个元素对的键值（第一个元素是0）

+ localStorage.getItem(key) 获取键值key对应的值

+ localStorage.key 获取键值key对应的值

+ localStorage.setItem(key, value) 添加数据，键值为key，值为value

+ localStorage.removeItem(key) 移除键值为key的数据

localStorage.clear() 清除所有数据

2. localStorage的缺点


+ localStorage大小限制在500万字符左右，各个浏览器不一致
+ localStorage在隐私模式下不可读取
+ localStorage本质是在读写文件，数据多的话会比较卡（firefox会一次性将数据导入内存，想想就觉得吓人啊）
+ localStorage不能被爬虫爬取，不要用它完全取代URL传参

3. sessionStorage

和服务器端使用的session类似，是一种会话级别的缓存，关闭浏览器会数据会被清除。不过有点特别的是它的作用域是窗口级别的，也就是说不同窗口间的sessionStorage数据不能共享的。使用方法（和localStorage完全相同）：

属性方法 说明

+ sessionStorage.length 获得storage中的个数

+ sessionStorage.key(n) 获得storage中第n个元素对的键值（第一个元素是0）

+ sessionStorage.getItem(key) 获取键值key对应的值

+ sessionStorage.key 获取键值key对应的值

+ sessionStorage.setItem(key, value) 添加数据，键值为key，值为value

+ sessionStorage.removeItem(key) 移除键值为key的数据

+ sessionStorage.clear() 清除所有数据


4. sessionStorage和localStorage的区别

sessionStorage用于本地存储一个会话（session）中的数据，这些数据只有在同一个会话中的页面才能访问并且当会话结束后数据也随之销毁。因此sessionStorage不是一种持久化的本地存储，仅仅是会话级别的存储。当用户关闭浏览器窗口后，数据立马会被删除。

localStorage用于持久化的本地存储，除非主动删除数据，否则数据是永远不会过期的。第二天、第二周或下一年之后，数据依然可用。

web Storage和cookie的区别

Web Storage(localStorage和sessionStorage)的概念和cookie相似，区别是它是为了更大容量存储设计的。Cookie的大小是受限的，并且每次你请求一个新的页面的时候Cookie都会被发送过去，这样无形中浪费了带宽，另外cookie还需要指定作用域，不可以跨域调用。
除此之外，Web Storage拥有setItem,getItem,removeItem,clear等方法，不像cookie需要前端开发者自己封装setCookie，getCookie。
但是Cookie也是不可以或缺的：
**Cookie的作用是与服务器进行交互，作为HTTP规范的一部分而存在 ，而Web Storage仅仅是为了在本地“存储”数据而生**

## 2019-05-24


