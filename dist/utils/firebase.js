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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = exports.setCwd = void 0;
const cli_1 = require("../cli/cli");
let cwd = '';
const setCwd = (value) => {
    cwd = value;
};
exports.setCwd = setCwd;
const runCommand = (command) => __awaiter(void 0, void 0, void 0, function* () {
    const output = {
        success: false,
    };
    const args = [command, '-j'];
    const responseRaw = yield (0, cli_1.run)('firebase', args, cwd);
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
