import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@tencent/hippy-mock';
import './init/initConsole';
import './init/initMock';

Enzyme.configure({
  adapter: new Adapter(),
});
