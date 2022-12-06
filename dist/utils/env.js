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
exports.envError = exports.writeEnvVite = exports.readEnvVite = exports.readEnv = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const shared_base_1 = require("shared-base");
const cobolCase = (str) => (0, shared_base_1.snakeCase)(str).replace(/-/g, '_').toUpperCase();
const readEnv = (cwd, requiredKeys = []) => {
    const output = {
        success: true,
        content: {},
        error: '',
    };
    const envPath = path.resolve(cwd, '.env');
    const envExists = fs.existsSync(envPath);
    if (!envExists) {
        output.success = false;
        output.error = `could not find '.env' file in ${chalk_1.default.yellow(cwd)}`;
        return output;
    }
    const contentRaw = fs.readFileSync(envPath).toString();
    const contentLines = contentRaw.split('\n');
    const content = contentLines.reduce((output, line) => {
        const parts = line.split('=');
        output[parts[0]] = parts[1];
        return output;
    }, {});
    const missingKeys = checkMissingKeys(content, requiredKeys);
    output.content = content;
    if (missingKeys.length > 0) {
        output.success = false;
        output.error = `missing in .env file:\n  - ${missingKeys.join('\n  - ')}`;
        return output;
    }
    return output;
};
exports.readEnv = readEnv;
const readEnvVite = (cwd) => {
    return (0, exports.readEnv)(cwd, [
        'VITE_FIREBASE_API_KEY_1',
        'VITE_FIREBASE_AUTH_DOMAIN_1',
        'VITE_FIREBASE_DATABASE_URL_1',
        'VITE_FIREBASE_PROJECT_ID_1',
        'VITE_FIREBASE_STORAGE_BUCKET_1',
        'VITE_FIREBASE_MESSAGING_SENDER_ID_1',
        'VITE_FIREBASE_APP_ID_1',
    ]);
};
exports.readEnvVite = readEnvVite;
const writeEnvVite = (cwd, config, extra = {}) => {
    const envContent = configToViteEnv(config);
    const extraString = Object.keys(extra)
        .reduce((output, key) => {
        const keyVite = cobolCase(`vite-${key}`);
        output.push(`${keyVite}=${extra[key]}`);
        return output;
    }, [])
        .join('\n');
    fs.writeFileSync(cwd + '/.env', envContent + '\n' + extraString);
};
exports.writeEnvVite = writeEnvVite;
const configToViteEnv = (firebaseConfig) => {
    const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId, } = firebaseConfig;
    return `VITE_FIREBASE_API_TITLE_1=main
VITE_FIREBASE_API_KEY_1=${apiKey}
VITE_FIREBASE_AUTH_DOMAIN_1=${authDomain}
VITE_FIREBASE_DATABASE_URL_1=https://${projectId}.firebaseio.com
VITE_FIREBASE_PROJECT_ID_1=${projectId}
VITE_FIREBASE_STORAGE_BUCKET_1=${storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID_1=${messagingSenderId}
VITE_FIREBASE_APP_ID_1=${appId}
VITE_FIREBASE_MEASUREMENT_ID_1=${measurementId}

VITE_FIREBASE_ACCOUNTS=1
VITE_INITIAL_ROUTE=/admin/pages
`;
};
const checkMissingKeys = (object, keys) => {
    const output = [];
    keys.forEach((key) => {
        if (typeof object[key] === 'undefined') {
            output.push(key);
        }
    });
    return output;
};
const envError = (message) => {
    console.log(chalk_1.default.red(message));
    console.log('generate an .env file with the following format:\n' +
        JSON.stringify({
            VITE_FIREBASE_API_KEY: '',
            VITE_FIREBASE_AUTH_DOMAIN: '',
            VITE_FIREBASE_DATABASE_URL: '',
            VITE_FIREBASE_PROJECT_ID: '',
            VITE_FIREBASE_STORAGE_BUCKET: '',
            VITE_FIREBASE_MESSAGING_SENDER_ID: '',
            VITE_FIREBASE_APP_ID: '',
        }, null, 4));
};
exports.envError = envError;
