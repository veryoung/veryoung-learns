import { useEffect, useState } from 'react';
import { Image } from '@tencent/hippy-react-qb';
import { FormatUtils } from '../feeds-styles/common/utils';
import { logError } from '@/luckdog';

const TAG = 'useImageSize';

export type ImageSize = {
  width: number;
  height: number;
};

/**
 * 预加载图片尺寸，必须是 3 倍图，否则单位转换会出错
 * @param url 图片url
 * @returns 图片尺寸
 */
export const useImageSize = (url: string) => {
  const [size, setSize] = useState<ImageSize>({ width: 0, height: 0 });

  useEffect(() => {
    const fetchImageSize = async () => {
      try {
        const size: ImageSize = await Image.getSize(url);
        const { width, height } = size;

        setSize({
          width: FormatUtils.formatDesignLength(width),
          height: FormatUtils.formatDesignLength(height),
        });
      } catch (err) {
        logError(`imageUrl: ${url}, err: ${err}`, TAG);
      }
    };

    fetchImageSize();
  }, [url]);

  return size;
};
