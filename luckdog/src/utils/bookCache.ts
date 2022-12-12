
import { logError } from '@/luckdog';
import QBFileOPModule from './QBFileOPModule';

/** 本地有已经缓存的书籍 */
let bookListMap: Map<string, string> = new Map();

const getCacheBookList = async (): Promise<string[]> => {
  try {
    const result: { data: string[]} = await QBFileOPModule.getFileList({ businessName: 'novel', subFilePath: '/book/' });
    const { data = [] } = result || {};
    return data;
  } catch (e) {
    return [];
  }
};

/** 初始化终端缓存书 */
export const updateCacheBooks = async (): Promise<void> => {
  try {
    const cacheBooks = await getCacheBookList();
    // 清空一下 重新设置
    bookListMap.clear();
    // 初始化的时候转map对象，方便去重,和读取
    if (cacheBooks && cacheBooks.length > 0) {
      bookListMap = new Map();
      cacheBooks.forEach((book) => {
        bookListMap.set(book, '1');
      });
    }
  } catch (e) {
    logError(e, 'bookCache.updateCacheBooks');
  }
};

/** 删除单本终端缓存书 */
export const deleteSingleBook = async (bookId: string): Promise<boolean> => {
  try {
    const { result } = await QBFileOPModule.deleteFile({ businessName: 'novel', subFilePath: `/book/${bookId}` });
    if (result) {
      bookListMap.delete(bookId);
    }
    return result;
  } catch (err) {
    logError(err, 'bookCache.deleteSingleBook');
    return false;
  }
};

/** 批量删除缓存书籍 */
export const deleteCacheBooks = (books: string[]): void => {
  if (!books || books.length === 0) return;
  books.forEach((book) => {
    if (isCacheBook(book)) {
      deleteSingleBook(book);
    }
  });
};

/** 获取终端缓存书 */
export const getCacheBook = (): Map<string, string> => bookListMap;

/** 判断这本是否属于缓存书 */
export const isCacheBook = (bookId: string): boolean => bookListMap.has(bookId);

