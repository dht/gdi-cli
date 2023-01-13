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
// shortcuts: img, raw, png
// desc: watches and compress images
const argv_1 = require("../../utils/argv");
const chokidar_1 = require("chokidar");
const chalk_1 = __importDefault(require("chalk"));
const os_1 = require("os");
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const bytes_1 = __importDefault(require("bytes"));
const console_1 = require("../../utils/console");
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
const listen = () => __awaiter(void 0, void 0, void 0, function* () {
    const watcher = (0, chokidar_1.watch)(cwd, {
        ignoreInitial: true,
    });
    watcher.addListener('add', (path) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`File ${prettyPath(path)} has been added`);
        const info = yield compressImage(path);
        printSummary(info);
    }));
    watcher.addListener('change', (path) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`File ${prettyPath(path)} has been changed`);
        const info = yield compressImage(path);
        printSummary(info);
    }));
    console.log(`Watching ${chalk_1.default.cyan(prettyPath(cwd))} for changes...`);
});
const printSummary = (info) => {
    (0, console_1.printTable)([
        [chalk_1.default.yellow('filename'), info.fileName],
        [chalk_1.default.yellow('outSize'), chalk_1.default.magenta(info.sizeText)],
        [chalk_1.default.yellow('percent'), chalk_1.default.cyan(info.percent + '%')],
        [chalk_1.default.yellow('inSize'), info.sizeBeforeText],
    ], [15, 40]);
};
const compressImage = (inputPath) => {
    return new Promise((resolve, reject) => {
        const stats = fs_1.default.statSync(inputPath);
        const fileInfo = path_1.default.parse(inputPath);
        const outputPath = path_1.default.resolve(fileInfo.dir + '/../' + fileInfo.base);
        (0, sharp_1.default)(inputPath)
            .png({
            compressionLevel: 8,
            palette: true,
            colors: 256,
            force: true,
        })
            .toFile(outputPath, (err, info) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(Object.assign(Object.assign({ fileName: fileInfo.base, sizeBeforeText: (0, bytes_1.default)(stats.size), sizeBefore: stats.size }, info), { sizeText: (0, bytes_1.default)(info.size), percent: Math.round((info.size / stats.size) * 100) }));
        });
    });
};
const prettyPath = (path) => {
    return path.replace((0, os_1.homedir)(), '~');
};
listen();
