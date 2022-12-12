# QQ 浏览器 Feeds 项目

## 目录

[TOC]

## 开发文档与接口人

- QB feeds 项目: <https://git.code.oa.com/mqqbrowser_rn_web/feeds>
- Hippy 官网：<http://hippy.oa.com/>
- Hippy QB 定制化的组件 WIKI：<http://tapd.oa.com/QQ_Browser_In_Hippy/markdown_wikis/?#1020381862007397401>

- 项目 PM：fangmingliu（刘芳铭）、lumingwang（王路明）
- 频道 tab 产品：roypzheng（郑晓灿）
- 资讯产品：deanding（丁宇）、foxyhu （胡麟）

- 开发对接人
- Hippy Core: pollyzhang(张龙)
- Hippy Web: xqkuang(旷旭卿)
- Android 业务需求: stevenleisu（苏磊）
- iOS 业务需求: harrisliu（刘海波）
- Android SDK: maxli（李思广）、
- iOS SDK: mengyanluo（罗梦砚）
- feeds 后台: jiechang(常杰)
- tab 服务后台：老服务|jiechang(常杰)、新服务|wordenwang（王晓捷）
- 推荐功能层后台: jeffyxu(徐志峰)、kevinlang(稂衡峰)、xuedichen（陈雪娣）
- 人工运营层后台: bojiang(江波)
- UI 系统管理平台：hahnzhu（朱浩杭）
- UI 系统骡马平台后台：kerrydong（董树杰）
- 广告后台: tonytian(田章)
- 数据统计相关：ivanqu（曲传久）

## 调试

### Hippy core 之前调试

