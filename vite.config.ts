import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Specify the environment as 'node' since this is a Docker client
    environment: 'node',
    
    // Glob patterns to find test files
    include: ['**/*.test.ts'],
    
    // Automatically clear mocks between tests
    clearMocks: true,

    // Necessary to ensure Vitest works well with TypeScript/Node ESM
    globals: true,
    
    // You may need to add this if your package.json has "type": "module"
    setupFiles: [], 
  },
});
