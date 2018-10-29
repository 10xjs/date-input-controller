import babel from 'rollup-plugin-babel';

export default {
  output: {
    format: 'cjs',
    exports: 'named',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
  external: ['react'],
};
