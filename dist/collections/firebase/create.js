"use strict";
// shortcuts: bootstrap
// desc: bootstrap gdi instance
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
const argv_1 = require("../../utils/argv");
const cli = require('../../cli/cli');
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
// ================================================
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('bootstrapping');
});
run();
