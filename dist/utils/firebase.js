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
exports.writeEnvFiles = exports.findOrCreateWebApp = exports.writeOutput = exports.firebaseCliExists = exports.createProject = exports.runCommand = exports.setCwd = void 0;
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const shared_base_1 = require("shared-base");
const cli_1 = require("../cli/cli");
const spinner_1 = require("./spinner");
const path_1 = __importDefault(require("path"));
const lodash_1 = require("lodash");
const env_1 = require("./env");
let cwd = '';
const setCwd = (value) => {
    cwd = value;
};
exports.setCwd = setCwd;
const runCommand = (cmd) => __awaiter(void 0, void 0, void 0, function* () {
    const { command, args = [], loadingMessage, shouldExitOnError = true, } = cmd;
    if (loadingMessage) {
        (0, spinner_1.showSpinner)(loadingMessage);
    }
    const output = {
        success: false,
    };
    const allArgs = [command, '-j', ...args];
    const responseRaw = yield (0, cli_1.run)('firebase', allArgs, cwd);
    if (loadingMessage) {
        (0, spinner_1.stopSpinner)();
    }
    let response = {};
    try {
        response = JSON.parse(responseRaw);
    }
    catch (_err) { }
    if (response.status === 'success') {
        output.success = true;
        output.data = response.result;
    }
    else {
        output.error = response.error;
        if (shouldExitOnError) {
            console.log(`error while running: firebase ${allArgs.join(' ')}`);
            console.log(chalk_1.default.red(response.error));
            process.exit(1);
        }
    }
    return output;
});
exports.runCommand = runCommand;
const createProject = (projectName) => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = projectName + '-' + (0, shared_base_1.guid4)();
    const response = yield (0, exports.runCommand)({
        command: 'projects:create',
        args: ['-n', projectName, '-i', projectId],
        loadingMessage: `Creating new project: ${chalk_1.default.cyan(projectId)}`,
    });
    return (0, lodash_1.get)(response, 'data.projectId', '');
});
exports.createProject = createProject;
const firebaseCliExists = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, cli_1.run)('which', ['firebase'], cwd);
    return typeof response === 'string' && response.length > 0;
});
exports.firebaseCliExists = firebaseCliExists;
const writeOutput = (name, output = {}) => {
    const cwd = path_1.default.resolve(__dirname, '../../docs/output');
    fs_1.default.writeFileSync(`${cwd}/firebase.${name}.txt`, JSON.stringify(output, null, 4));
};
exports.writeOutput = writeOutput;
const findOrCreateWebApp = () => __awaiter(void 0, void 0, void 0, function* () {
    let response, webAppId = '';
    response = yield (0, exports.runCommand)({
        command: 'apps:list',
        args: ['WEB'],
        loadingMessage: 'Fetching list of web apps',
    });
    webAppId = (0, lodash_1.get)(response, 'data[0].appId', '');
    if (!webAppId) {
        response = yield (0, exports.runCommand)({
            command: 'apps:create',
            args: ['WEB', 'webApp'],
            loadingMessage: 'Creating a web app',
        });
        webAppId = (0, lodash_1.get)(response, 'data.appId', '');
    }
    response = yield (0, exports.runCommand)({
        command: 'apps:sdkconfig',
        args: ['WEB', webAppId],
        loadingMessage: 'Fetching web app config',
    });
    if (!response.success) {
        console.log(chalk_1.default.red(response.error));
        process.exit(1);
    }
    return response;
});
exports.findOrCreateWebApp = findOrCreateWebApp;
const writeEnvFiles = (firebaseConfig) => {
    (0, spinner_1.showSpinner)('Writing .env files');
    (0, env_1.writeEnvVite)(cwd, firebaseConfig, {
        menu: ['doing', 'site', 'marketing', 'factory', 'shop', 'extra'].join(','),
    });
    (0, env_1.writeEnvVite)(`${cwd}/../gdi-site`, firebaseConfig);
    (0, spinner_1.stopSpinner)();
};
exports.writeEnvFiles = writeEnvFiles;
