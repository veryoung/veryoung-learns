import { QBToastModule } from '@tencent/hippy-react-qb';

/**
 * 显示hippy的toast
 * @param msg
 * @param timeout
 */
export const showToast = (msg: string, timeout = 3000) => QBToastModule.show(msg, '', timeout);
