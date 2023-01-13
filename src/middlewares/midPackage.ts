import cases from '../utils/cases';
import chalk from 'chalk';
import fs from 'fs-extra';
import { Command } from '../utils/command';
import { CreateMiddlewares } from '../types';

const preRun = () => async (command: Command, next: any) => {
    const { local } = command;
    const { params } = local;
    const { cwd, entityName } = params;

    if (!entityName) {
        console.log('missing package name.');
        return;
    }

    let template = 'package',
        outputDir = `${cwd}/${entityName}`;

    if (fs.pathExistsSync(outputDir)) {
        console.log(chalk.red(`path "${outputDir}" already exists`));
        return;
    }

    command.local.params.template = template;
    command.local.params.outputDir = outputDir;
    command.local.rulesReplaceFileName = {};

    command.local.rulesReplaceContent = {
        '\\$PACKAGE_NAME_CAPITAL': ({ entityName }) =>
            cases.upperFirst(entityName),
        '\\$PACKAGE_NAME': ({ entityName }) => cases.lowerCase(entityName),
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
