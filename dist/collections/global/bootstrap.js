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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// shortcuts: bootstrap
// desc: bootstrap gdi instance
const chalk_1 = __importDefault(require("chalk"));
const argv_1 = require("../../utils/argv");
const input_1 = require("../../utils/input");
const questions_bootstrap_1 = require("../../data/questions.bootstrap");
const firebase_1 = require("../../utils/firebase");
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
// ================================================
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    let answer, question, response;
    console.log(chalk_1.default.green('bootstrapping'));
    (0, firebase_1.setCwd)(cwd);
    question = questions_bootstrap_1.questions.existingOrNew;
    answer = yield (0, input_1.askQuestion)(question);
    console.log('answer ->', answer);
    response = yield (0, firebase_1.runCommand)('projects:list');
    console.log('response ->', response);
    question = questions_bootstrap_1.questions.selectProject(response.data);
    answer = yield (0, input_1.askQuestion)(question);
    console.log('answer ->', answer);
    // response = await runCommand('apps:list');
    // console.log('response ->', response);
});
run();
