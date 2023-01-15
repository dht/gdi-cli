"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// shortcuts: blocks
// desc: rebuild node_modules @gdi/block-init
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const argv_1 = require("../../utils/argv");
const argv = (0, argv_1.parseArgv)(process.argv);
const cwd = argv.cwd;
const packageSite = `${cwd}/clients/gdi-site/package.json`;
const packageAdmin = `${cwd}/clients/gdi-admin/package.json`;
const blocksFile = `${cwd}/.blocks`;
// ================================================
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_extra_1.default.existsSync(blocksFile)) {
        console.log(chalk_1.default.red(`no .blocks file found found ${cwd}`));
        process.exit();
    }
    if (!fs_extra_1.default.existsSync(packageSite)) {
        console.log(chalk_1.default.red(`no package.json found in ${packageSite}`));
        process.exit();
    }
    if (!fs_extra_1.default.existsSync(packageAdmin)) {
        console.log(chalk_1.default.red(`no package.json found in ${packageSite}`));
        process.exit();
    }
    const blocks = fs_extra_1.default
        .readFileSync(blocksFile, 'utf8')
        .split('\n')
        .filter((i) => i !== '');
    const regex = /block-[a-z]+-[a-z0-9]+/g;
    const count = {
        removed: 0,
        added: 0,
    };
    count.removed = removeDependencies(packageSite, regex);
    count.added = addDependencies(packageSite, blocks);
    logCount('site', count);
    count.removed = removeDependencies(packageAdmin, regex);
    count.added = addDependencies(packageAdmin, blocks);
    logCount('admin', count);
});
const logCount = (packageName, count) => {
    console.log([
        chalk_1.default.yellow(`${packageName}:`),
        `${chalk_1.default.green(count.added)} added,`,
        `${chalk_1.default.red(count.removed)} removed`,
    ].join(' '));
};
const addDependencies = (packageJsonPath, blocks) => {
    let count = 0;
    const packageContent = fs_extra_1.default.readJsonSync(packageJsonPath);
    blocks.forEach((block) => {
        packageContent.dependencies[block] = 'latest';
        count++;
    });
    fs_extra_1.default.writeJsonSync(packageJsonPath, packageContent, { spaces: 4 });
    return count;
};
const removeDependencies = (packageJsonPath, regex) => {
    let count = 0;
    const packageContent = fs_extra_1.default.readJsonSync(packageJsonPath);
    Object.keys(packageContent.dependencies).forEach((dep) => {
        if (dep.match(regex)) {
            delete packageContent.dependencies[dep];
            count++;
        }
    });
    fs_extra_1.default.writeJsonSync(packageJsonPath, packageContent, { spaces: 4 });
    return count;
};
run();
