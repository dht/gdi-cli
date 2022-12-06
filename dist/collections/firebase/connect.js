"use strict";
// shortcuts: connect
// desc: connect project to Firebase
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
const chalk_1 = __importDefault(require("chalk"));
const env_1 = require("../../utils/env");
const argv_1 = require("../../utils/argv");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const cli = require('../../cli/cli');
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
// ================================================
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const firebaseJsonPath = path.resolve(cwd, 'firebase.json');
    if (!fs.existsSync(firebaseJsonPath)) {
        console.log(chalk_1.default.red(`could not find "firebase.json" in ${firebaseJsonPath}`));
        return;
    }
    const firebaseConfig = fs.readJsonSync(firebaseJsonPath);
    const { projectId } = firebaseConfig;
    (0, env_1.writeEnvVite)(`${cwd}/gdi-admin`, firebaseConfig, {
        menu: ['doing', 'site', 'marketing', 'factory', 'shop', 'extra'].join(','),
    });
    (0, env_1.writeEnvVite)(`${cwd}/gdi-site`, firebaseConfig);
    (0, env_1.writeEnvVite)(cwd, firebaseConfig);
    const result = yield cli.run('firebase', ['use', projectId], `${cwd}/gdi-admin`);
    console.log(result);
});
run();