- iOS 调试

  - 安装 ios-sim：`tnpm install -g ios-sim@next`

  - 安装调试模拟器（ [模拟器下载地址](https://git.code.oa.com/hippy/qb_ios_sim) 或者 找 iOS 终端同学要 ）

  - 运行：`ios-sim launch mttlite.app --devicetypeid iPhone-X` mttlite.app 是终端的 qb 模拟器）

- 启动

- Android 调试

  - [安卓包下载](http://rdm.oa.com/ci/product/c77468e3-0645-477b-b430-90a7b85a06e7/job/32744)

  - 在 PC 中，找到指定包的位置，打开终端，运行: `adb install -t xxx.apk`

  - QB 运行: `adb reverse --remove-all && adb reverse tcp:8082 tcp:8082`

  - 修改 android 分辨率 `adb shell wm size 1080x2240`
  - 重置 android 分辨率 `adb shell wm size reset`

  - 白牌调试说明（只能用荣耀手机）

    - `设置` - `关于` - `点击5下logo` - `React Debug Setting` - `feeds`

    - 摇晃手机，会自动弹出调试窗口，点击`enable remote debug` 并 `reload`, 就开启华为白牌的调试模式了

    - tnpm run start

    - 映射 8081 端口：`adb reverse --remove-all && adb reverse tcp:8081 tcp:8081`

### Hippy core 之后调试

- QB 9.6 及以上的 Android ，9.7 及以上的 iOS 调试方式发生变更，hippy 主线已经切到 hippy-core，如果只引用了 hippy-react-qb 那更新依赖即可，详细迁移和调试方案详见：<https://docs.qq.com/doc/DUk1oUnhFT1pzeWlt，>

先运行`tnpm run start` ，直到编译出 jsbundle 后，

- android 插入真机后，再运行`tnpm run serve`
- ios 打开模拟器（[模拟器下载地址](https://git.code.oa.com/hippy/qb_ios_sim)），再运行`tnpm run serve`

### 开发分支

- QB： develop
- 战肺炎单频道底 bar: release/coronavirusfeeds
- 关注 tab 单频道底 bar: release/dynamic_tab
- 白牌：HuaWei_TMS_Android_P_release
- WiFi 管家：wifi_admin_release（appid:4）
- 快报极速版：qb_speed
- sdk 分支：sdk_normal
  - ROG 负一屏: appid 115
  - 黑鲨浏览器: appid 116
  - 黑鲨负一屏: appid 117

### 发布分支管理

Feeds 代码提交符合 EPC 对于代码仓库管理的要求

1. userID 是指企业微信 ID
2. 每个提交 **必须带上 TAPD 信息**， `storyID, taskId, bugId` 的一种， 均为后 9 位，命令行工具会自动截取
3. 命名规则中的 `[]` 的部分是可选的， 其他部分是必选的
4. 以上均以 `.code.yml` 的定义为准

#### 一、开发新功能

1. 从 `develop` 分支拉 `feature分支`，分支命名形如 `feature/${userID}_${storyID}[_${description}]` 如 `feature/tomdyqin_857949259`

2. 功能开发完成后 将 `feature分支` 提 MR 到 `develop` 分支

#### 二、功能修复

1. 所有功能在合入发布分支后，如有问题修复，需要从发布分支（如`release/7500_release`）拉修复分支 `hotfix/[${versionname}][_${description}]` 如 `hotfix/7500_report-ui103`, 描述单词如果多个间用"-"分隔

2. 在修复分支中提交修复代码并修改 `package.json` 把 `bundleConfig.VC` 和 `bundleConfig.RUA` 里的 `VC` 提升 1（如 `"RUA": "BU=FEEDS&VC=7501","VC": 7501` 修改为 `"RUA": "BU=FEEDS&VC=7502","VC": 7502` ）

3. 将 `hotfix分支` 提 `MR` 到 `release/{版本VC}_release`， 如 `hotfix/7500_report-ui103` -> MR 到 -> `release/7500_release`

4. 如果 `feature分支` 合入 `develop` 后还没拉 `release分支` 进行集成测试，发现有额外 bug 要提交修改，从 `develop` 拉 `bugfix/${userID}_${storyID}[_${description}]` 分支，`MR` 到 `develop`

#### 三、分支管理时间线

1. `feature分支` 合入 `develop` 分支后，会删除 `feature分支`，后续有修改请走 hotfix 流程

2. `hotfix分支` 在合入`release分支`后，会删除 `hotfix分支`， 并合并到 `master` 与 `develop` 分支

3. `release分支`发布后（包括集成预发布），会将本周`release分支`（如 `release/7450_release` ）合并到 `master` 与 `develop` 分支

### 开启 mock 数据模式

```javascript
  1. 在 feeds/src/test/tab-lists-styles/ 下增加mock UI
  2. 修改feeds/src/test/tab-lists-styles/TestConfig.js文件，可以针对每个tab显示哪些debug UI做配置
  3. 修改文件 feeds/src/framework/FeedsDataManager.js

  import TestMock from "../test/TestMock";

  //.....此处省略部分代码.....

  let mockStub = TestMock.mockRsp(prx,'getFeedsTabLists');
  let response = await prx.getFeedsTabLists(req);
  mockStub.restore();

  // let {response} = await prx.getFeedsTabLists(req);
```

### 访问测试数据接口

在手 Q 浏览器中访问：[大神的作品](http://e.html5.qq.com/)，大神名叫：`allsochen`，然后在 Environment 切换到 `Debug`。

然后杀掉手 Q 浏览器进程，可能需要多试几次。（测试环境一般会在 tab 名称前显示“d”）

## 开发

### 代码注意问题

1. **严格按照 eslint 规范，主代码逻辑不能出现任何与调试相关的 console、toast 代码！目前已经接入了公司的 eslint 规范和蓝盾 CI，发起 MR 时会对代码进项规范检测**（在[蓝盾权限申请页面](http://devops.oa.com/console/perm/apply-join-project?project_code)，选择加入项目`hippy`，用户组`feedsMR`，可以收到每次代码检查的详细信息）

2. **影响到置顶和曝光相关上报的改动务必知会 feeds 开发 owner**

3. **QB10.0 后，image 组件要加上`reportData={{sourceFrom: itemBean.item_id}}` 属性，增加图片后台来源统计，排查下发图片过大导致 OOM 的问题**

```javascript
<Image style={[styles.image]} source={{ uri: this.state.topPicUrl }} reportData={{ sourceFrom: itemBean.item_id }} />
```

4. **内置 base64 图片单张绝对不能超过 2K（请用 tinypng 反复压缩多次到极限），超过 2K 的务必用 cdn 地址，cdn 资源也要保证不能过大**

5. **修改已有 UI 的代码时，要注意缓存的旧数据与新数据代码兼容性，新变量要注意存在性判断；另外如果新老版本 UI 有兼容性问题，后台可以根据不同的 feeds 版本做对应下发**

6. **调用某个 view 组件的方法时，特别注意 view 实例 ref 的存在性判断，跟 react 不一样的是，hippy 在 componentDidMount 生命周期里，view 的真正实例不一定完全生成，建议在`onLayout`时机执行代码**

7. **android 终端存在对 view 的优化，这个时候可能无法通过的 `UIManagerModule.measureInWindow` 方法获取 view 实例的绝对位置，这时可以给原始 view 的 style 加上 `style={{collapsable: false}}` ，避免优化**

8. **颜色规范 因浏览器内有日间模式（正常模式）、夜间模式、浅色皮肤模式、深色皮肤模式，各个模式下的颜色是需要微调的，因此设计师需要提前在设计阶段将 `白天、夜间、深色皮肤、浅色皮肤` 四种状态考虑进去，针对浏览器我们需要提供一个颜色值数组相应的 style 属性为：`backgroundColors`、`borderColors`、`colors` 数组对应 `[日、夜、浅（皮肤）、深（皮肤）]`**

9. **开发的 UI 组件必须使用`FeedsViewContainer`作为 View 外层容器，响应全局样式调整**

10. 代码已接入蓝盾 `CodeCC` 代码检查和 `@tencent/eslint-config-tencent`的 `eslint` 规则检查， 校验不通过的不允许提交合入

11. git commit 需要符合`commitlint`校验 具体可以参看 <https://github.com/conventional-changelog/commitlint/#what-is-commitlint>

- 常用的 type 类别
- feat：新功能（feature）
- fix：修补 bug
- docs：文档（documentation）
- style： 格式（不影响代码运行的变动）
- refactor：重构（即不是新增功能，也不是修改 bug 的代码变动）
- test：增加测试
- chore：构建过程或辅助工具的变动

12. 本地可以执行圈复杂度命令 `npm run ccn`来更新检查圈复杂度，更新后可以再次执行 `npm run ccn:15`来查看上次的检查结果。首次执行之前 需要以下环境准备

- 先安装 lizard: 安装方法 https://pypi.org/project/lizard/
- 安装 python
- 安装 python 模块: pip3 install pandas argparse pyyaml

### Feeds 类型和样式

所有 Feeds 内信息流的样式组件位于 src/feeds-styles 下以 tab 开头，内容分别是：

- 1 推荐
- 3 搞笑
- 4 购物
- 5 圈子
- 6 视频秀
- 20 关注
- 22 小说
- 23 爱拍
- 111 电竞
- ……

### Feeds UI 各样式汇总梳理

<http://tapd.oa.com/RNpro/markdown_wikis/#1010158541007168827>

### JCE 转换成 JS

- 使用 nodetools 选择 hippy 类型，**务必勾选优化输出代码大小！！**

- 使用[taf 网站工具](http://taf.wsd.com/jce_tool/tool_show.action?__rand__=0.25255235161594936#tabTitle=jce%E5%B7%A5%E5%85%B7#tabUrl=http://taf.wsd.com/jce_tool/tool_show.action?__rand__=0.7287701525410097#)

### 如何添加 wup key

找 sunqingqing（孙青青）、alexjtxie（谢家提）

### 资源上传 CDN

- 老 CDN 平台（后续不支持上传了）：cdn.wsd.com

- 新 CDN 平台：<http://nav.wsd.com/#/toolkitSys/uploadManage>
  文件目录：hippy/feeds

### 新建 feeds UI 组件

1. 访问[通用 jce 文件的 git 仓库](https://git.code.oa.com/browser_svr/HomepageFeedsCommon)
2. 与仓库 master 成员定 feedsUI 编号，如 FeedsViewUIStyle1、FeedsViewUIStyle2 等

> - 跟后台确定新 UI 的协议后:
> - a. 在 Feeds 本地工程自行修改 HomepageFeedsForRN.jce 并用 nodetools 转成 proxy 的 js
> - b. 每次需求增改 jce 后，一定需要将本地的修改在 HomepageFeedsCommon 的 JCE 文件同步，拉取独立分支，提交 mr 到 master, 让 master 成员审核，HomepageFeedsCommon 是让所有人参考的一个公用 jce 文件（不仅是给 feeds 业务使用），必须保持最新

3. 业务方后台同学自行 release 对应的 jce
4. 在 feeds 项目里/src/feeds-styles/index.js 下新增组件的 require
5. 新增组件 js 文件，如 tab-1/FeedsViewUIStyle1.js
6. UI 组件代码里务必写上`getRowType`方法，增加 UI 复用性

### 如何看 ui 编号

打开 【FeedsConst.js Debug】 > 【uiDebug:true】

### feeeds tabid 列表

<http://tapd.oa.com/project_frontend/prong/stories/view/1010133761061045933>

### tab 频道 jce

9.8.0 以上，频道采用新的后台服务，jce 文件为`FeedsTabManageForClient.js`, 与后台公共维护的 git 项目仓库地址: <https://git.code.oa.com/browser_svr/FeedsTabManageForClient>

### feeds appid 列表

<http://tapd.oa.com/project_frontend/prong/stories/view/1010133761061225901?url_cache_key=7c58a695d1e33afa1f1250ad0c89b3da&action_entry_type=story_tree_list>

### 如何将 style 样式移植到 UI 实验系统

feeds 工程里有一个`FeedsDefaultStyle.js`文件，该样式文件是与线上 UI 系统最新 base 样式保持一致的，每周集成发布时，版本发布人会将样式跟新到 UI 系统

#### 版本发布人更新 UI 系统样式方法

1. 修改 `FeedsDefaultStyle.js` 的 `minRNVersion` 为当周 feeds 集成版本号，如这周是 7200，填写 7200

2. 执行 `tnpm run copystyle`, 会自动将`data`里的样式内容序列化后复制到剪切板，打开 <http://qbuitestpacker.wsd.com/tools.html> ，新建 base 样式，将剪切板内容复制到最新 base 样式下

#### 合作方如何将样式移植到 UI 系统

1. 在`FeedsDefaultStyle.js`的 `data` 里面添加上对应 UI 的样式（**P.S.不能在该文件下 import 外部文件，例如不能将 FeedsTheme 引入！！**）

2. 本地调试或者功能测试时，可以修改`FeedsConst.js` 的 `Debug.uiStyleDebug` 为 true，这样 feeds 读取的就是本地的`FeedsDefaultStyle.js`文件（**MR 集成时需要还原这个修改, 否则无法通过 eslint**）：

```javascript
uiStyleDebug: true;
```

3. 在自己的 UI 文件里通过`globalConf.style.getStyle(xxx)`方法获取对应的样式

4. MR 集成测试时，通知版本发布人有新的 UI 样式需要合入 UI 系统

### VN、VC 与 miniQBVersion 关系

- 发布系统上的 vn 对应本地代码 package.json 里的 vc 和 RUA，也就是 feeds jsbundle 的版本，集成测试的时候由集成的同学统一更改 package.json 里的 vc、rua；

- 发布系统上的 vc 是由发布系统自动递增的，告诉终端决定是否可以升级覆盖安装，本地打包的 jsbundle android vc 号是 99999，ios 是 999999，如果装了本地打包的 jsbundle，想要更新线上的 jsbundle，需要重装 qb 才可以（！！！注意千万不要将本地打包的 bundle zip 包发给终端同学做内置！！！）

- miniQBVersion 是发布平台的限制规则,决定最小的生效 qb 版本，只有涉及到终端接口的修改，才需要截断发布，修改最小的 miniQBVersion，其他情况不需要修改

## 数据

### 如何查看 Feeds 真实曝光点击数据

实时查询地址：<http://logcheck.pcg.com/static/stats/>

### 如何查看灯塔上报数据

#### 查询方法

- 验收灯塔上报（权限找 mikemi 开）
  - 验收数据上报是进行数据转发配置的重要步骤，因为产品和开发声称的事件名称和时间 KEY 值，可能出现 KEY 缺失、值为空、大小写不符或者字符误差等错误，必须以实际数据为基础进行配置，才能输出符合预期的数据表，避免重复来回检查。
- 主动触发上报并实时验收
  - 灯塔上报事件分实时事件和非实时事件，前者数据产生后，几乎是立即上报，而后 者需要所有非实时事件的数据条数达到一定数量(这个是接入灯塔时由终端开发可以调整的值)。因此，如果为了测试或验收，先操作你的 APP 以便产生上报数据，随后利用灯塔机制，尽快触发数据上报，方法包括：
- Android TBS 退出浏览场景 2 分钟后，再次进入浏览场景，可以触发上一次浏览行为产生的数据上报。Android QQ 浏览器可以使用浏览器的退出按钮正常退出浏览器，然后再次使用浏览器图标打开浏览器，可以触发上一次浏览产生的数据上报。iPhone QQ 浏览器需要将浏览器切换至后台，2 分钟后重新进入浏览器，可以触发上一次浏览产生的数据上报。灯塔上报数据后，普通查询方式非常耗时，使用“接入实时联调”功能可以做到实时查询上报数据，但需要在 APP 上进行一定的设置，打开实时调试开关，数据才会进入实时查询通道。实时调试已知的打开方式有：

  - Android TBS 想办法浏览，<http://debugx5.qq.com> 调出 X5 调试页面，勾选页面下方的“灯塔日志开关”,退出浏览场景，等待数分钟或关闭重启微信，此时实时调试已经打开，该设置一直有效，除非主动在该页面关闭。Android QQ 浏览器，设置-关于 QQ 浏览器，连续点击底部的“腾讯公司版权所有”，直到闪现提示“渠道号：XXXX”，此时实时调试已经打开。仅在本轮使用过程中有效

  - iPhone QQ 浏览器，从 RDM 等渠道获取的内部 Dailybuild 版本，均已经默认打开实时调试，而正式线上版本无法手动打开实时调试。数据上报后需要在灯塔平台进行实时查询，入口为灯塔-数据查询-接入实时联调，直接访问<http://beacon.tencent.com/beacon.htm?product_id=0M3009N30Q074ILH&platform=iPhone&navId=data2&pageKey=debug_log>，其中 product_id 为 APPKEY，可自行替换。

#### 终端浮窗看终端灯塔上报

- android：【设置】-【关于浏览器】-【点击 5 下 qb icon】-【终端调试及日志】- 【埋点日志】（如果没有找到，输入 qb://info, 密码：0925，将 `是否开启日志开关` 打开）
- iOS：【推荐频道里 feeds 列表点击任意一条置顶新闻】- 【右上角工具箱】- 【调试】- 【Wup 小窗】

#### 置顶相关统计工具

详细说明： <https://docs.qq.com/doc/DZnBMbEhtSVdoQmxP>

## 日志与问题跟踪

### Feeds 染色的查看

正式环境：<http://metis.pcg.com/>
测试环境：<http://test.metis.pcg.com>
主要的染色服务：

- WUPProxy（WUP 服务，所有的 jce 请求先经过 WUPProxy 转发）
- HomepageFeedsNodeServer（feeds 的接入层服务，可以看到数据的所有下发和上报）
- FeedBzReportProxyServer（后台数据上报服务）
- FeedsTabManageServer(Tab 服务)

染色主要场景：根据 GUID 查数据下发、上报

### 如何上传和查看用户 feeds 日志

#### 日志上传方式

- 方法 A：

- 输入 qb://home/feeds?uploadlog 上传行为日志

- 输入 qb://home/feeds?uploaddata 上传数据日志

- 方法 B:

  - android: QB【设置】-【关于浏览器】-【点击 5 下 qb icon】-【Hippy 调试及日志】- 【feeds 调试窗口】-【feeds log 上报】- 【提供 guid】

  - ios: QB【设置】- 【关于 qq 浏览器】- 【线上 qb 包点击 15 下，其他包点击 5 下 qb icon】 - 如果要输入密码【输入 carol】】-【feeds 上报】 - 【feeds log 上报】-【提供 guid】

#### 日志查看方式

- 在<http://logsdk.wsd.com> => RN Info Query 下输入用户 guid 查看日志（日志格式为字符串，建议将内容拷贝出来，反序列化后再查看）

- Pagolin 平台查看日志，过滤规则规则填入 guid，列显示控制勾上"logSdkFilter"进行排序，按顺序多选每一列后右键可以直接"查看 content 组合值 json"自动组合:
  <http://web.pgl.pcg.com/logsearch?project=com.tencent.mtt.feeds&gte=1590982423854&lte=1591587223854&filters=[]&search=>

#### crash 日志监控

##### 终端 RDM 监控

- Android

  - 打开 [RDM 地址](http://rdm.oa.com/products?productId=c77468e3-0645-477b-b430-90a7b85a06e7&sub=product%3Ftarget%3Dnew_rdm%26productId%3Dc77468e3-0645-477b-b430-90a7b85a06e7%26pack%3Dcom.tencent.mtt%26version%3D%26ft%3D%26issue%3D%26imei%3D%26processor%3D%26contact%3D%26hardwareOs%3D%26detail%3D%2522feeds.version%3A1517%2522%26begin%3D%26end%3D%26status%3D0%26osVersion%3D%26rt%3D1548984950291&model=exception)

  - bundleID: com.tencent.mtt

  - Crash 详情: "feeds.version:1522"
    （1522 对应发布系统的 VC）

- iOS

  - 打开 [RDM 地址](http://rdm.oa.com/products?productId=05f842b5-d72c-45ea-b4de-1ce53063f0c8&sub=product%3Ftarget%3Dnew_rdm%26productId%3D05f842b5-d72c-45ea-b4de-1ce53063f0c8&model=exception)
  - bundleID: com.tencent.mttlite
    错误类型： "RCTErrorDomain"

  - 根据 crash 的错误栈，定位到 feeds bundle 包压缩后的行数和列数

##### aegis 监控

可以在 <https://aegis.ivweb.io/#/projectlist> 查看

##### 用户反馈监控

<http://aisee.oa.com/> ，一般有几十万的量的时候，需要快速的拉一个用户反馈，看下整体的 Feeds 反馈情况。（权限可以对应管理员申请）

### 如何查看 feeds jsbundle 号

- 方法 A：

  - 输入 qb://home/feeds?version

- 方法 B:

  - android：【输入 "qb://hippy?debug"】 - 【点击“查看当前业务 jsbundle”号】 - 【截图】
  - iOS: 【输入 "qb://rninfo;"】 - 【bundle 信息】 - 【feeds】- 【截图】（versionname）

### 如何更新 jsbundle

- 非线上包（双端均在蓝盾下载扫码包，权限找对应终端同学开）直接扫码更新，扫码成功后，会有更新提示

- 线上包扫码没有任何反应，需要进行如下步骤：

  - 在[RN 发布平台](http://qrnm.wsd.com)添加 guid 灰度/正式环境白名单
  - android：kill 掉浏览器，冷启动多次，直到 jsbundle 号更新
  - ios: kill 掉浏览器，冷启动多次，直到 jsbundle 号更新；

- 如果在 ios 版本审核期，终端热更新能力会关闭，这时需要打开 hippy 的强制更新开关，操作如下：
  - 【设置】- 【关于 qq 浏览器】- 【线上 qb 包点击 15 下，其他包点击 5 下 qb icon】 - 如果要输入密码【输入 carol】- 【feeds 上报】- 打开【强制拉取】开关，kill 掉浏览器，冷启动多次，直到 jsbundle 号更新

## 迭代&测试&发布

### feeds 与终端对应的版本说明

<https://docs.qq.com/doc/DZkdJcFNLbnN4TVFn>

### 开发周期

目前 feeds 开发走双周需求评审单周开发迭代，对接方主要有广告、游戏、资讯、小说、now 直播等业务。每两周四早上收集各个业务线的产品需求，周四下午进行需求评审，排下一周的迭代需求。评审完的下一周进行开发

### 开发策略

- 分支开发：功能需求的开发都应该在自己拉取的分支上开发，并进行功能测试，分支命名规范 `开发者名称_feature名称`
- 0Bug 合入：功能测试完成，0bug 后面才能发起 MR 合入到 master 分支，需要发出测试报告和需求单
- 发布分支：发布分支的拉取，一般是在集成测试前后拉取一个待集成测试的发布分支。【原则上保证最少代码修改，后续最少代码合并】

### 提测策略

- 功能测试：直接扫描提测。使用自己本地开发分支的代码，打出双平台的二维码，然后在 tapd 上提单

- 功能回归测试：同功能测试

- 集成测试：统一打包。正式环境的发布系统，建一个 release 构建，打包，发布（都是针对白名单生效）。然后在 tapd 上提单。规范可以参考之前的集成测试单

- 集成测试说明：

  1. 测试要在正式（灰度）环境下验证，请对应后台同学在正式（灰度）环境准备好数据
  2. 测试同学在集成单里找到关联的【需求】进行测试
  3. 双端测试均使用线上最新正式包
  4. 如果 guid 从未加入到 feeds 集成测试白名单，需要提供 guid+adr/ios 给@v_chyizou(邹呈义)
     @teemoczwang(王辰正) 加入到白名单
  5. 多次冷启动 qb 后查看 feeds 版本是否正常更新到当前的集成迭代版本
  6. 验证新需求的功能点在集成中是否正常（每个业务测试同学要将浏览器夜间模式、深浅皮肤模式、无图模式下的情况都要覆盖测试）
  7. 测试完成后，测试同学将测试结果同步到群里，并贴到 tapd 集成测试单的评论处

- 集成回归+上线测试：统一打包。一般情况下，集成的回归+上线可以一起提单。在正式环境的发布系统，修改集成使用 release 构建（指向 release 分支），打包，发布（都是针对白名单生效）。然后在 tapd 上提单。规范可以参考之前的集成回归+上线测试单

### CI 流程

目前 feeds 发布主要流程均已接入[蓝盾流水线](http://devops.oa.com/console/pipeline/hippy/list)，以下是发布流程

- 发布流水线（[iOS](http://devops.oa.com/console/pipeline/hippy/p-77b56eef4a58425bb52ba4485ce44021/history)、[ADR](http://devops.oa.com/console/pipeline/hippy/p-573b36be5523491d92243fb12a541f66/history)）监听发布分支 `Branch_Feeds_*` 的`push`事件触发发布构建
- [代码检测流水线](http://devops.oa.com/console/pipeline/hippy/p-cde5da02c1624974b521fee024a9aca0/history) 会监听分支`master,Branch_Feeds_*`的`merge request`事件触发代码检查，检查未通过的 MR 无法合入
- [changelog 自动构建](http://devops.oa.com/console/pipeline/hippy/p-954b697477184a2a9e1691338ba2146a/history) 监听 `master`分支的`merge request accept`事件和 所有分支的`tag_push`事件， 触发对 master 分支的 tag`release_6950`之后的 commit 进行自动构建 changelog， 其中 tag 的命名规则是`/^release_[0-9]*$/` 生成的模板文件是 `markdown.ejs`

### 发布策略

- 每周二开始会对上一周的需求做 CR、合入、集成测试、上线前测试，看测试情况约周四、周五开始进行隔天放量。放量规则：第一天 2%，第二天 30%， 第三天 100%（最晚下周一全量）

  **_P.S. feeds 采取截断发布策略，一般只对线上最新的 QB 版本进行下发，老版本除了日常 bug 修复外，不会再合入新需求进行发布_**

- 发布系统地址：
  - QB： <http://qrnm.wsd.com>
  - 白牌：<http://qrnm.wsd.com/browser4huaweip>
  - WiFi 管家：<http://qrnm.wsd.com/wifiManager>
  - 快报极速版：<http://qrnm.wsd.com/QBSpeed>
  - sdk 通用发布分支：<http://qrnm.wsd.com/sdk_normal>

## 广告相关

### 广告数据上报

广告点曝是营收核心指数，需要重点关注，其它上报数据有视频播放时长、点击区域、用户手势等。上报对象包括 AMS、商业中台、第三方监测（C2S、adMaster、MMA）、灯塔、show 平台等等，具体受广告投放端、广告主要求等影响，以产品同学输出的上报要求为准。上报方式，主要有 cgi 上报、wup 接口上报、终端 api 上报。

#### AMS

- 广告的投放端为 AMS 的，需要向 AMS 上报广告点曝等数据，采用在鹰眼加白名单的方式进行验证
- 常用方式是 CGI 上报
  - 点击 CGI 会先上报点击而后 302 到落地页，商业中台透传该 CGI 到 feeds 的 sUrl 字段，用户点击跳转落地页时将自动上报，无需开发同学单独上报
  - 曝光 CGI 由商业中台透传到 exposure_report，由 feeds 框架按严口径上报，无需开发同学单独上报
- GCI 域名，`ttc.gdt.qq.com`、`c.gdt.qq.com`，常见完整 CGI 举例
  - <http://ttc.gdt.qq.com/gdt_mclick.fcg?viewid=QYmSbaiLUJLWfs5w1kolTHjWDECBzMOEjc0WzuICCt1K6GyqX!ggB_nsY7OyANoC_7AqXllb5wFNbfthEHoAXL7zKCdGXaW1qlu93CyuJvWrxioJty6623hX1hpMq2eOO!TvJ1!qJ2d7qWrJQq9l00r!C35VorK!znYTbAko49Hyo63PkiNXUzhwxkYT1yeT&jtype=0&i=1&os=7&s_lp=101&clklpp=__CLICK_LPP__&cdnxj=1&noyyburl=1&xp=0>
  - <http://c.gdt.qq.com/gdt_mclick.fcg?viewid=5jCA3DZxp1qefj2KNtFBX6U6_8Q1Ui27Yyc_bn9pj53Brlj7XsEMC7NKEHGLyBCiKab1GwG2iLUVk_gjEKnjYCKQTsNcvtL__70F7z59zLX0Mca6QNBNMFBiRXCLInaSRhSvq2wFWkPjS83QtfFwwrcAS7irEzIuQhXC9Pcj9YCnx5IxVuTPYG5bVbukf9qQ9d9kgi5eMFHlakTpYOLHid5rMRn8QuERsk7clqDCcJhaEyPFvoQtHoCyLSlMXnlNTtFjiVfkMxHS8OkKpfojXA&jtype=0&i=1&os=2&asi=%7B%22mf%22%3A%22SM-G9500%22%7D&subordinate_product_id=81744353;000116083737363233333839&s_lp=101&lpp=click_ext%3DeyJlZmZlY3RfY2xpZW50Ijo1MSwiZW52IjoxLCJleHBfcGFyYW0iOiJ2aXZvTWFya2V0RG93bmxvYWQ6MSIsImludm9rZV91cmwiOiJwaW5kdW9kdW86Ly9jb20ueHVubWVuZy5waW5kdW9kdW8vbWxwX2xhbmRfbmQuaHRtbD94X2lkPTcyJl9vY19hZHNfY2hhbm5lbD1nZHQmX3BfYWRzX2NoYW5uZWw9Z2R0Jl9wX2Fkc190eXBlPWxheGluJl9wX2xhdW5jaF90eXBlPWFkdiZhbXNfYmFja3VybD1tdHRicm93c2VyJTNhJTJmJTJmIiwic2hvcnRfcG9zX2lkIjoyNjkxMjh9&clklpp=__CLICK_LPP__&noyyburl=1&xp=3&qbappid=15&qbposid=100213&qb_landingpage=https%3A%2F%2Fagentqb%2Enfa%2Eqq%2Ecom%2Fnode%2Fajax%3Faction%3Dclickstat%26st%3DNe797OO2Zf71du2w2GP6OKVi%255FG6LZPCJhNYfyjH4RDLvWiuFxpIc5ONT0ZFhFjDjwNURNh1E6NBfW%2521z5yurU864VgWaANHabbj%255FuoNaeHHiD7gKh89V2Oym5EZRijNNMDAq%2521g34hbeD%255FJg6lVPMXyoec6rH0hcoVb%255Fi%255FB7qGYhpEgN3kIMSqtAMTXLH8DtWvmNwpTo2qJIWt085OIQKcO2erLJlivTtv%255Fi3bNNpFTMYA6WSUm2J%255Fw15fFByfNKrAWlCu6dIjFiy1gw529gq2EGqACGWnKOKSbQwFTDnlENwaAXeT8i%2521z1mLOH0UBSKjWnbIDVcjj%255FjfRbUpcY3VaT1x4aQdX9xg9U6a6IkEjlemP3NgMeVawyBscsPNqOK4zBE%2521j57JAJ5e6zSGSJQpusIh%2521i4V%255F0bnZWup68CzuiQjxAfqkpLMwa0TYvCK0A23x5xrzEHkwhOibh68a7z3tfB2Zhdk%255Fp6I5FPzKO6YKg0%255F0ZRypTD6El2r4eW3mWTWq5Qbrs9vAvg0LkUmXXHHRYX9JG0JLbhpWQ5Da8cdYrAud1N2d53ruyitQCOVdwdZVIrxbCP70zdrjArgUqo83gzKhfc5Uww6DcCyFMYI1KdRwK169dX740BhMbG4sUoCpFiSL2GHIUPhYWYQyVlXLJAvmyH5snuI15nFvZyBMvD3PuSpmNHcICmY0UrAXYAAXOPZzgFydRMzFvwySvufewf%255FF5Vt1c832jgu1xRl%2521GeU%253D%26d%3D1>

#### 商业中台

- 广告的投放端为商业中台流金系统的，需要向商业中台上报广告点曝等数据
- 常用方式是 CGI 上报、wup 接口上报，两者皆通过对`NFA.AdsProxyServer.getOrReportDataByBusinessId`服务进行染色拉取日志进行上报验证
  - 点击 CGI 会先上报点击而后 302 到落地页，商业中台透传该 CGI 到 feeds 的 sUrl 字段，用户点击跳转落地页时将自动上报，无需开发同学单独上报
  - 曝光 CGI 由商业中台透传到 exposure_report，由 feeds 框架按严口径上报，无需开发同学单独上报
  - 视频播放时长、点击区域、用户手势一般采用 wup 接口上报的方式，`NFA.AdsProxyServer.getOrReportDataByBusinessId`
- GCI 域名，`agentqb.nfa.qq.com`、`agentqb.sparta.html5.qq.com`，常见完整 CGI 举例

  - 第一套:

    - 点击: `action=clickstat`
      <https://agentqb.nfa.qq.com/node/ajax?action=clickstat&st=_2o1yzkXxbEQ3GqouHvk%21Lav2l_SKzcUw81i878PM6Sj5kk_7oYv0rVG8BU%21n1PhuQzR8RrZ%21k5BLOITBISSip6nndP8zMvga2SPzhibRuks9Ui5mY9IOyYU8NrTwX1T2N389c%21HOx7oqgA29SysN%21pKO1pTXRJ1kqIf1K7CHguI8kkFBAinaRw4TwLabOOIqBhUWHUQ3s6QMO1Yz28BephhycSl%21lApNmPNT7dFHSBNDSA4dKQpsxBCana4_e6hN32i5PjrwAVpAM8z0N2imOuppoUMkmKuzI5xP4ETqpeRtyFPxjFUnxl9UpyV561QRAdvkEOUMTY%3D&dt=https%3A%2F%2Fweixin%2Extep%2Ecom%2Ecn%2Fmobile%2Fspecial%2F201806150003%3Futmsource%3Dffhxy%26adtag%3Dqb%2Eppc%2E15%2E100213%2E202813>
    - 曝光: `action=exposurestat`
      <https://agentqb.nfa.qq.com/node/ajax?action=exposurestat&st=5xzwS6t3zmbHkz8yNFdlzhl%5FI3ONTuTvzSId96aroEusg2%21ABdkeikZixajVb4SRDczQOhhv1z2SQ%21EniD%5FwyvC20CbRAsW%218scCwV8nP9fgPazEbQZVgPqrHD9V3WoW8D6oMohNYSo3GXb%5FKRF%21uR6mZxLakvLBfEvfspAD6BMFjG5di09EUYWFEGz%21NiyVZvvT2NzNZI0%21cpFbDbuevPWzpV2hRFQtRO%5FQRUXthbwOlz2U8PVMQJK3kCHBRclpB1p1LrDhUDuvo5a040sAxHMxLYUGzVdrCEdc18OjTKn9GF1HLuduHR3GBZ7lDhwIpSNkj7OOg4RIIgPh6FTOrY6KS%210Pry8aR1E2xRVW8rx8etA0r3Xl83ukPHvlzfm48yryYygjqje%5FAk4b1wn3EL5Vwe0DpPG3bTRr8s6SgDTXG%5FbZHUG2wK%5FtK323QzwGl2fFhrgw44t2usfZ9ilWGCkgimjbDs43IR8Vpmfh7zEZeMeAb4zaMq1SF%5F0kqyetvbml9qo0dwMIa2wCVDKYPB8wYHUJYurprL34cQjSUYjCmaEavg%21u4lLxOOKkogPPbeUSLi4A067%21sFM7YPSvJcAdwPvwCzF7vEfugOuzXIcyYqz95PVNesTx91IunOJkaxIs1GufoF4JqjT%5FIeTToTviYbJUDCzTuSN7ELdqgzaZ7v%21SiMX%5FcMvID3wAdHCMu3cU%5FdR5Pm5%21%5FFGObVaRBi8jOQR4JieZ0a2nCGgeQDo%3D&gt=http%3A%2F%2Fv%2Egdt%2Eqq%2Ecom%2Fgdt%5Fstats%2Efcg%3Fviewid%3D5jCA3DZxp1qefj2KNtFBX6U6%5F8Q1Ui27Yyc%5Fbn9pj53Brlj7XsEMC7NKEHGLyBCiKab1GwG2iLUVk%5FgjEKnjYCKQTsNcvtL%5F%5F70F7z59zLX0Mca6QNBNMFBiRXCLInaSRhSvq2wFWkPjS83QtfFwwrcAS7irEzIuQhXC9Pcj9YCnx5IxVuTPYG5bVbukf9qQ9d9kgi5eMFHlakTpYOLHid5rMRn8QuERsk7clqDCcJhaEyPFvoQtHoCyLSlMXnlNTtFjiVfkMxHS8OkKpfojXA%26i%3D1%26os%3D2%26xp%3D3&fg=0>
    - 出错，`action=reporterror`
      <https://agentqb.nfa.qq.com/node/ajax?action=reporterror&st=zz%5FUOIBM4X9pEw7pnnc0X2lWAW16%5FrkQrYPnoH%5FV5DytijgF8jm0CMYjJ4Pmm4%21ZTrU5Ds13ea4D0kfsvMLch4PlV1aW%5FFHWfz8MfZhOeuJA4SAVds2TiTqqrBPifeKzAN0krqaiPtfh4X6Z3KTgpNcfVOzOORxUNbQyGhDfeLUowx6ww%21xRO1IW9%21SIfDqGHCSDmI2oypf%5FqYR1TV9bD35o%5FGV08AUzic0fh4iaY%21GeI8xfLD%21N30iDwz1FXFSq7n068JHElQNGkLhgickLUu3v%5FqGE1FDSUvp%5FbLL5NOSFiywB0DCKavQG4hGBal%21%5FDNHcJgE0IqVTljCrqqgEMueGdVwGDu6hy55oqV0mPMLq5TD%5FYb33oWx4d4ctlhbJTi%5Fe5tcCSZMDJYPn0IZYQqmXxKH8g7p9YokIyfUpX34XD8CRvVutmGxpkaOqXSmX71Je6GLNX8c%3D>

  - 第二套：
    - 点击，`acttype=0`
      <https://agentqb.nfa.qq.com/node/ajax?action=commreport&st=WVU3WB0SaUoWgtORIHeNbKkBjVoQsLrwJgwqf8EGPJ1LyBNRS%5FBEFH52z1zBPDtgsXDmxk1shKf9hcL%5FLTuk8DitfujD1IkUPeYkPXYajOwuAHXhofK34mLfawxXOMndMvey1UW7vPhpCtf1ox1Ck96%21LSz9W4XqoN%21gwZ7M%21l4HMvFriwzQ%5Fr%5FKgttPcD7pU9VxGQJMaAcZJkGS4ZGWa%5FqPknE6dMD6X%5FftzrghSqdXtSAi0E9g60q822nmOWOD8XkZsuHn5%21XlEAm8JKCjUojvqbLC%5FScO6du3c2vyXcI2cnQe8%21XREkKsQ90PpMQPgigH0wwmZjwTPHo3n2jFAcOJHZnePBA68nC3tRvrUjcMF31yzVoLgw%3D%3D&acttype=0>
    - 曝光，`acttype=1`
      <https://agentqb.nfa.qq.com/node/ajax?action=commreport&st=WVU3WB0SaUoWgtORIHeNbKkBjVoQsLrwJgwqf8EGPJ1LyBNRS%5FBEFH52z1zBPDtgsXDmxk1shKf9hcL%5FLTuk8DitfujD1IkUPeYkPXYajOwuAHXhofK34mLfawxXOMndMvey1UW7vPhpCtf1ox1Ck96%21LSz9W4XqoN%21gwZ7M%21l4HMvFriwzQ%5Fr%5FKgttPcD7pU9VxGQJMaAcZJkGS4ZGWa%5FqPknE6dMD6X%5FftzrghSqdXtSAi0E9g60q822nmOWOD8XkZsuHn5%21XlEAm8JKCjUojvqbLC%5FScO6du3c2vyXcI2cnQe8%21XREkKsQ90PpMQPgigH0wwmZjwTPHo3n2jFAcOJHZnePBA68nC3tRvrUjcMF31yzVoLgw%3D%3D&acttype=1>
    - 播放时长，`acttype=14`
      <https://agentqb.nfa.qq.com/node/ajax?action=commreport&st=gsFHYy4VGDIoSRazI7IUVWFeVA6VThOwjrk565pCbS4dFSwlTVr0uEbH0hWjZQ8gIqzpa%21AFe1gI%216NBzumkuSd84%5F71WMQBBsPK37fYbGfp0MQKv%21Z67eJEwlKVSriNg7SgxLIpjhCnU4pahUt2vxSJf%21TTzKZSMXpiw84bY9gVjaiyNo1sQa8xbRtblodT1WIZNCI0i%21RU4rqu%5Fd9J9gcIqFRI0H%5FleLTVR0ZvgDnas0fslfTmXhTp7hADLIpgUNQyJztEiE2ny%5FcjPmC3hMpqWhG3VQiM4ZshcQuSsbVYbXTEOGNaOn0nwzpTdnGA97N0dm21ZmY8n%5FOHJU1DGLsSvhYVRJvS33tgHz8VjGwIAdIkXZig1vJZit%5FdKQHbhOBWbCHYUOL%21lI5f2uBHKFCLlR8rLCu78Kf%21V6mvFPd4nc1%5F4M9uLwItIa35LCOmwgvi3jDvFYHY0e5fQmY7KwXAjbhpkLRBxNwbf2v03euW6S7I7j8pLA%3D%3D&dt=http%3A%2F%2Fv%2Egdt%2Eqq%2Ecom%2Fgdt%5Fstats%2Efcg%3Fviewid%3DWuPokLLdxlTjcBbUBidWdFsXEPUyky9tZwlY57OVm7vMq04pdH%5FvMz6fjHW2XE3iBIR5HSGFT1wgRuLPhyv8Bh1%5FLd%21pyuD7rhhkqS5dqxfm3aCgBYwieknUTDS%21ieaoRhSvq2wFWkPjS83QtfFwwrcAS7irEzIuQhXC9Pcj9YBxqfee19FPCKc6eX21XyQWe6lqyUKvZdNNA9gVud3t4ALMrMI5w1OJTZd7Up%21kTkac%21YVoSm6jLn8JqGXABAcISWqqqAsFGyoliSyjuoRCHT8GeHrjKpXx%26i%3D1%26os%3D2%26xp%3D3&acttype=14>

#### 第三方监测

- 第三方监测提供给广告主更多一个有公信力的监测方，如今越来越受广告主青睐
- 常见第三方监测
  - C2S，直接上报 CGI
    <http://tytx.m.cn.miaozhen.com/x/k=2133945&p=7RI85&dx=__IPDX__&rt=2&ns=__IP__&ni=__IESID__&v=__LOC__&xa=__ADPLATFORM__&tr=__REQUESTID__&mo=__OS__&m0=__OPENUDID__&m0a=__DUID__&m1=__ANDROIDID1__&m1a=__ANDROIDID__&m2=__IMEI__&m4=__AAID__&m5=[IDFA]&m6=__MAC1__&m6a=__MAC__&txp=__TXP__&o=>
  - adMaster，直接上报 CGI
    <http://v.admaster.com.cn/i/a134334,b3726457,c2343,i0,m202,8a2,8b1,j__UID__,0a2,n__MAC__,z488C1478BDD61D085CB037C0BB36AF4E,0d__ANDROIDID__,0c__IMEI__,f10.66.150.150,t__TS__,l__LBS__,h>
  - MMA，采用终端 API 上报，点曝都是 `QBStatisticModule.MMAOnExpose`，最终产生两个 CGI 上报，一个报第三方，一个上报 AMS
  - 报第三方的 CGI
    <http://tytx.m.cn.miaozhen.com/x/k=2140872&p=7TC3D&dx=__IPDX__&rt=2&ns=__IP__&ni=__IESID__&v=__LOC__&xa=__ADPLATFORM__&tr=__REQUESTID__&vg=__AUTOPLAY__&nh=__AUTOREFRESH__&mo=__OS__&m0=__OPENUDID__&m0a=__DUID__&m1=__ANDROIDID1__&m1a=__ANDROIDID__&m2=__IMEI__&m4=__AAID__&m5=__IDFA__&m6=__MAC1__&m6a=__MAC__&m11=__OAID__&txp=__TXP__&vx=__VIEWSEQ__&ve=__DISVID__&vg=__AUTOPLAY__&vd=__DETAIL__&vf=__GROUP__&va=1&o=>
  - 报 AMS 的 CGI
    <http://rpt.gdt.qq.com/viewimp?mma=1&viewid=TUXeJQJi_Pc24bnB_pSp!0sZNbIVQPSjw!ESgBCC2RS6pnUVBLsbtgQZQTKFJMo7t1cCh7FdlCs!aj3yc_3ryIN0V36jx1a6rZSfILKnxWVOe7yXF3EbmlvwryBjWkmfu3qLdT8XO51oNXdmiTELiD9_19lU!3ZUM!TYvK33Ga7k39NdAlvkGuvevuJ0gu3VNrCaDYTqx06dERJs3Rj5stCjgqByUiGX10JhTbmhmjs>

#### 灯塔

- 特殊场景需要上报点曝给灯塔，比如闪屏广告，用作数据印证
- 采用终端 API 上报，`QBStatisticModule.userBehaviorStatistics`

#### show 平台

- 在广告上报中，用得较少
- 采用 WUP 接口上报，`reportCustomLog`，上报 key 値定义参照<http://tnpm.oa.com/package/@tencent/info-report>，上报数据可在 show 平台查看，<http://show.wsd.com/show3.htm?viewId=t_md_mtt_info_custom_stat&>

### 广告播放器

- 广告播放器由终端提供，拼接 H5 落地页地址，即可自动上报用户在 H5 上行为数据
- 广告播放器协议
  1. QQ 手机浏览器的 scheme 为`"mttbrowser://"`
  2. 不同属性字段用","分隔
  3. 属性名和属性值用"="分隔
  4. 可选属性(不区分大小写)：url: 希望浏览器打开的目标地址，缺省为空；windowType=1，如果调起广告播放器就设置成 1，否则为 0
- 广告播放器协议举例

  `mttbrowser://url=<http://c.gdt.qq.com/gdt_mclick.fcg?viewid=5jCA3DZxp1qefj2KNtFBX6U6_8Q1Ui27Yyc_bn9pj53Brlj7XsEMC7NKEHGLyBCiKab1GwG2iLUVk_gjEKnjYCKQTsNcvtL__70F7z59zLX0Mca6QNBNMFBiRXCLInaSRhSvq2wFWkPjS83QtfFwwrcAS7irEzIuQhXC9Pcj9YCnx5IxVuTPYG5bVbukf9qQ9d9kgi5eMFHlakTpYOLHid5rMRn8QuERsk7clqDCcJhaEyPFvoQtHoCyLSlMXnlNTtFjiVfkMxHS8OkKpfojXA&jtype=0&i=1&os=2&asi=%7B%22mf%22%3A%22SM-G9500%22%7D&subordinate_product_id=81744353;000116083737363233333839&s_lp=101&lpp=click_ext%3DeyJlZmZlY3RfY2xpZW50Ijo1MSwiZW52IjoxLCJleHBfcGFyYW0iOiJ2aXZvTWFya2V0RG93bmxvYWQ6MSIsImludm9rZV91cmwiOiJwaW5kdW9kdW86Ly9jb20ueHVubWVuZy5waW5kdW9kdW8vbWxwX2xhbmRfbmQuaHRtbD94X2lkPTcyJl9vY19hZHNfY2hhbm5lbD1nZHQmX3BfYWRzX2NoYW5uZWw9Z2R0Jl9wX2Fkc190eXBlPWxheGluJl9wX2xhdW5jaF90eXBlPWFkdiZhbXNfYmFja3VybD1tdHRicm93c2VyJTNhJTJmJTJmIiwic2hvcnRfcG9zX2lkIjoyNjkxMjh9&clklpp=__CLICK_LPP__&noyyburl=1&xp=3&qbappid=15&qbposid=100213&qb_landingpage=https%3A%2F%2Fagentqb%2Enfa%2Eqq%2Ecom%2Fnode%2Fajax%3Faction%3Dclickstat%26st%3DNe797OO2Zf71du2w2GP6OKVi%255FG6LZPCJhNYfyjH4RDLvWiuFxpIc5ONT0ZFhFjDjwNURNh1E6NBfW%2521z5yurU864VgWaANHabbj%255FuoNaeHHiD7gKh89V2Oym5EZRijNNMDAq%2521g34hbeD%255FJg6lVPMXyoec6rH0hcoVb%255Fi%255FB7qGYhpEgN3kIMSqtAMTXLH8DtWvmNwpTo2qJIWt085OIQKcO2erLJlivTtv%255Fi3bNNpFTMYA6WSUm2J%255Fw15fFByfNKrAWlCu6dIjFiy1gw529gq2EGqACGWnKOKSbQwFTDnlENwaAXeT8i%2521z1mLOH0UBSKjWnbIDVcjj%255FjfRbUpcY3VaT1x4aQdX9xg9U6a6IkEjlemP3NgMeVawyBscsPNqOK4zBE%2521j57JAJ5e6zSGSJQpusIh%2521i4V%255F0bnZWup68CzuiQjxAfqkpLMwa0TYvCK0A23x5xrzEHkwhOibh68a7z3tfB2Zhdk%255Fp6I5FPzKO6YKg0%255F0ZRypTD6El2r4eW3mWTWq5Qbrs9vAvg0LkUmXXHHRYX9JG0JLbhpWQ5Da8cdYrAud1N2d53ruyitQCOVdwdZVIrxbCP70zdrjArgUqo83gzKhfc5Uww6DcCyFMYI1KdRwK169dX740BhMbG4sUoCpFiSL2GHIUPhYWYQyVlXLJAvmyH5snuI15nFvZyBMvD3PuSpmNHcICmY0UrAXYAAXOPZzgFydRMzFvwySvufewf%255FF5Vt1c832jgu1xRl%2521GeU%253D%26d%3D1,windowType=1,ChannelID=com.tencent.mtt,PosID=103,nfa_aid=AA8SAAGHdSAgMAFGAFYJMTY3Njc1NzkzZgnmi7zlpJrlpJp2AIACkl2lroGsvMzc6gwWACYAC/oPBg94dHI0ZHZnZmNxMnptMDEWCjExMDQ3OTAxMTEmGDAwMDExNjA4MzczNzM2MzIzMzMzMzgzOTYVY29tLnh1bm1lbmcucGluZHVvZHVvRgBZDGYIMjA2OTU4MTN2IEQyM0ZEMTFFQ0M0RUY2MjU2RTM1N0RGRURDMjE1MjU1hgCQCaYJ5ou85aSa5aSatgY0Ljc2LjDGBTQ3NjAw1gDmOmh0dHA6Ly9wcC5teWFwcC5jb20vbWFfaWNvbi8wL2ljb25fMTIxODEwMjdfMTU3MDUyNjA2NC8yNTb2DyRodHRwOi8vdC5nZHQucXEuY29tL2NvbnYvc3JjLzUxL2NvbnbwEAL2EQAL9hAA9hEA9hIA9hMA9hQOZ2lkPTExMDQ3OTAxMTH2FQD5FwABCgI7mtjZEjua2NkpDDIACAAARjkxMDA3NzYjMTE0NzU4IzEwMzkzOSMxMDgwNjkjMTExOTEzIzEwMDAwMCMxMTIyOTQjMTA1NjkyfHwL9hgA9Rk/8Cj1wAAAAPwa8BsD9RxAxN6AAAAAAPAd//oeCgUAAAAAAAAAABwpDAsaBQAAAAAAAAAAHAsqBQAAAAAAAAAAHAsL+h8MFgAL9iAFMzkwNTb2IQoyNTIzODM0OTU29SIAAAAAAAAAAPojDBwmAAs=`

### 如何配置及下发广告

浏览器广告的投放端主要为 AMS，PCG 商业中台流金系统，RMP 管理端

#### AMS

- 测试环境广告，<http://ttc.gdt.qq.com/strap#/tool/browser>
- 生产环境广告，按 GUID 配置超级预览，<http://ttc.gdt.qq.com/strap#/tool/super-view>

#### 流金系统

- 测试环境，<http://ad8.test.nfa.qq.com/#/contract/ad>
- 正式环境，<http://ad.nfa.oa.com/#/contract/ad>

#### RMP 配置系统

- 测试环境，<http://test.rmp.wsd.com/#/index>
- 正式环境，<http://rmp.wsd.com/#/index>

## 如何将 feeds 改造成单频道 portal

### 终端 10.2 以前

参考分支 release/coronavirusfeeds，以新建肺炎频道为例子

1. 新起模块名`module: feedschannel`（在发布平台新建 module）

2. `package.json` 的 `name`从`feeds`修改成对应的 module: `feedschannel`
3. feeds 里新建一个独立分支`release/coronavirusfeeds`，修改以下配置

4. `FeedsConst.js`修改以下参数

```javascript
export const MODULE = 'coronavirusfeeds'; // 模块名字
export const COMPONENT = 'FeedsChannelPage'; // 组件名字
export const isFeedsChannelMode = true; // 是否开启单频道模式
export const fixedTabId = 158; // 默认定位的tab
export const singChannelAppId = 114; // appId
```

5. 修改`DefaultTabList.js`

```javascript
 'singleChannelMode': {
   selectedTabs: [
     {
       iId: 158,
       sName: '战肺炎',
       ...defaultCfg,
       bEdit: false,
     },
   ],
   unselectedTabs: [],
 }
```

6. 去除多余事件、元素和上报

- 终端要将所有 `@feeds` 的事件改成 `@coronavirusfeeds`
- 检查终端方法有哪些不支持
- onloadUrl 传到肺炎 hippy 的地址改成`qb://tab/coronavirusfeeds`
- 终端新加上传 feeds 日志入口，事件`@common:opt`回调参数 module 从`feeds`改成`coronavirusfeeds`
- 终端时长上报重新定义`unit: coronavirusfeeds`, `scene: tabId`
- Tab 服务后台根据 appid=114，新配置 tab 下发
- HomepageFeedsNodeServer 服务需要根据新 appid=114 配置转发
- 灯塔上报需要根据 appid 配置、后台上报需要根据 product_id 接入

### 终端 10.2 及以后

终端 10.2 版本以后，会将多个涉及到 module 的部分统一成一个名字，终端会自动根据`component`、`module`、`title` 拉取对应 hippy，qb url 修改为：
`qb://tab/feedschannel?component=xxxx&module=xxxx&title=xxx`

1. `component` 为组件名，对应 `index.js` 文件里的`appName`，如`FeedsHomePage`
2. `module`为终端统一的模块名，如`feeds`
3. `title`为底部 tab 显示的名称

以最新关注底 bar 动态 tab 为例
地址：qb://tab/feedschannel?component=FeedsDynamicPage&module=dynamictab&title=动态
参考 demo 分支：release/dynamic_tab
module：dynamictab

步骤更新如下：

1. 新起模块名 `module: dynamictab`（在发布平台新建 module）, 组件名 `componentName: FeedsDynamicPage`, `appid=119`

2. 资讯上报平台申请新的产品 id，如 appid=119（找 ivanqu）

3. 终端时长上报需要在灯塔申请配置`unit: dynamictab`, `scene: 20（tabId）`（找 mikemi）

4. feeds 里新建一个独立分支，修改以下配置

5. `FeedsConst.js`修改以下参数

```javascript
export const MODULE = 'dynamictab'; // 模块名字
export const COMPONENT = 'FeedsDynamicPage'; // 组件名字
export const isFeedsChannelMode = true; // 是否开启单频道模式
export const fixedTabId = 20; // 默认定位的tab
export const singChannelAppId = 119; // appId
```

6. `DefaultTabList.js`修改打底 tab 配置

```javascript
 'singleChannelMode': {
   selectedTabs: [
     {
       iId: 20,
       sName: '关注',
       ...defaultCfg,
       bEdit: false,
     },
   ],
   unselectedTabs: [],
 }
```

7. `package.json` 的 `name`从`feeds`修改成对应的 module: `dynamictab`

8. 频道服务后台根据 appid=119，新配置 tab 频道下发（找 wordenwang 、roypzheng）

9. feeds 接入层 HomepageFeedsNodeServer 根据 appid=119 配置对应拉取的频道内容（找 jiechang）

10. 终端在 rmp 根据 `qb://tab/feedschannel?component=FeedsDynamicPage&module=dynamictab&title=动态`，配置底 tab（找 jasoonzhang）

11. iOS 需要给 feeds 内置包，adr 只需要发布

12. 灯塔上报需要根据 appid=119 验证、后台上报需要根据 product_id（尽量跟 appid 一致）接入（找后台对应同学和数据相关同学）
