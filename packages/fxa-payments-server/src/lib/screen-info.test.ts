import ScreenInfo from './screen-info';

it('reports screen info as expected', () => {
  const win = {
    devicePixelRatio: 1.5,
    document: {
      documentElement: {
        clientHeight: 678,
        clientWidth: 908,
      },
    },
    screen: {
      height: 123,
      width: 456,
    },
  };

  const si = new ScreenInfo(win);
  expect(si.clientHeight).toEqual(win.document.documentElement.clientHeight);
  expect(si.clientWidth).toEqual(win.document.documentElement.clientWidth);
  expect(si.devicePixelRatio).toEqual(win.devicePixelRatio);
  expect(si.screenHeight).toEqual(win.screen.height);
  expect(si.screenWidth).toEqual(win.screen.width);
});

it('uses undefined as defaults when missing from window object', () => {
  const win = {
    devicePixelRatio: 1.5,
    document: {},
  };

  const si = new ScreenInfo(win);
  expect(si.clientHeight).toBeUndefined();
  expect(si.clientWidth).toBeUndefined();
  expect(si.devicePixelRatio).toEqual(win.devicePixelRatio);
  expect(si.screenHeight).toBeUndefined();
  expect(si.screenWidth).toBeUndefined();
});
