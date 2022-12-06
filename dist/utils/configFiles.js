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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addViteAlias = exports.addCompilerOptionsPaths = exports.readTsConfig = void 0;
const fs = __importStar(require("fs-extra"));
function stripJsonTrailingCommas(content) {
    return content.replace(/(?<=(true|false|null|["\d}\]])\s*),(?=\s*[}\]])/g, '');
}
const readTsConfig = (tsconfigPath) => {
    const text = fs.readFileSync(tsconfigPath).toString();
    // remove trailing commas
    const output = stripJsonTrailingCommas(text);
    return JSON.parse(output);
};
exports.readTsConfig = readTsConfig;
const addCompilerOptionsPaths = (tsconfigPath, change) => {
    var _a, _b;
    if (!fs.existsSync(tsconfigPath)) {
        console.log(`could not find tsconfig in ${tsconfigPath}`);
        return;
    }
    const json = (0, exports.readTsConfig)(tsconfigPath);
    json.compilerOptions = (_a = json.compilerOptions) !== null && _a !== void 0 ? _a : {};
    json.compilerOptions.paths = (_b = json.compilerOptions.paths) !== null && _b !== void 0 ? _b : {};
    json.compilerOptions.paths = Object.assign(Object.assign({}, json.compilerOptions.paths), change);
    fs.writeJsonSync(tsconfigPath, json, { spaces: 4 });
};
exports.addCompilerOptionsPaths = addCompilerOptionsPaths;
const addViteAlias = (vitePath, key, value) => {
    if (!fs.existsSync(vitePath)) {
        console.log(`could not find vite config in ${vitePath}`);
        return;
    }
    let data = fs.readFileSync(vitePath).toString();
    if (data.includes(key)) {
        console.log(`key ${key} already exists on vite config`);
        return;
    }
    data = data.replace('alias: {', `alias: {
            ${key}: ${value},`);
    fs.writeFileSync(vitePath, data);
};
exports.addViteAlias = addViteAlias;
