# 每日的学习课程

## 2019-05-22

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

+ **405 Method Not Allowed**

该状态码标明，客户端请求的方法虽然能被服务器识别，但是服务器禁止使用该方法客户端可以通过 OPTIONS 方法来查看服务器允许的访问方法, 如下
Access-Control-Allow-Methods →GET,HEAD,PUT,PATCH,POST,DELETE
---