// shortcuts: bootstrap
// desc: bootstrap gdi instance
import chalk from 'chalk';
import { parseArgv } from '../../utils/argv';
import { askQuestion } from '../../utils/input';
import { Question } from '../../types';
import { questions } from '../../data/questions.bootstrap';
import { FirebaseResponse, runCommand, setCwd } from '../../utils/firebase';

const argv = parseArgv(process.argv);
const { cwd } = argv;

// ================================================

const run = async () => {
    let answer: any, question: Question, response: FirebaseResponse;

    console.log(chalk.green('bootstrapping'));

    setCwd(cwd);

    question = questions.existingOrNew;
    answer = await askQuestion(question);
    console.log('answer ->', answer);

    response = await runCommand('projects:list');
    console.log('response ->', response);

    question = questions.selectProject(response.data as Json[]);
    answer = await askQuestion(question);
    console.log('answer ->', answer);

    // response = await runCommand('apps:list');
    // console.log('response ->', response);
};

run();
