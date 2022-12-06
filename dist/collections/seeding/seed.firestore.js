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
// shortcuts: seed
// desc: generate firestore data
const chalk_1 = __importDefault(require("chalk"));
const env_1 = require("../../utils/env");
const argv_1 = require("../../utils/argv");
const json_1 = require("../../utils/json");
const firestore_1 = require("../../utils/firestore");
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
let initialData = {};
// ================================================
const nodeTypes = {
    appState: 'single',
    appStateMixer: 'single',
    galleryState: 'single',
    widgetGalleryState: 'single',
    currentIds: 'single',
    me: 'single',
    meta: 'single',
    packages: 'single',
    palette: 'single',
    users: 'collection',
    roles: 'collection',
    libraryWidgets: 'collection',
    libraryImages: 'collection',
    libraryTypography: 'collection',
    libraryPalettes: 'collection',
    instances: 'collection',
    pages: 'collection',
    images: 'collection',
    widgets: 'collection',
    locales: 'collection',
    instancesProps: 'collection',
};
const getByType = (nodeType) => {
    return Object.keys(nodeTypes)
        .filter((key) => nodeTypes[key] === nodeType)
        .map((key) => {
        const nodeData = initialData[key];
        return [key, nodeData];
    });
};
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    let promises;
    const envResult = (0, env_1.readEnvVite)(cwd);
    if (!envResult.success) {
        (0, env_1.envError)(envResult.error);
        return;
    }
    const initialDataResult = (0, json_1.readJson)('../templates/data/firebase.initialData.json');
    if (!initialDataResult.success) {
        generalError(initialDataResult.error);
        return;
    }
    initialData = initialDataResult.content;
    (0, firestore_1.initFirebaseVite)(envResult.content);
    promises = getByType('single').map(([key, data]) => {
        console.log(key + '... ', chalk_1.default.cyan('single'));
        return (0, firestore_1.singlePatch)(key, Object.assign({ id: key }, data));
    });
    yield Promise.all(promises);
    promises = getByType('collection').map(([key, data]) => {
        console.log(key + '... ', chalk_1.default.magenta('collection'));
        return (0, firestore_1.collectionAddMany)(key, data);
    });
    yield Promise.all(promises);
    console.log(chalk_1.default.green('done'));
});
const generalError = (message) => {
    console.log(chalk_1.default.red(message));
};
run();
