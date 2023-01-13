// shortcuts: yaml
// desc: watches a yaml, translates it to json on change
import fs from 'fs';
import path from 'path';
import { parseArgv } from '../../utils/argv';
import chalk from 'chalk';
import yaml from 'js-yaml';
import globby from 'globby';
import { debounce } from 'lodash';
import chokidar from 'chokidar';

const DEBOUNCE_DELAY = 1000;

const argv = parseArgv(process.argv);
const { cwd } = argv;

const filenames = globby.sync('**/*.yml', { cwd });

if (filenames.length === 0) {
    console.log(chalk.red(`no yaml file found in ${cwd}`));
    process.exit();
}

function transform(filename: string) {
    const timestamp = ts();

    const inputFile = `${cwd}/${filename}`;
    const { dir, name, base } = path.parse(inputFile);
    const filenameOutput = name + '.json';

    const outputDir = `${dir}/json`;
    const outputFile = `${outputDir}/${filenameOutput}`;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(
        [
            chalk.green(`${timestamp} |`),
            'writing new file to',
            chalk.yellow(filenameOutput),
        ].join(' ')
    );

    const contentYaml = fs.readFileSync(inputFile, 'utf8');
    const contentJson = yaml.load(contentYaml);
    fs.writeFileSync(outputFile, JSON.stringify(contentJson, null, 4));
}

const lz = (num: number) => (String(num).length < 2 ? '0' + num : String(num));

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

const transformWithDebounce = debounce(transform, DEBOUNCE_DELAY);

const watcher = chokidar.watch(filenames, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    cwd,
});

watcher.on('change', (filename) => {
    transformWithDebounce(filename);
});

console.log(chalk.magenta('watching:'));
filenames.forEach((filename) => {
    console.log(chalk.cyan('\t' + filename));
});
