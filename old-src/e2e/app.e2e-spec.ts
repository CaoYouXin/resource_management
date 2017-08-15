import { ResourceManagementPage } from './app.po';

describe('resource-management App', function() {
  let page: ResourceManagementPage;

  beforeEach(() => {
    page = new ResourceManagementPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
