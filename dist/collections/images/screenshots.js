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
// shortcuts: screenshot, screenshots
// desc: takes screenshots for current template
const fs_extra_1 = __importDefault(require("fs-extra"));
const playwright_1 = require("playwright");
const photoBooth = __importStar(require("@gdi/photo-booth"));
const firestore_1 = require("../../utils/firestore");
const OUTPUT_DIR = './screenshots';
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    yield takeScreenShots();
    yield uploadAllScreenshots();
    yield writeDefinitionsFiles();
});
const uploadAllScreenshots = () => __awaiter(void 0, void 0, void 0, function* () {
    const bucket = yield (0, firestore_1.initFirebaseAdmin)();
    const files = fs_extra_1.default
        .readdirSync(OUTPUT_DIR)
        .filter((fileName) => fileName.match(/webp$/));
    console.time('uploading screenshots');
    const uploadResponse = yield photoBooth.uploadAllScreenshots(OUTPUT_DIR, files, bucket);
    fs_extra_1.default.writeJsonSync(`${OUTPUT_DIR}/uploadResponse.json`, uploadResponse, {
        spaces: 4,
    });
    console.timeEnd('uploading screenshots');
});
const writeDefinitionsFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_extra_1.default.existsSync(`${OUTPUT_DIR}/definitions.json`)) {
        console.log(`no definitions found in ${OUTPUT_DIR}/definitions.json`);
        return;
    }
    if (!fs_extra_1.default.existsSync(`${OUTPUT_DIR}/widgets.json`)) {
        console.log(`no widgets found in ${OUTPUT_DIR}/widgets.json`);
        return;
    }
    if (!fs_extra_1.default.existsSync(`${OUTPUT_DIR}/uploadResponse.json`)) {
        console.log(`no uploadResponse found in ${OUTPUT_DIR}/uploadResponse.json`);
        return;
    }
    const definitions = fs_extra_1.default.readJsonSync(`${OUTPUT_DIR}/definitions.json`);
    const widgets = fs_extra_1.default.readJsonSync(`${OUTPUT_DIR}/widgets.json`);
    const uploadResponse = fs_extra_1.default.readJsonSync(`${OUTPUT_DIR}/uploadResponse.json`);
    console.time('updating meta data');
    photoBooth.writeDefinitionsFiles(uploadResponse, definitions, widgets, true);
    console.timeEnd('updating meta data');
    photoBooth.updateNodes(widgets);
});
const takeScreenShots = () => __awaiter(void 0, void 0, void 0, function* () {
    let pageDesktop, pageMobile;
    console.time('opening browser');
    const browser = yield playwright_1.chromium.launch({});
    const contextDesktop = yield browser.newContext({
        viewport: { width: 1920, height: 1280 },
    });
    pageDesktop = yield contextDesktop.newPage();
    yield pageDesktop.goto('http://localhost:3002');
    const contextMobile = yield browser.newContext({
        viewport: { width: 375, height: 812 },
        isMobile: true,
    });
    pageMobile = yield contextMobile.newPage();
    yield pageMobile.goto('http://localhost:3002');
    const dataRaw = yield pageDesktop.inputValue('textarea');
    const dataJson = JSON.parse(dataRaw);
    console.timeEnd('opening browser');
    console.time('taking screenshots');
    const definitions = yield photoBooth.screenshotsForWidgets(dataJson, {
        pageDesktop,
        pageMobile,
    }, OUTPUT_DIR);
    console.timeEnd('taking screenshots');
    fs_extra_1.default.writeJsonSync(`${OUTPUT_DIR}/definitions.json`, definitions, { spaces: 4 }); // prettier-ignore
    fs_extra_1.default.writeJsonSync(`${OUTPUT_DIR}/widgets.json`, dataJson, { spaces: 4 });
    yield pageDesktop.close();
    yield pageMobile.close();
    yield browser.close();
});
run();
