"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI_DB_PATH = void 0;
const os_1 = require("os");
exports.CLI_DB_PATH = '~/.gdi-cli/db.json'.replace('~', (0, os_1.homedir)());
