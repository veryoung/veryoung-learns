
import { logError } from '@/luckdog';

export default class FeedsProtect {
  // componentDidCatch Hippy暂时不可用，因此劫持render来实现异常捕获
  public static protect(target) {
    const origRender = target.prototype.render;
    // eslint-disable-next-line no-param-reassign
    target.prototype.render = function () {
      try {
        return origRender.call(this);
      } catch (e) {
        logError(e, `FeedsProtect.${target.name}`);
        return null;
      }
    };
  }
}
