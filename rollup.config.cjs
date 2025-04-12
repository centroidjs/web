const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');
const routerRollupConfig = require('./router/rollup.config.cjs');
const platformServerRollupConfig = require('./platform-server/rollup.config.cjs');
const path = require('path');
module.exports = [{
    input: './src/index.ts',
    output: [
        {
            name: pkg.name,
            file: `dist/index.js`,
            format: 'cjs',
            sourcemap: true
        },
        {
            name: pkg.name,
            file: `dist/index.esm.js`,
            format: 'esm',
            sourcemap: true
        }
    ],
    external: Object.keys(pkg.dependencies),
    plugins: [
        typescript({ tsconfig: './tsconfig.lib.json' })
    ]
}, ...routerRollupConfig, ...platformServerRollupConfig];
