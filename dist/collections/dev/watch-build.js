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
// shortcuts: wb
// desc: watches src => builds
const fs_extra_1 = __importDefault(require("fs-extra"));
const path = __importStar(require("path"));
const argv_1 = require("../../utils/argv");
const chalk_1 = __importDefault(require("chalk"));
const lodash_1 = require("lodash");
const chokidar = __importStar(require("chokidar"));
const cli = require('super0/lib/cli');
const DEBOUNCE = 2500;
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd, _ } = argv;
let source = cwd + '/src';
let mode = 'single';
if (_) {
    source = _.map((i) => cwd + '/' + i);
    mode = 'multiple';
}
let ignoreDirectories = [];
const ignoreFilePath = `${cwd}/.ignoreWatch`;
if (fs_extra_1.default.existsSync(ignoreFilePath)) {
    ignoreDirectories = fs_extra_1.default.readFileSync(ignoreFilePath).toString().split('\n');
}
let isBuilding = {}, shouldBuildAfterBuild = false;
const buildProject = (rootDir) => __awaiter(void 0, void 0, void 0, function* () {
    if (isBuilding[rootDir]) {
        shouldBuildAfterBuild = true;
        return;
    }
    isBuilding[rootDir] = true;
    log(chalk_1.default.cyan('starting build'));
    yield cli.run('yarn', ['build'], rootDir, {
        stdOutMode: true,
    });
    isBuilding[rootDir] = false;
    log('finished building', chalk_1.default.cyan(rootDir));
});
const findProjectRoot = (filepath) => {
    let output = '';
    let { dir } = path.parse(filepath);
    do {
        dir = path.resolve(dir, '..');
        if (fs_extra_1.default.existsSync(`${dir}/package.json`)) {
            output = dir;
        }
    } while (!output && dir !== '/');
    return output;
};
const buildDebounced = (0, lodash_1.debounce)(buildProject, DEBOUNCE);
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    if (mode === 'multiple') {
        log('watching', chalk_1.default.yellow(source.length), 'directories');
    }
    else {
        log('watching', chalk_1.default.yellow(source));
    }
    if (ignoreDirectories.length > 0) {
        log('ignoring', chalk_1.default.cyan(ignoreDirectories.length), 'directories');
    }
    chokidar
        .watch(source, {
        ignoreInitial: true,
    })
        .on('all', (event, path) => {
        const shouldIgnore = ignoreDirectories.some((dir) => {
            return path.includes(`/${dir}/`);
        });
        if (shouldIgnore) {
            log('ignoring', chalk_1.default.cyan(path));
            return;
        }
        log(event, chalk_1.default.magenta(path));
        if (mode === 'multiple') {
            const projectRoot = findProjectRoot(path);
            buildDebounced(projectRoot);
        }
        else {
            buildDebounced(cwd);
        }
    });
});
const log = (...params) => {
    const message = params.join(' ');
    console.log(message);
};
run();
