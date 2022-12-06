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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceBootstrapRedirect = exports.updatePlatformSaga = exports.addAppToViteConfig = exports.addAppToTsConfig = void 0;
const fs = __importStar(require("fs-extra"));
const lodash_1 = __importDefault(require("lodash"));
const configFiles_1 = require("./configFiles");
const addAppToTsConfig = (tsconfigPath, appId) => {
    const change = {
        [`@gdi/app-${appId}`]: [`apps/${appId}`],
    };
    (0, configFiles_1.addCompilerOptionsPaths)(tsconfigPath, change);
};
exports.addAppToTsConfig = addAppToTsConfig;
const addAppToViteConfig = (vitePath, appId) => {
    const key = `'@gdi/app-${appId}'`;
    const value = `\`\${cwd}/apps/${appId}\``;
    (0, configFiles_1.addViteAlias)(vitePath, key, value);
};
exports.addAppToViteConfig = addAppToViteConfig;
const updatePlatformSaga = (sagaPath, newAppId) => {
    if (!fs.existsSync(sagaPath)) {
        console.log(`could not find platform saga in ${sagaPath}`);
        return;
    }
    let data = fs.readFileSync(sagaPath).toString();
    const withPrefix = `app-${newAppId}`;
    const packageName = `@gdi/${withPrefix}`;
    const upperFirst = lodash_1.default.upperFirst(newAppId);
    // 1. add import
    const importLine = `import { initApp as init${upperFirst} } from '${packageName}';`;
    if (data.includes(withPrefix)) {
        console.log(`app ${newAppId} already exists on platform saga`);
        return;
    }
    data = data.replace('import', `${importLine}\nimport`);
    // 2. add to AllApps type
    const typeLine = `  ${newAppId}: InitAppMethod,`;
    data = data.replace('type AllApps = {', `type AllApps = {\n  ${typeLine}`);
    // 3. add to activeApps
    const activeAppsLine = `    '${newAppId}',`;
    data = data.replace('const activeApps: AppId[] = [', `const activeApps: AppId[] = [\n${activeAppsLine}`);
    // 4. add to allApps
    const allAppsLine = `  ${newAppId}: init${upperFirst},`;
    data = data.replace('const allApps: AllApps = {', `const allApps: AllApps = {\n${allAppsLine}`);
    fs.writeFileSync(sagaPath, data);
};
exports.updatePlatformSaga = updatePlatformSaga;
const replaceBootstrapRedirect = (bootstrapPath, appId) => {
    if (!fs.existsSync(bootstrapPath)) {
        console.log(`could not find Bootstrap.tsx in ${bootstrapPath}`);
        return;
    }
    let data = fs.readFileSync(bootstrapPath).toString();
    const redirectLine = `<Redirect to='/${appId}' />`;
    data = data.replace(/<Redirect to='[/a-z]+' \/>/i, redirectLine);
    fs.writeFileSync(bootstrapPath, data);
};
exports.replaceBootstrapRedirect = replaceBootstrapRedirect;
