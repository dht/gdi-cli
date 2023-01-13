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
exports.middlewares = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
const cases_1 = __importDefault(require("../utils/cases"));
const prompt_1 = require("../utils/prompt");
const MONO_REPO_LAYOUT_CONFIGURATION_FILENAME = '.layout.json';
const NON_COMPONENT_TEMPLATES = ['microservice', 'sample'];
const preRun = () => (command, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { local } = command;
    const { params } = local;
    const { cwd, entityName, templatesPath } = params;
    const templates = fs_extra_1.default
        .readdirSync(templatesPath)
        .filter((templateName) => !NON_COMPONENT_TEMPLATES.includes(templateName));
    if (!entityName) {
        console.log('missing component name.');
        return;
    }
    const configurationFilepath = cwd + '/' + MONO_REPO_LAYOUT_CONFIGURATION_FILENAME;
    const packageFilepath = cwd + '/package.json';
    let template = '', outputDir = '';
    if (fs_extra_1.default.existsSync(configurationFilepath)) {
        const layoutConfiguration = fs_extra_1.default.readJsonSync(configurationFilepath);
        let packageName = '';
        if (Object.keys(layoutConfiguration).length === 1) {
            packageName = Object.keys(layoutConfiguration)[0];
        }
        else {
            packageName = yield (0, prompt_1.autoComplete)('Pick the relevant package', Object.keys(layoutConfiguration));
        }
        const packageConfig = layoutConfiguration[packageName];
        template = packageConfig.template;
        outputDir = `${packageConfig.path}/${entityName}`;
    }
    else {
        template = yield (0, prompt_1.autoComplete)('Pick a component template', templates);
        outputDir = cases_1.default.upperFirst(entityName);
    }
    if (outputDir) {
        outputDir = `${cwd}/${outputDir}`;
    }
    let templateId = '', templateName = '';
    if (fs_extra_1.default.existsSync(packageFilepath)) {
        const packageJson = fs_extra_1.default.readJsonSync(packageFilepath);
        const { gdi } = packageJson;
        if (gdi && gdi.templateId) {
            templateId = gdi.templateId;
            templateName = gdi.templateId.split('.').pop();
        }
    }
    if (fs_extra_1.default.pathExistsSync(outputDir)) {
        console.log(chalk_1.default.red(`path "${outputDir}" already exists`));
        return;
    }
    command.local.params.template = template;
    command.local.params.outputDir = outputDir;
    command.local.rulesReplaceFileName = {
        componentName: ({ entityName }) => entityName,
    };
    command.local.rulesReplaceContent = {
        '\\$TEMPLATE_ID': () => templateId,
        '\\$TEMPLATE_NAME': () => templateName,
        '\\$CMPLC': ({ entityName }) => cases_1.default.lowerCase(entityName),
        '\\$CMPCC': ({ entityName }) => cases_1.default.camelCase(entityName),
        '\\$CMP': ({ entityName }) => entityName,
    };
    next();
});
const parseInstructions = () => (command, next) => {
    next();
};
const postRun = () => (command, next) => {
    next();
};
exports.middlewares = {
    preRun,
    parseInstructions,
    postRun,
};
