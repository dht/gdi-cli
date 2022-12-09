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
// shortcuts: setAdmin
// desc: make an existing user an admin
const chalk_1 = __importDefault(require("chalk"));
const input_1 = require("../../utils/input");
const env_1 = require("../../utils/env");
const argv_1 = require("../../utils/argv");
const firestore_1 = require("../../utils/firestore");
const fs = __importStar(require("fs"));
const argv = (0, argv_1.parseArgv)(process.argv);
const cwd = argv.cwd;
const cwdAdmin = `${cwd}/gdi-admin`;
// ================================================
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const envResult = (0, env_1.readEnvVite)(cwdAdmin);
    if (!envResult.success) {
        (0, env_1.envError)(envResult.error);
        return;
    }
    (0, firestore_1.initFirebaseVite)(envResult.content);
    const users = yield (0, firestore_1.collectionGet)('users');
    const choices = users
        .map((user) => user.email)
        .filter((email) => !email.match(/example\.com$/));
    const answer = yield (0, input_1.autoComplete)('Choose the user to make an admin:', choices);
    const user = users.find((i) => i.email === answer);
    if (!user) {
        generalError(`could not find user ${answer}`);
        return;
    }
    const { id } = user;
    yield (0, firestore_1.collectionPatchItem)('roles', id, {
        id,
        role: 'admin',
    });
    updateStorageRules(id);
    console.log(chalk_1.default.green('done'));
});
const updateStorageRules = (userId) => {
    let pathStorageRules = `${cwdAdmin}/storage.rules`;
    if (!fs.existsSync(pathStorageRules)) {
        pathStorageRules = `${cwdAdmin}/gdi-admin/storage.rules`;
        if (!fs.existsSync(pathStorageRules)) {
            generalError('ERROR: could not find "storage.rules" in this path');
            return;
        }
    }
    const content = fs.readFileSync(pathStorageRules).toString();
    const newContent = content.replace(/request\.auth\.uid == '([a-zA-Z0-9_]+)'/, (all, match) => {
        return all.replace(match, userId);
    });
    fs.writeFileSync(pathStorageRules, newContent);
};
const generalError = (message) => {
    console.log(chalk_1.default.red(message));
};
run();
