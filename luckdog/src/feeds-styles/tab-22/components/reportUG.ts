import { addKeylink, KeylinkCmd, logError } from '@/luckdog';
import { getSearchParams, isTopTab, getDeviceVisitor, getUserVisitor } from '@/luckbox';
import { TabTypeConfig } from '../../../entity/tabs';
import { WEB_HOST } from '@/framework/FeedsConst';

const opt = { isReported: false, repeatTime: 0 };
const NovelDoReportUgUtil = {
  async sendReport() {
    const { isReported } = opt;
    // 一次生命周期只进入一次
    if (!isReported) {
      opt.isReported = true;
      const deviceInfo: any = await getDeviceVisitor().isReady();
      const { qbid } = await getUserVisitor().isUserReady();
      const version = getDeviceVisitor().getJsVersion();
      const { guid, qimei, advertisingIdentifier, qua2, id, oaid  } = deviceInfo;
      const staticCh = isTopTab() ? '001995' : '004760';
      const { ch = staticCh } = getSearchParams();
      const params = {
        guid,
        qbid,
        imei: qimei,
        oaid,
        ch,
        androidId: id,
        idfa: advertisingIdentifier,
        version,
        accessScene: 1,
        apptype: 0,
        fromType: isTopTab() ? TabTypeConfig.TOPTAB : TabTypeConfig.NOVELFEEDS,
      };
      const url = `${WEB_HOST}/qbread/api/report/new-user`;
      const header = {
        'Q-UA2': qua2,
        referer: WEB_HOST,
        'Content-Type': 'application/json',
      };
      try {
        const starttime = Date.now();
        const res =  await this.report(params, url, header);
        addKeylink(`report-new-user=${Date.now() - starttime}`, KeylinkCmd.AJAX_COSTTIME_AVG);
        return res;
      } catch (error) {
        addKeylink('report-new-user', KeylinkCmd.AJAX_ERROR_SUM);
        logError(error, 'NovelDoReportUgUtil.sendReport');
        return null;
      }
    }
  },

  async report(params, url, header) {
    let resBody = '{}';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(params),
      });
      const { body } = res as any || {};
      resBody = body && body !== '' ? body : '{}';
      const { ret } = JSON.parse(resBody) || {};
      // 发起重试,并记录重试次数
      if (ret === 0) {
        opt.repeatTime = 0;
      } else if (opt.repeatTime < 3) {
        opt.repeatTime += 1;
        this.report(params, url, header);
      }
      return ret;
    } catch (e) {
      logError(e, 'NovelDoReportUgUtil.report');
      if (opt.repeatTime < 3) {
        opt.repeatTime += 1;
        this.report(params, url, header);
      }
    }
  },
};

export default NovelDoReportUgUtil;
