import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['verbose'],       // shows test names
    sequence: {
      concurrent: false,          // run files serially
      shuffle: false,             // keep collected order
    },
  },
});
