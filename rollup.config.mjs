import typescript from '@rollup/plugin-typescript'
import treser from '@rollup/plugin-terser'

export default [
  // Encryption and decryption tools
  {
    input: 'src/tools/index.ts',
    output: {
      file: 'dist/tools/index.js',
      format: 'cjs',
      exports: 'auto',
    },
    plugins: [
      typescript({
        target: "ES2019", //
        module: "esnext",
      }),
      treser(),
    ],
  },
  // QC tool
  {
    input: 'src/tools/qc.ts',
    output: {
      file: 'dist/tools/qc.js',
      format: 'cjs',
      exports: 'auto',
    },
    plugins: [
      typescript({
        target: "ES2019", //
        module: "esnext",
      }),
      treser(),
    ],
  },
  // Main driver
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'auto',
    },
    external: ['./config.js', 'dotenv'],
    plugins: [
      typescript({
        target: "ES2019", // Ensures compatibility with mongosh and Node environments
        module: "esnext",
      }),
      // treser(),
    ],
  },
]