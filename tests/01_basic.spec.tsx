import { expect, test } from 'vitest';
import { $, getValueProp, createElement } from 'zustand-signal';

test('should export functions', () => {
  expect($).toBeDefined();
  expect(getValueProp).toBeDefined();
  expect(createElement).toBeDefined();
});
