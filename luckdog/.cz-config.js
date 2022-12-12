module.exports = {
  types: [
    {
      value: 'feat',
      name: 'feat: 新增一个功能',
    },
    {
      value: 'fix',
      name: 'fix: 修复一个Bug',
    },
    {
      value: 'docs',
      name: 'docs: 文档变更',
    },
    {
      value: 'style',
      name: 'style: 代码格式（不影响功能，例如空格、分号等格式修正）',
    },
    {
      value: 'refactor',
      name: 'refactor: 代码重构，注意和特性、修复区分开',
    },
    {
      value: 'perf',
      name: 'perf: 提升性能',
    },
    {
      value: 'test',
      name: 'test: 添加一个测试',
    },
    {
      value: 'chore',
      name: 'chore: 变更构建流程或辅助工具',
    },
    {
      value: 'revert',
      name: 'revert: Revert to a commit',
    },
    {
      value: 'WIP',
      name: 'WIP: Work in progress',
    },
  ],

  scopes: false,

  // override the messages, defaults are as follows
  messages: {
    type: '选择一种你的提交类型:',
    subject: '简述本次提交内容:\n',
    footer: '关联关闭的issue(可选)，例如：#31, #34:\n',
    confirmCommit: '确定提交commit?',
    customInputList: '请选择你的tapd关联类型',
  },

  tapd: true,
  allowCustomScopes: false,
  // allowBreakingChanges: ['feat', 'fix'],
  allowBreakingChanges: [],
  // skip any questions you want
  skipQuestions: ['scope', 'body', 'breaking'],

  // limit subject length
  subjectLimit: 100,
  // breaklineChar: '|', // It is supported for fields body and footer.
  // footerPrefix : 'ISSUES CLOSED:'
  // askForBreakingChangeFirst : true, // default is false
};
