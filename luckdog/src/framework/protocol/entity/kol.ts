import { BaseBook } from './books';
import { Tag } from './tag';

/** KOL */
export class KolBook extends BaseBook {
  /** kol资源名字 */
  public kolName = '';
  /** kol资源内容 */
  public kolContent = '';
  /** kol资源推荐内容 */
  public kolReason = '';
  /** kol落地页 */
  public kolJumpUrl = '';
  /** kol 用户头像集合 */
  public kolProfile?: Tag[];
  /** kol封面地址 */
  public kolPicUrl? = '';
}

