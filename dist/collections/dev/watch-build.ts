// shortcuts: wb
// desc: watches src => builds
import fs from 'fs-extra';
import * as path from 'path';
import { parseArgv } from '../../utils/argv';
import chalk from 'chalk';
import { debounce } from 'lodash';
import * as chokidar from 'chokidar';

type Mode = 'single' | 'multiple';

const cli = require('super0/lib/cli');

const DEBOUNCE = 2500;

const argv = parseArgv(process.argv);
const { cwd, _ } = argv;

let source = cwd + '/src';
let mode: Mode = 'single';

if (_) {
    source = _.map((i: string) => cwd + '/' + i);
    mode = 'multiple';
}

let ignoreDirectories: string[] = [];
const ignoreFilePath = `${cwd}/.ignoreWatch`;

if (fs.existsSync(ignoreFilePath)) {
    ignoreDirectories = fs.readFileSync(ignoreFilePath).toString().split('\n');
}

let isBuilding: Record<string, boolean> = {},
    shouldBuildAfterBuild = false;

const buildProject = async (rootDir: string) => {
    if (isBuilding[rootDir]) {
        shouldBuildAfterBuild = true;
        return;
    }

    isBuilding[rootDir] = true;
    log(chalk.cyan('starting build'));

    await cli.run('yarn', ['build'], rootDir, {
        stdOutMode: true,
    });

    isBuilding[rootDir] = false;
    log('finished building', chalk.cyan(rootDir));
};

const findProjectRoot = (filepath: string) => {
    let output = '';
    let { dir } = path.parse(filepath);

    do {
        dir = path.resolve(dir, '..');
        if (fs.existsSync(`${dir}/package.json`)) {
            output = dir;
        }
    } while (!output && dir !== '/');

    return output;
};

const buildDebounced = debounce(buildProject, DEBOUNCE);

const run = async () => {
    if (mode === 'multiple') {
        log('watching', chalk.yellow(source.length), 'directories');
    } else {
        log('watching', chalk.yellow(source));
    }

    if (ignoreDirectories.length > 0) {
        log('ignoring', chalk.cyan(ignoreDirectories.length), 'directories');
    }

    chokidar
        .watch(source, {
            ignoreInitial: true,
        })
        .on('all', (event, path) => {
            const shouldIgnore = ignoreDirectories.some((dir) => {
                return path.includes(`/${dir}/`);
            });

            if (shouldIgnore) {
                log('ignoring', chalk.cyan(path));
                return;
            }

            log(event, chalk.magenta(path));

            if (mode === 'multiple') {
                const projectRoot = findProjectRoot(path);
                buildDebounced(projectRoot);
            } else {
                buildDebounced(cwd);
            }
        });
};

const log = (...params: string[]) => {
    const message = params.join(' ');
    console.log(message);
};

run();
