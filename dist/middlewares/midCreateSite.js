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
const input_1 = require("../utils/input");
const cli_1 = require("../cli/cli");
const MONO_REPO_LAYOUT_CONFIGURATION_FILENAME = '.layout.json';
const NON_SITE_TEMPLATES = ['react-gdi-template'];
const preRun = () => (command, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { local } = command;
    const { params } = local;
    const { cwd, entityName, templatesPath } = params;
    console.log(chalk_1.default.cyan(`creating a new site: "${entityName}"`));
    const templates = fs_extra_1.default
        .readdirSync(templatesPath)
        .filter((templateName) => !NON_SITE_TEMPLATES.includes(templateName));
    if (!entityName) {
        console.log('missing site name.');
        return;
    }
    const configurationFilepath = cwd + '/' + MONO_REPO_LAYOUT_CONFIGURATION_FILENAME;
    let template = '', outputDir = '';
    if (fs_extra_1.default.existsSync(configurationFilepath)) {
        const layoutConfiguration = fs_extra_1.default.readJsonSync(configurationFilepath);
        let packageName = '';
        if (Object.keys(layoutConfiguration).length === 1) {
            packageName = Object.keys(layoutConfiguration)[0];
        }
        else {
            packageName = yield (0, input_1.autoComplete)('Pick the relevant package', Object.keys(layoutConfiguration));
        }
        const packageConfig = layoutConfiguration[packageName];
        template = packageConfig.template;
        outputDir = `${packageConfig.path}/${entityName}`;
    }
    else {
        if (templates.length === 1) {
            template = templates[0];
        }
        else {
            template = yield (0, input_1.autoComplete)('Pick a site template', templates);
        }
        outputDir = entityName.toLocaleLowerCase();
    }
    if (outputDir) {
        outputDir = `${cwd}/${outputDir}`;
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
        '\\$SITE': ({ entityName }) => entityName.toLowerCase(),
    };
    next();
});
const parseInstructions = () => (command, next) => {
    next();
};
const postRun = () => (command, next) => {
    const { local } = command;
    const { params } = local;
    const { outputDir, entityName } = params;
    const cwdInstall = `${outputDir}/scripts`;
    (0, cli_1.run)('chmod', ['+x', 'install.sh'], cwdInstall).then(() => {
        (0, cli_1.run)('./scripts/install.sh', [entityName], outputDir, {
            stdOutMode: true,
        });
    });
    next();
};
exports.middlewares = {
    preRun,
    parseInstructions,
    postRun,
};
