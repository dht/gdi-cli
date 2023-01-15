"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// shortcuts: monojest
// desc: adds jest to all packages in monorepo
const globby_1 = __importDefault(require("globby"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const argv_1 = require("../../utils/argv");
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
const rootPackage = fs_extra_1.default.readJsonSync(`${cwd}/package.json`);
const { workspaces = {} } = rootPackage;
const { packages = [] } = workspaces;
const allFiles = [];
packages.forEach((p) => {
    const files = globby_1.default.sync(`${cwd}/${p}/package.json`);
    allFiles.push(...files);
});
allFiles.forEach((file) => {
    const content = fs_extra_1.default.readJsonSync(file);
    content.devDependencies = Object.assign(Object.assign({}, content.devDependencies), { '@types/jest': '^27.5.1', jest: '^28.1.0', 'ts-jest': '^28.0.2', typescript: '^4.6.4' });
    fs_extra_1.default.writeJsonSync(file, content, { spaces: 4 });
    const { dir } = path_1.default.parse(file);
    const jestConfigPath = `${dir}/jest.config.js`;
    if (!fs_extra_1.default.existsSync(jestConfigPath)) {
        fs_extra_1.default.writeFileSync(jestConfigPath, `module.exports = {
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.spec.json',
        },
    },
    testMatch: ['<rootDir>/**/*.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js'],
};
`);
    }
});
