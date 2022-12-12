import { canMediaPlayInWebview } from '../WebView';

describe('WebView', () => {
  it('case: canMediaPlayInWebview => true', () => {
    const url = 'https://example.com/path?can_media_play=1';
    expect(canMediaPlayInWebview(url)).toBeTruthy();
  });
  it('case: canMediaPlayInWebview => true', () => {
    const url = 'https://example.com/path?can_media_play=';
    expect(canMediaPlayInWebview(url)).toBeFalsy();
  });
});
