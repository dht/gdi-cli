"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
// shortcuts: counter, cloc
// desc: counts files
const globby_1 = __importDefault(require("globby"));
const argv_1 = require("../../utils/argv");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs-extra"));
const lodash_1 = require("lodash");
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
const mapExt = {
    '.ts': 'ts',
    '.tsx': 'jsx',
    '.js': 'js',
    '.scss': 'scss',
};
const mapSemantic = {
    selector: (filepath) => filepath.includes('selectors'),
    style: (filepath) => filepath.includes('.style.'),
    component: (filepath) => filepath.includes('/components/'),
    container: (filepath) => filepath.includes('/container/'),
    saga: (filepath) => filepath.includes('saga.') || filepath.includes('/sagas/'),
    utils: (filepath) => filepath.includes('/utils/'),
    hook: (filepath) => filepath.includes('use'),
};
let totalGlobal = {
    byType: {},
    bySemantic: {},
};
const ignorePackages = ['submodules/gdi-datasets'];
const analyzePackage = (pkg) => {
    if (ignorePackages.includes(pkg)) {
        return;
    }
    const root = `${cwd}/${pkg}`;
    const src = `${root}/src`;
    const name = pkg.split('/').pop();
    let gitIgnore = [];
    const gitIgnorePath = `${root}/.gitignore`;
    if (fs.existsSync(gitIgnorePath)) {
        gitIgnore = fs
            .readFileSync(gitIgnorePath, 'utf8')
            .split('\n')
            .filter((i) => i)
            .map((i) => i.replace(/^src\//, ''))
            .map((i) => `**/${i}`);
    }
    const files = globby_1.default
        .sync('**/*', {
        cwd: src,
        onlyFiles: true,
        ignore: [
            '**/node_modules/**',
            '**/dist/**',
            '**/*.driver.tsx',
            '**/*.driver.ts',
            '**/*.spec.tsx',
            '**/*.spec.ts',
            '**/*.snap',
            '**/*.md',
            '**/*.json',
            '**/*.yml',
            '**/*.css',
            '**/gdi-datasets/**/*',
            ...gitIgnore,
        ],
    })
        .map((file) => {
        var _a, _b;
        const filepath = `${src}/${file}`;
        const fileInfo = fs.statSync(filepath);
        const pathInfo = path_1.default.parse(file);
        const content = fs.readFileSync(filepath, 'utf8');
        const lines = content.split('\n').length;
        const semantic = (_a = Object.keys(mapSemantic).find((key) => {
            return mapSemantic[key](filepath);
        })) !== null && _a !== void 0 ? _a : 'unknown';
        return {
            filepath,
            size: fileInfo.size,
            semantic,
            lines,
            ext: (_b = mapExt[pathInfo.ext]) !== null && _b !== void 0 ? _b : 'unknown',
        };
    });
    const byType = {};
    const bySemantic = {};
    const totalLines = files.reduce((acc, file) => acc + file.lines, 0);
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    files.forEach((file) => {
        sum(byType, file, file.ext);
        sum(totalGlobal.byType, file, file.ext);
    });
    files.forEach((file) => {
        sum(bySemantic, file, file.semantic);
        sum(totalGlobal.bySemantic, file, file.semantic);
    });
    return {
        name,
        packagePath: pkg,
        count: files.length,
        byType,
        bySemantic,
        totalLines,
        totalSize,
    };
};
const sum = (obj, file, key) => {
    obj[key] = obj[key] || {
        count: 0,
        lines: 0,
        size: 0,
    };
    obj[key].count += 1;
    obj[key].lines += file.lines;
    obj[key].size += file.size;
    obj['all'] = obj['all'] || {
        count: 0,
        lines: 0,
        size: 0,
    };
    obj['all'].count += 1;
    obj['all'].lines += file.lines;
    obj['all'].size += file.size;
};
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const packageJson = fs.readJsonSync(`${cwd}/package.json`);
    const packages = globby_1.default.sync(packageJson.workspaces, {
        cwd,
        onlyDirectories: true,
    });
    const output = {};
    console.time('start');
    packages.forEach((pkg) => {
        const result = analyzePackage(pkg);
        if (result) {
            output[pkg] = result;
        }
    });
    const summary = {
        byType: {},
        bySemantic: {},
        byPackage: {
            total: 0,
        },
    };
    Object.keys(output)
        .map((pkg) => {
        const json = output[pkg];
        const value = (0, lodash_1.get)(json, 'byType.all.lines');
        return {
            pkg,
            value,
        };
    })
        .sort(sortBy('value'))
        .forEach((pair) => {
        summary.byPackage.total += pair.value;
        summary.byPackage[pair.pkg] = pair.value;
    });
    Object.keys(totalGlobal.byType)
        .map((ext) => {
        const json = totalGlobal.byType[ext];
        const value = (0, lodash_1.get)(json, 'lines');
        return {
            ext,
            value,
        };
    })
        .sort(sortBy('value'))
        .forEach((pair) => {
        summary.byType[pair.ext] = pair.value;
    });
    Object.keys(totalGlobal.bySemantic)
        .map((semantic) => {
        const json = totalGlobal.bySemantic[semantic];
        const value = (0, lodash_1.get)(json, 'lines');
        return {
            ext: semantic,
            value,
        };
    })
        .sort(sortBy('value'))
        .forEach((pair) => {
        summary.bySemantic[pair.ext] = pair.value;
    });
    fs.writeJsonSync(`${cwd}/.cloc/summary.json`, summary, { spaces: 4 });
    fs.writeJsonSync(`${cwd}/.cloc/total.json`, totalGlobal, { spaces: 4 });
    fs.writeJsonSync(`${cwd}/.cloc/all.json`, output, { spaces: 4 });
    console.timeEnd('start');
});
const sortBy = (fieldName) => (a, b) => {
    if (a[fieldName] === b[fieldName]) {
        return 0;
    }
    return a[fieldName] > b[fieldName] ? -1 : 1;
};
run();
