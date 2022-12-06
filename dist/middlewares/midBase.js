"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middlewares = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const globby_1 = __importDefault(require("globby"));
const path_1 = __importDefault(require("path"));
const scaffolding_1 = require("../utils/scaffolding");
const console_1 = require("../utils/console");
const input = (options = {}) => (command, next) => {
    console.time('gathering input');
    if (options.skip) {
        next();
        return;
    }
    const { argv } = command;
    const ROOT_TEMPLATES_PATH = path_1.default.resolve(`${__dirname}/../../src/templates/scaffolding`); // prettier-ignore
    const cwd = argv.cwd;
    const entityType = argv._[0];
    const entityName = argv._[1];
    command.local.params = {
        entityType,
        entityName,
        cwd,
        outputDir: `${cwd}/${entityName}`,
        templatesPath: ROOT_TEMPLATES_PATH,
        template: entityType,
        templatePath: '',
    };
    console.timeEnd('gathering input');
    next();
};
const scanTemplateFiles = (options = {}) => (command, next) => {
    if (options.skip) {
        next();
        return;
    }
    console.log(123);
    console.time(`scanning terminal files`);
    const { params, rulesReplaceFileName = {}, rulesReplaceContent = {}, } = command.local;
    console.log('params => ', JSON.stringify(params));
    const { outputDir, templatesPath, template } = params;
    const templatePath = `${templatesPath}/${template}`;
    console.log('path => ', templatePath);
    command.local.params.templatePath = templatePath;
    command.local.filesToCreate = globby_1.default
        .sync('**/*', { cwd: templatePath, dot: true })
        .map((file) => {
        const content = fs_1.default
            .readFileSync(`${templatePath}/${file}`)
            .toString();
        const outputFilepath = (0, scaffolding_1.replaceTextByMap)(`${outputDir}/${file}`, rulesReplaceFileName, params);
        const parsedContent = (0, scaffolding_1.replaceTextByMap)(content, rulesReplaceContent, params);
        return {
            filepath: outputFilepath,
            content: parsedContent,
        };
    });
    console.timeEnd('scanning terminal files');
    next();
};
const saveToCliDb = (options = {}) => (command, next) => {
    if (options.skip) {
        next();
        return;
    }
    next();
};
const writeFiles = (options = {}) => (command, next) => {
    if (options.skip) {
        next();
        return;
    }
    console.time('writing files');
    const { params, filesToCreate } = command.local;
    const { outputDir = '' } = params;
    (0, console_1.printTable)([
        [chalk_1.default.yellow('type'), params.entityType],
        [chalk_1.default.yellow('name'), params.entityName],
        [chalk_1.default.yellow('source'), (0, console_1.prettyPath)(params.templatePath)],
        [chalk_1.default.yellow('dest'), (0, console_1.prettyPath)(params.outputDir)],
    ], [10, 85]);
    fs_1.default.mkdirSync(outputDir);
    filesToCreate.forEach((file) => {
        const { filepath, content } = file;
        const info = path_1.default.parse(filepath);
        if (info.dir) {
            fs_1.default.mkdirSync(info.dir, { recursive: true });
        }
        const logArr = [
            chalk_1.default.magenta(filepath.replace(outputDir + '/', '')),
            '... ',
        ];
        process.stdout.write(logArr.join(''));
        fs_1.default.writeFileSync(filepath, content);
        console.log(chalk_1.default.green('Ok'));
    });
    console.timeEnd('writing files');
    next();
};
exports.middlewares = {
    input,
    scanTemplateFiles,
    saveToCliDb,
    writeFiles,
};
