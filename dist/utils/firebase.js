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
exports.writeEnvFiles = exports.findOrCreateWebApp = exports.writeOutput = exports.firebaseCliExists = exports.createProject = exports.runCommand$ = exports.runCommand = exports.setCwd = void 0;
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
const runCommand = (command, args = []) => __awaiter(void 0, void 0, void 0, function* () {
    const output = {
        success: false,
    };
    const allArgs = [command, '-j', ...args];
    const responseRaw = yield (0, cli_1.run)('firebase', allArgs, cwd);
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
    }
    return output;
});
exports.runCommand = runCommand;
const runCommand$ = (command, args = [], loadingMessage = '') => __awaiter(void 0, void 0, void 0, function* () {
    (0, spinner_1.showSpinner)(loadingMessage);
    const response = yield (0, exports.runCommand)(command, args);
    (0, spinner_1.stopSpinner)();
    return response;
});
exports.runCommand$ = runCommand$;
const createProject = (projectName) => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = projectName + '-' + (0, shared_base_1.guid4)();
    (0, spinner_1.showSpinner)(`Creating new project: ${chalk_1.default.cyan(projectId)}`);
    const response = yield (0, exports.runCommand)('projects:create', [
        '-n',
        projectName,
        '-i',
        projectId,
    ]);
    (0, spinner_1.stopSpinner)();
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
    response = yield (0, exports.runCommand$)('apps:list', ['WEB'], 'Fetching list of web apps'); // prettier-ignore
    webAppId = (0, lodash_1.get)(response, 'data[0].appId', '');
    if (!webAppId) {
        response = yield (0, exports.runCommand$)('apps:create', ['WEB', 'webApp'], 'Creating a web app'); // prettier-ignore
        webAppId = (0, lodash_1.get)(response, 'data.appId', '');
    }
    response = yield (0, exports.runCommand$)('apps:sdkconfig', ['WEB', webAppId], 'Fetching web app config'); // prettier-ignore
    return response;
});
exports.findOrCreateWebApp = findOrCreateWebApp;
const writeEnvFiles = (firebaseConfig) => {
    (0, spinner_1.showSpinner)('Writing .env files');
    (0, env_1.writeEnvVite)(`${cwd}/gdi-admin`, firebaseConfig, {
        menu: ['doing', 'site', 'marketing', 'factory', 'shop', 'extra'].join(','),
    });
    (0, env_1.writeEnvVite)(`${cwd}/gdi-site`, firebaseConfig);
    (0, env_1.writeEnvVite)(cwd, firebaseConfig);
    (0, spinner_1.stopSpinner)();
};
exports.writeEnvFiles = writeEnvFiles;
