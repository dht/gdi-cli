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

export const runCommand = async (
    command: string,
    args: string[] = []
): Promise<FirebaseResponse> => {
    const output: FirebaseResponse = {
        success: false,
    };

    const allArgs = [command, '-j', ...args];

    const responseRaw = await run('firebase', allArgs, cwd);

    let response: Json = {};

    try {
        response = JSON.parse(responseRaw);
    } catch (_err) {}

    if (response.status === 'success') {
        output.success = true;
        output.data = response.result;
    } else {
        output.error = response.error;
    }

    return output;
};

export const runCommand$ = async (
    command: string,
    args: string[] = [],
    loadingMessage: string = ''
): Promise<FirebaseResponse> => {
    showSpinner(loadingMessage);
    const response = await runCommand(command, args);
    stopSpinner();
    return response;
};

export const createProject = async (projectName: string) => {
    const projectId = projectName + '-' + guid4();

    showSpinner(`Creating new project: ${chalk.cyan(projectId)}`);

    const response = await runCommand('projects:create', [
        '-n',
        projectName,
        '-i',
        projectId,
    ]);

    stopSpinner();

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

    response = await runCommand$('apps:list', ['WEB'], 'Fetching list of web apps'); // prettier-ignore
    webAppId = get(response, 'data[0].appId', '');

    if (!webAppId) {
        response = await runCommand$('apps:create', ['WEB', 'webApp'], 'Creating a web app'); // prettier-ignore
        webAppId = get(response, 'data.appId', '');
    }

    response  = await runCommand$('apps:sdkconfig', ['WEB', webAppId], 'Fetching web app config'); // prettier-ignore

    return response;
};

export const writeEnvFiles = (firebaseConfig: Json) => {
    showSpinner('Writing .env files');
    writeEnvVite(`${cwd}/gdi-admin`, firebaseConfig, {
        menu: ['doing', 'site', 'marketing', 'factory', 'shop', 'extra'].join(
            ','
        ),
    });

    writeEnvVite(`${cwd}/gdi-site`, firebaseConfig);
    writeEnvVite(cwd, firebaseConfig);
    stopSpinner();
};
