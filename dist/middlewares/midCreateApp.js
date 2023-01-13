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
exports.middlewares = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
const cases_1 = __importDefault(require("../utils/cases"));
const apps_1 = require("../utils/apps");
const preRun = () => (command, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { local } = command;
    const { params } = local;
    const { cwd, entityName } = params;
    if (!entityName) {
        console.log('missing app name.');
        return;
    }
    let template = 'app', appsDir = `${cwd}/apps`, outputDir = `${appsDir}/${entityName}`;
    if (!fs_extra_1.default.pathExistsSync(appsDir)) {
        console.log(chalk_1.default.red(`apps path "${appsDir}" could not be found`));
        return;
    }
    if (fs_extra_1.default.pathExistsSync(outputDir)) {
        console.log(chalk_1.default.red(`path "${outputDir}" already exists`));
        return;
    }
    command.local.params.template = template;
    command.local.params.outputDir = outputDir;
    command.local.rulesReplaceFileName = {
        componentName: ({ entityName }) => entityName,
    };
    command.local.rulesReplaceContent = {
        '\\$APP_NAME_CAPITAL': ({ entityName }) => cases_1.default.upperFirst(entityName),
        '\\$APP_NAME': ({ entityName }) => cases_1.default.lowerCase(entityName),
    };
    next();
});
const parseInstructions = () => (command, next) => {
    next();
};
const postRun = () => (command, next) => {
    const { local } = command;
    const { params } = local;
    const { cwd, entityName } = params;
    const paths = {
        tsconfig: `${cwd}/clients/web/tsconfig.json`,
        viteConfig: `${cwd}/clients/web/vite.config.ts`,
        platformSaga: `${cwd}/clients/web/src/platform/platform-saga.ts`,
        bootstrap: `${cwd}/clients/web/src/components/Bootstrap/Bootstrap.tsx`,
    };
    (0, apps_1.addAppToTsConfig)(paths.tsconfig, entityName);
    (0, apps_1.addAppToViteConfig)(paths.viteConfig, entityName);
    (0, apps_1.updatePlatformSaga)(paths.platformSaga, entityName);
    (0, apps_1.replaceBootstrapRedirect)(paths.bootstrap, entityName);
    next();
};
exports.middlewares = {
    preRun,
    parseInstructions,
    postRun,
};
