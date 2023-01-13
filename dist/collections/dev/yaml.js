"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// shortcuts: yaml
// desc: watches a yaml, translates it to json on change
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const argv_1 = require("../../utils/argv");
const chalk_1 = __importDefault(require("chalk"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const globby_1 = __importDefault(require("globby"));
const lodash_1 = require("lodash");
const chokidar_1 = __importDefault(require("chokidar"));
const DEBOUNCE_DELAY = 1000;
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
const filenames = globby_1.default.sync('**/*.yml', { cwd });
if (filenames.length === 0) {
    console.log(chalk_1.default.red(`no yaml file found in ${cwd}`));
    process.exit();
}
function transform(filename) {
    const timestamp = ts();
    const inputFile = `${cwd}/${filename}`;
    const { dir, name, base } = path_1.default.parse(inputFile);
    const filenameOutput = name + '.json';
    const outputDir = `${dir}/json`;
    const outputFile = `${outputDir}/${filenameOutput}`;
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    console.log([
        chalk_1.default.green(`${timestamp} |`),
        'writing new file to',
        chalk_1.default.yellow(filenameOutput),
    ].join(' '));
    const contentYaml = fs_1.default.readFileSync(inputFile, 'utf8');
    const contentJson = js_yaml_1.default.load(contentYaml);
    fs_1.default.writeFileSync(outputFile, JSON.stringify(contentJson, null, 4));
}
const lz = (num) => (String(num).length < 2 ? '0' + num : String(num));
const ts = () => {
    let output = [];
    const now = new Date();
    output.push(lz(now.getHours()));
    output.push(lz(now.getMinutes()));
    output.push(lz(now.getSeconds()));
    return output.join(':');
};
filenames.forEach((filename) => {
    transform(filename);
});
const transformWithDebounce = (0, lodash_1.debounce)(transform, DEBOUNCE_DELAY);
const watcher = chokidar_1.default.watch(filenames, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    cwd,
});
watcher.on('change', (filename) => {
    transformWithDebounce(filename);
});
console.log(chalk_1.default.magenta('watching:'));
filenames.forEach((filename) => {
    console.log(chalk_1.default.cyan('\t' + filename));
});
