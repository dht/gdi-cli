"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyPath = exports.printTable = void 0;
const cli_table_1 = __importDefault(require("cli-table"));
const path_1 = __importDefault(require("path"));
const os_1 = require("os");
const printTable = (rows, colWidths) => {
    const table = new cli_table_1.default({
        colWidths,
    });
    rows.filter((row) => row[0] && row[1]).forEach((row) => table.push(row));
    console.log(table.toString());
};
exports.printTable = printTable;
const prettyPath = (cwd) => {
    return path_1.default.resolve(cwd).replace((0, os_1.homedir)(), '~');
};
exports.prettyPath = prettyPath;
