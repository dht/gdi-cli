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
const fs_1 = __importDefault(require("fs"));
const argv_1 = require("../../utils/argv");
const input_1 = require("../../utils/input");
const questions_bootstrap_1 = require("../../data/questions.bootstrap");
const firebase_1 = require("../../utils/firebase");
const console_1 = require("../../utils/console");
const lodash_1 = require("lodash");
const argv = (0, argv_1.parseArgv)(process.argv);
const cwd = argv.cwd;
const cwdAdmin = `${cwd}/gdi-admin`;
// ================================================
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    let answer, question, response, projectId = '';
    const cliExists = yield (0, firebase_1.firebaseCliExists)();
    if (!cliExists) {
        show.missingFirebaseCli();
        return;
    }
    console.log(`working directory: ${chalk_1.default.cyan(cwdAdmin)}\n`);
    (0, firebase_1.setCwd)(cwdAdmin);
    question = questions_bootstrap_1.questions.existingOrNew;
    answer = yield (0, input_1.askQuestion)(question);
    if (answer === 'new') {
        question = questions_bootstrap_1.questions.newProjectName;
        answer = yield (0, input_1.askQuestion)(question);
        projectId = yield (0, firebase_1.createProject)(answer);
        response = yield (0, firebase_1.runCommand)({
            command: 'use',
            args: [projectId],
            loadingMessage: 'Linking project',
        });
        show.newProjectNextSteps(projectId);
        return;
    }
    response = yield (0, firebase_1.runCommand)({
        command: 'projects:list',
        loadingMessage: 'Fetching projects',
    });
    question = questions_bootstrap_1.questions.selectProject(response.data);
    answer = yield (0, input_1.askQuestion)(question);
    projectId = answer;
    response = yield (0, firebase_1.runCommand)({
        command: 'use',
        args: [projectId],
        loadingMessage: 'Linking project',
    });
    response = yield (0, firebase_1.findOrCreateWebApp)();
    const sdkConfig = (0, lodash_1.get)(response, 'data.sdkConfig', {});
    fs_1.default.writeFileSync(`${cwd}/webapp.json`, JSON.stringify(sdkConfig, null, 4));
    (0, firebase_1.writeEnvFiles)(sdkConfig);
    show.loginInstructions();
});
const show = {
    missingFirebaseCli: () => {
        console.log(chalk_1.default.red('firebase cli not found'));
        (0, console_1.printTable)([
            [chalk_1.default.yellow('installation'), 'npm install -g firebase-tools'],
            [chalk_1.default.yellow('docs'), 'https://firebase.google.com/docs/cli'],
        ], [15, 40]);
    },
    newProjectNextSteps: (projectId) => {
        console.log(`\nProject ${chalk_1.default.cyan(projectId)} was created`);
        console.log('Next steps:');
        console.log(`  - navigate to https://console.firebase.google.com/u/0/project/${projectId}`);
        console.log(`  - Enable Authentication with Google SignIn`);
        console.log(`  - Enable Firestore (in Test Mode)`);
        console.log(`  - Enable Storage\n`);
        console.log(`When finished run ${chalk_1.default.cyan('gdi bootstrap')} once more\nand select "Existing project"`);
    },
    loginInstructions: () => {
        console.log(`\nRun ${chalk_1.default.cyan('gdi start')} to run the admin`);
        console.log(`- navigate to ${chalk_1.default.yellow('http://localhost:3000')}`);
        console.log('- Sign in with Google');
        console.log(`- Return here and run ${chalk_1.default.cyan('gdi setAdmin')}\n`);
    },
};
run();
