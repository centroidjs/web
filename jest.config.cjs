const { pathsToModuleNameMapper } = require('ts-jest');
const typescriptConfig = require('./tsconfig.json');
const { compilerOptions } = typescriptConfig;
const { defaults: tsjPreset } = require('ts-jest/presets');

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
  transform: {
    ...tsjPreset.transform,
    // "^.+.tsx?$": ["ts-jest",{
    //     tsconfig: "tsconfig.json"
    // }]
  }
}