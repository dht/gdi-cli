import fs from 'fs-extra';
import chalk from 'chalk';
import cases from '../utils/cases';
import { CreateMiddlewares } from '../types';
import { Command } from '../utils/command';
import {
    addAppToTsConfig,
    addAppToViteConfig,
    replaceBootstrapRedirect,
    updatePlatformSaga,
} from '../utils/apps';

const preRun = () => async (command: Command, next: any) => {
    const { local } = command;
    const { params } = local;
    const { cwd, entityName } = params;

    if (!entityName) {
        console.log('missing app name.');
        return;
    }

    let template = 'app',
        appsDir = `${cwd}/apps`,
        outputDir = `${appsDir}/${entityName}`;

    if (!fs.pathExistsSync(appsDir)) {
        console.log(chalk.red(`apps path "${appsDir}" could not be found`));
        return;
    }

    if (fs.pathExistsSync(outputDir)) {
        console.log(chalk.red(`path "${outputDir}" already exists`));
        return;
    }

    command.local.params.template = template;
    command.local.params.outputDir = outputDir;

    command.local.rulesReplaceFileName = {
        componentName: ({ entityName }) => entityName,
    };

    command.local.rulesReplaceContent = {
        '\\$APP_NAME_CAPITAL': ({ entityName }) => cases.upperFirst(entityName),
        '\\$APP_NAME': ({ entityName }) => cases.lowerCase(entityName),
    };

    next();
};

const parseInstructions = () => (command: Command, next: any) => {
    next();
};

const postRun = () => (command: Command, next: any) => {
    const { local } = command;
    const { params } = local;
    const { cwd, entityName } = params;

    const paths = {
        tsconfig: `${cwd}/clients/web/tsconfig.json`,
        viteConfig: `${cwd}/clients/web/vite.config.ts`,
        platformSaga: `${cwd}/clients/web/src/platform/platform-saga.ts`,
        bootstrap: `${cwd}/clients/web/src/components/Bootstrap/Bootstrap.tsx`,
    };

    addAppToTsConfig(paths.tsconfig, entityName);
    addAppToViteConfig(paths.viteConfig, entityName);
    updatePlatformSaga(paths.platformSaga, entityName);
    replaceBootstrapRedirect(paths.bootstrap, entityName);

    next();
};

export const middlewares: CreateMiddlewares = {
    preRun,
    parseInstructions,
    postRun,
};
