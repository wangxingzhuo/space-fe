import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import * as path from 'path'
import * as fsp from 'fs/promises'

async function getEntry(pkgName) {
  const pkgDir = path.join(import.meta.dirname, 'node_modules', pkgName);
  const pkg = await fsp.readFile(path.join(pkgDir, 'package.json'));
  const entry = JSON.parse(pkg).main;
  return path.join(pkgDir, entry);
}

async function asmResolve({ matcher }) {
  const wasmEntry = await getEntry(matcher);

  return {
    name: 'wasm_resolve',
    async resolveId(id) {
      if (id === matcher) return { id: wasmEntry, external: false };
    },
    async load(id) {
      if (wasmEntry !== id) return;

      const dirPath = path.dirname(id);

      const wasm = await fsp.readFile(path.join(dirPath, 'index.wasm'));
      const dts = await fsp.readFile(path.join(dirPath, 'index.d.ts'));
      this.emitFile({ type: 'asset', fileName: 'index.wasm', source: wasm });
      this.emitFile({ type: 'asset', fileName: 'asm.d.ts', source: dts });
    },
    transform(code, id) {
      if (wasmEntry !== id) return code;

      const { body } = this.parse(code);
      const _exports = body[1].declaration.declarations[0].id.properties.map(item => item.key.name);
      const expression = `export const { ${_exports.join(', ')} } = await (async url => instantiate(await globalThis.WebAssembly.compileStreaming(globalThis.fetch(url)), {}))(new URL("index.wasm", import.meta.url));`
      return code.substring(0, body[1].start) + expression;
    }
  }
}

export default [
   {
      input: 'src/index.ts',
      output: {
         dir: 'dist',
         format: 'es'
      },
      external: ['react'],
      plugins: [
         resolve(),
         commonjs(),
         typescript(),
         asmResolve({ matcher: '@watsonserve/asm' })
      ]
   }
]
