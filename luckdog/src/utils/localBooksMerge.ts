import { addKeylink, KeylinkCmd, logError } from '@/luckdog';
import FeedsAbilities from '../framework/FeedsAbilities';
import FeedsIcon from '../framework/FeedsIcon';

export interface CollectBook {
  inFolder?: boolean;
  sAuthor?: string;
  sBookId?: string;
  sPicUrl?: string;
  sTitle?: string;
  sUpdatedNumber?: string;
  sUrl?: string;
  stIcon?: {
    iColor: number,
    sText: string,
    usIconId: number,
  };
  timeStamp: string;
  iTimeStamp?: string;
  numberOfChapters?: number;
  readingChapterName?: string;
  isAddBooks?: boolean;
  vCollectBooks?: any;
}

interface MergeBooks {
  booksList: CollectBook[],
  localBookLength: number;
}

const TAG = 'localBooksMerge';

/** 对本地书和远程书按时间进行排序 */
export const bookListSort = (booksList: CollectBook[], localBooksList: CollectBook[]): CollectBook[] => {
  if (localBooksList.length === 0) return booksList;
  if (booksList.length === 0) return localBooksList;
  const bookList = ([] as CollectBook[]).concat(booksList);
  let temp = 0;

  for (let i = 0; i < localBooksList.length; i++) {
    while (temp < booksList.length) {
      const bTimeStamp = parseInt(localBooksList[i].iTimeStamp || localBooksList[i].timeStamp, 10);
      const aTimeStamp = parseInt(booksList[temp].iTimeStamp || booksList[temp].timeStamp, 10);
      if (bTimeStamp - aTimeStamp >= 0) {
        bookList.splice(temp + i, 0, localBooksList[i]);
        break;
      } else {
        temp += 1;
      }
    }
  }
  return bookList;
};


/** 处理本地书和远程书排序和合并 */
export const localBooksMerge = async (books: CollectBook[]): Promise<MergeBooks> => {
  try {
    const res = await FeedsAbilities.loadNovelLocalBooks();
    const { bookInfos } = res;
    if (!res || !bookInfos) {
      return {
        booksList: books,
        localBookLength: 0,
      };
    }

    // 上报无 id 书籍
    const booksWithoutId = bookInfos.filter(({ bookId }) => !bookId);
    if (booksWithoutId.length) {
      addKeylink('local-books-without-id', KeylinkCmd.PR_ERROR_SUM);
      addKeylink(`booksWithoutId: ${JSON.stringify(booksWithoutId)}, length: ${booksWithoutId.length}`, TAG);
    }

    const localBooksList = bookInfos.filter(({ bookId }) => !!bookId).map(book => ({
      sPicUrl: book.epubcover || FeedsIcon.novel_default_cover,
      sTitle: book.bookName,
      sBookId: book.bookId,
      stIcon: {
        iColor: 5,
        sText: (book.CollectBook || 'TXT').toUpperCase(),
        usIconId: 0,
      },
      ...book,
    }));
    const booksList = bookListSort(books, localBooksList);

    addKeylink(`localBooks.length: ${bookInfos.length}, remoteBooks.length: ${books.length}`);

    return {
      booksList,
      localBookLength: bookInfos.length || 0,
    };
  } catch (e) {
    logError(e, TAG);
    return {
      booksList: books,
      localBookLength: 0,
    };
  }
};

