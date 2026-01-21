import {describe, expect, it} from 'vitest';

import {App} from './app';

describe('App', () => {
  it('creates instance', () => {
    const app = new App();
    expect(app).toBeTruthy();
  });
});
