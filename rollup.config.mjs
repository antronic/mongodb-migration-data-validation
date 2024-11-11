import typescript from '@rollup/plugin-typescript'
import treser from '@rollup/plugin-terser'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    exports: 'auto',
  },
  plugins: [
    typescript({
      target: "ES2019", // Ensures compatibility with mongosh and Node environments
      module: "esnext",
    }),
    treser(),
  ],
}