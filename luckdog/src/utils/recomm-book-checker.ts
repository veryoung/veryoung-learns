import { addKeylink, KeylinkCmd, logError } from '@/luckdog';

export default class RecommBookChecker {
  /** 当前所在tabID */
  private tabId = 0;
  /** 当前一刷内所有推荐书籍的bookId  */
  private currentBookIds: string[] = [];

  public constructor(tabId: number) {
    this.tabId = tabId;
  }

  /** 重置推荐书籍检查器 */
  public reset = () => {
    // 重置当前一刷内所有推荐书籍的bookId
    this.currentBookIds = [];
  };

  /** 检查书籍ids */
  public checkBookIds = (bookIds: string[]): void => {
    // 获取重复书籍并设置未重复书籍
    const repeatedBooks = bookIds.filter((bookId) => {
      const isRepeat = this.currentBookIds.includes(bookId);
      if (!isRepeat) this.currentBookIds.push(bookId);
      return isRepeat;
    });
    // 如果有重复内容 需要上报
    if (repeatedBooks.length > 0) this.writeRecommBookRepeatLog(repeatedBooks);
  };

  /** 处理重复日志 */
  private writeRecommBookRepeatLog(bookIds: string[]) {
    try {
      const log = {
        bookId: bookIds.join(','),
        tabId: this.tabId,
      };
      addKeylink(`recomm-repeat-book--report, log = ${JSON.stringify(log)}`);
      addKeylink(`recomm-repeat-book-report = ${bookIds.length}`, KeylinkCmd.PR_SUM);
    } catch (error) {
      logError(error, 'RecommBookChecker.writeRecommBookRepeatLog');
    }
  }
}
