import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/monitor-sdk.js',
      format: 'umd',
      name: 'Monitor',
      sourcemap: true
    },
    {
      file: 'dist/monitor-sdk.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/monitor-sdk.min.js',
      format: 'umd',
      name: 'Monitor',
      plugins: [terser()],
      sourcemap: true
    }
  ],
  plugins: [
    resolve(),
    commonjs()
  ]
};