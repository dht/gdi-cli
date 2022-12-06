"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopSpinner = exports.showSpinner = void 0;
const chalk_1 = __importDefault(require("chalk"));
const cli_spinner_1 = require("cli-spinner");
const readline_1 = __importDefault(require("readline"));
const spinner = new cli_spinner_1.Spinner('%s');
spinner.setSpinnerString('⣾⣽⣻⢿⡿⣟⣯⣷');
let index = 0;
const showSpinner = (message) => {
    if (message) {
        spinner.setSpinnerTitle(`${message} %s`);
        index = message.length;
    }
    else {
        spinner.setSpinnerTitle('%s');
        index = 0;
    }
    spinner.start();
};
exports.showSpinner = showSpinner;
const stopSpinner = (message = 'done') => {
    spinner.stop();
    readline_1.default.cursorTo(process.stdout, index + 1);
    console.log(chalk_1.default.green(message));
};
exports.stopSpinner = stopSpinner;
