const typescript = require('@rollup/plugin-typescript');
const pkg = require('../package.json');
const path = require('path');
const name = pkg.name.concat('/', path.basename(__dirname));

module.exports = [{
    input: path.resolve(__dirname, './src/index.ts'),
    output: [
        {
            name,
            file: path.resolve(__dirname, './dist/index.js'),
            format: 'cjs',
            sourcemap: true
        },
        {
            name,
            file: path.resolve(__dirname, './dist/index.esm.js'),
            format: 'esm',
            sourcemap: true
        },
        {
            name,
            file: path.resolve(__dirname, './dist/index.umd.js'),
            format: 'umd',
            sourcemap: true
        },
    ],
    external: Object.keys(pkg.dependencies).concat(
            '@centroidjs/web/router',
            '@centroidjs/web'
        ),
    plugins: [
        typescript({ tsconfig: path.resolve(__dirname, './tsconfig.lib.json') })
    ]
}];
