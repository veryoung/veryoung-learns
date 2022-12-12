module.exports = {
  // 项目负责人列表，用于推送测试报告等，填写 rtx，例如 [rtx1, rtx2]
  projectOwner: ['hilonliao', 'allanyu', 'ricoxiao', 'azeryang'],

  // 蓝盾平台（http://devops.oa.com/）流水线的配置参数
  devopsPipeline: {
    // UV-单元测试
    unitTest: {
      // 是否跳过测试，用于临时调试
      disableTest: false,
      // 是否为调试模式，该模式下不会上报数据到效能平台进行epc统计，用于临时调试
      isDebug: false,
      // 质量红线配置
      quality: {
        // 用例通过率
        passRate: 99.5,
        // 全量代码行覆盖率
        allLineCov: 15,
        // 增量代码行覆盖率
        newLineCov: 0,
      },

      // 【终端平台测试插件】
      eptest: {
        // 项目名，即在 EPTest 平台上的名字
        projectId: 'novel-of-pcg',
        // 执行命令
        cmd: 'tnpm install && tnpm test',
      },

      macaron: {
        projectId: '79b320b1-81f5-4cbb-8bf9-347ec757',
      },
    },
  },

  defaultTestBaseInfo: {
    author: '***', // 某个开发同学，比如aaa、bbb
    priority: 'p0',
    casetype: 'unit', // 测试类型，unit - 单元测试
  },
};
