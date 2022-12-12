import { BaseBook } from './books';
import { Tag } from './tag';

export class BookInShelf extends BaseBook {
  /** 左上角标 */
  public leftTag: Tag = new Tag();
  /** 右上角标 */
  public rightTag: Tag = new Tag();
  /** 阅读进度 */
  public readProgress = '';
  /** 是否真实书籍 */
  public bookType = true;
}

export class CollectionInShelf  {
  /** 图片地址(最多四张) */
  public picUrls?: string[] = [];
  /** 跳转地址 */
  public jumpUrl?: string;
  /** 藏书总数 */
  public total = 0;
}
