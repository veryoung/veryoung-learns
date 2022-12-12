/** 对需要替换其实现的文件进行全局 mock */

jest.mock('@/luckdog/logger');
jest.mock('@/communication/FeedsTraversal');
jest.mock('@/utils/shareSettings');
