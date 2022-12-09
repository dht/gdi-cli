// shortcuts: bootstrap
// desc: bootstrap gdi instance
import chalk from 'chalk';
import fs from 'fs';
import { parseArgv } from '../../utils/argv';
import { askQuestion } from '../../utils/input';
import { Question } from '../../types';
import { questions } from '../../data/questions.bootstrap';
import {
    createProject,
    findOrCreateWebApp,
    firebaseCliExists,
    FirebaseResponse,
    runCommand,
    setCwd,
    writeEnvFiles,
} from '../../utils/firebase';
import { printTable } from '../../utils/console';
import { get } from 'lodash';

const argv = parseArgv(process.argv);
const cwd = argv.cwd;
const cwdAdmin = `${cwd}/gdi-admin`;

// ================================================

const run = async () => {
    let answer: any,
        question: Question,
        response: FirebaseResponse,
        projectId: string = '';

    const cliExists = await firebaseCliExists();

    if (!cliExists) {
        show.missingFirebaseCli();
        return;
    }

    console.log(`working directory: ${chalk.cyan(cwdAdmin)}\n`);
    setCwd(cwdAdmin);

    question = questions.existingOrNew;
    answer = await askQuestion(question);

    if (answer === 'new') {
        question = questions.newProjectName;
        answer = await askQuestion(question);
        projectId = await createProject(answer);

        response = await runCommand({
            command: 'use',
            args: [projectId],
            loadingMessage: 'Linking project',
        });

        show.newProjectNextSteps(projectId);
        return;
    }

    response = await runCommand({
        command: 'projects:list',
        loadingMessage: 'Fetching projects',
    });

    question = questions.selectProject(response.data as Json[]);
    answer = await askQuestion(question);
    projectId = answer;

    response = await runCommand({
        command: 'use',
        args: [projectId],
        loadingMessage: 'Linking project',
    });

    response = await findOrCreateWebApp();

    const sdkConfig = get(response, 'data.sdkConfig', {});

    fs.writeFileSync(`${cwd}/webapp.json`, JSON.stringify(sdkConfig, null, 4));

    writeEnvFiles(sdkConfig);

    show.loginInstructions();
};

const show = {
    missingFirebaseCli: () => {
        console.log(chalk.red('firebase cli not found'));

        printTable(
            [
                [chalk.yellow('installation'), 'npm install -g firebase-tools'],
                [chalk.yellow('docs'), 'https://firebase.google.com/docs/cli'],
            ],
            [15, 40]
        );
    },
    newProjectNextSteps: (projectId: string) => {
        console.log(`\nProject ${chalk.cyan(projectId)} was created`);
        console.log('Next steps:');
        console.log(
            `  - navigate to https://console.firebase.google.com/u/0/project/${projectId}`
        );
        console.log(`  - Enable Authentication with Google SignIn`);
        console.log(`  - Enable Firestore (in Test Mode)`);
        console.log(`  - Enable Storage\n`);
        console.log(
            `When finished run ${chalk.cyan(
                'gdi bootstrap'
            )} once more\nand select "Existing project"`
        );
    },
    loginInstructions: () => {
        console.log(`\nRun ${chalk.cyan('gdi start')} to run the admin`);
        console.log(`- navigate to ${chalk.yellow('http://localhost:3000')}`);
        console.log('- Sign in with Google');
        console.log(`- Return here and run ${chalk.cyan('gdi setAdmin')}\n`);
    },
};

run();
