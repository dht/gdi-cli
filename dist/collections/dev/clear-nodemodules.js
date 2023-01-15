"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// shortcuts: clearnm
// desc: clears node_modules recursively
const globby_1 = __importDefault(require("globby"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const argv_1 = require("../../utils/argv");
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
const rootPackage = fs_extra_1.default.readJsonSync('./package.json');
const { workspaces = {} } = rootPackage;
const { packages: monorepoPackages = [] } = workspaces;
const packagesPaths = monorepoPackages
    .filter((p) => p.match(/[a-zA-Z0-9]+\/\*/))
    .map((p) => p.replace(/\/\*$/, ''));
const packagesNodeModulesPaths = packagesPaths.map((p) => `${p}/*/node_modules`);
const packagesLockFilesPaths = packagesPaths.reduce((output, p) => {
    output.push(`${p}/*/yarn.lock`);
    output.push(`${p}/*/yalc.lock`);
    output.push(`${p}/*/yarn-error.log`);
    return output;
}, ['yarn.lock', 'yalc.lock', 'yarn-error.log']);
const dirs = globby_1.default.sync(packagesNodeModulesPaths, {
    cwd,
    onlyDirectories: true,
});
if (fs_extra_1.default.existsSync('node_modules')) {
    dirs.push('node_modules');
}
dirs.forEach((dir) => fs_extra_1.default.rmSync(dir, {
    recursive: true,
    force: true,
}));
const files = globby_1.default.sync(packagesLockFilesPaths, {
    cwd,
});
files.forEach((file) => fs_extra_1.default.rmSync(file, {
    force: true,
}));
console.log('files ->', files);
console.log('dirs ->', dirs);
