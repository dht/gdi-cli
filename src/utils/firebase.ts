import fs from 'fs';
import chalk from 'chalk';
import { guid4 } from 'shared-base';
import { run } from '../cli/cli';
import { showSpinner, stopSpinner } from './spinner';
import path from 'path';
import { get } from 'lodash';
import { writeEnvVite } from './env';

let cwd: string = '';

export const setCwd = (value: string) => {
    cwd = value;
};

export type FirebaseResponse = {
    success: boolean;
    error?: string;
    data?: Json | Json[];
};

export type FirebaseCommand = {
    command: string;
    args?: string[];
    shouldExitOnError?: boolean;
    loadingMessage?: string;
};

export const runCommand = async (
    cmd: FirebaseCommand
): Promise<FirebaseResponse> => {
    const {
        command,
        args = [],
        loadingMessage,
        shouldExitOnError = true,
    } = cmd;

    if (loadingMessage) {
        showSpinner(loadingMessage);
    }

    const output: FirebaseResponse = {
        success: false,
    };

    const allArgs = [command, '-j', ...args];

    const responseRaw = await run('firebase', allArgs, cwd);

    if (loadingMessage) {
        stopSpinner();
    }

    let response: Json = {};

    try {
        response = JSON.parse(responseRaw);
    } catch (_err) {}

    if (response.status === 'success') {
        output.success = true;
        output.data = response.result;
    } else {
        output.error = response.error;

        if (shouldExitOnError) {
            console.log(`error while running: firebase ${allArgs.join(' ')}`);
            console.log(chalk.red(response.error));
            process.exit(1);
        }
    }

    return output;
};

export const createProject = async (projectName: string) => {
    const projectId = projectName + '-' + guid4();

    const response = await runCommand({
        command: 'projects:create',
        args: ['-n', projectName, '-i', projectId],
        loadingMessage: `Creating new project: ${chalk.cyan(projectId)}`,
    });

    return get(response, 'data.projectId', '');
};

export const firebaseCliExists = async () => {
    const response = await run('which', ['firebase'], cwd);
    return typeof response === 'string' && response.length > 0;
};

export const writeOutput = (name: string, output: Json = {}) => {
    const cwd = path.resolve(__dirname, '../../docs/output');

    fs.writeFileSync(
        `${cwd}/firebase.${name}.txt`,
        JSON.stringify(output, null, 4)
    );
};

export const findOrCreateWebApp = async () => {
    let response: FirebaseResponse,
        webAppId = '';

    response = await runCommand({
        command: 'apps:list',
        args: ['WEB'],
        loadingMessage: 'Fetching list of web apps',
    });

    webAppId = get(response, 'data[0].appId', '');

    if (!webAppId) {
        response = await runCommand({
            command: 'apps:create',
            args: ['WEB', 'webApp'],
            loadingMessage: 'Creating a web app',
        });

        webAppId = get(response, 'data.appId', '');
    }

    response = await runCommand({
        command: 'apps:sdkconfig',
        args: ['WEB', webAppId],
        loadingMessage: 'Fetching web app config',
    });

    if (!response.success) {
        console.log(chalk.red(response.error));
        process.exit(1);
    }

    return response;
};

export const writeEnvFiles = (firebaseConfig: Json) => {
    showSpinner('Writing .env files');
    writeEnvVite(cwd, firebaseConfig, {
        menu: ['doing', 'site', 'marketing', 'factory', 'shop', 'extra'].join(
            ','
        ),
    });

    writeEnvVite(`${cwd}/../gdi-site`, firebaseConfig);
    stopSpinner();
};
