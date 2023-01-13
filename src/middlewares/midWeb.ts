import fs from 'fs-extra';
import chalk from 'chalk';
import cases from '../utils/cases';
import { CreateMiddlewares } from '../types';
import { Command } from '../utils/command';

const preRun = () => async (command: Command, next: any) => {
    const { local } = command;
    const { params } = local;
    const { cwd, entityName } = params;

    if (!entityName) {
        console.log('missing app name.');
        return;
    }

    let template = 'web',
        outputDir = `${cwd}/${entityName}`;

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
        '\\$WEB_NAME_CAPITAL': ({ entityName }) => cases.upperFirst(entityName),
        '\\$WEB_NAME': ({ entityName }) => cases.lowerCase(entityName),
    };

    next();
};

const parseInstructions = () => (command: Command, next: any) => {
    next();
};

const postRun = () => (command: Command, next: any) => {
    next();
};

export const middlewares: CreateMiddlewares = {
    preRun,
    parseInstructions,
    postRun,
};
