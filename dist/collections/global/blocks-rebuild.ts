// shortcuts: blocks
// desc: rebuild node_modules @gdi/block-init
import chalk from 'chalk';
import fs from 'fs-extra';
import { parseArgv } from '../../utils/argv';
import _ from 'lodash';

const argv = parseArgv(process.argv);
const cwd = argv.cwd;
const packageSite = `${cwd}/clients/gdi-site/package.json`;
const packageAdmin = `${cwd}/clients/gdi-admin/package.json`;
const initSite = `${cwd}/clients/gdi-site/src/blocks/blocks.init.ts`;
const initAdmin = `${cwd}/clients/gdi-admin/src/blocks/blocks.init.ts`;

const blocksFile = `${cwd}/.blocks`;

// ================================================

const run = async () => {
    if (!fs.existsSync(blocksFile)) {
        console.log(chalk.red(`no .blocks file found found ${cwd}`));
        process.exit();
    }

    if (!fs.existsSync(packageSite)) {
        console.log(chalk.red(`no package.json found in ${packageSite}`));
        process.exit();
    }

    if (!fs.existsSync(packageAdmin)) {
        console.log(chalk.red(`no package.json found in ${packageSite}`));
        process.exit();
    }

    const blocks = fs
        .readFileSync(blocksFile, 'utf8')
        .split('\n')
        .filter((i) => i !== '');

    const regex = /block-[a-z]+-[a-z0-9]+/g;

    const count: Count = {
        removed: 0,
        added: 0,
    };

    count.removed = removeDependencies(packageSite, regex);
    count.added = addDependencies(packageSite, blocks);
    logCount('site', count);

    count.removed = removeDependencies(packageAdmin, regex);
    count.added = addDependencies(packageAdmin, blocks);
    logCount('admin', count);

    updateBlocksInit(initAdmin, blocks);
    updateBlocksInit(initSite, blocks);
};

const updateBlocksInit = (filepath: string, blocks: string[]) => {
    const blockImports: string[] = [];
    const blockParams: string[] = [];

    blocks.forEach((block) => {
        const name = (block.split('/').pop() ?? '').replace('block-', '');
        const name_ = name.replace(/-/g, '_');

        const blockName = _.upperFirst(
            _.camelCase(block.replace('block-', ''))
        );
        blockImports.push(
            `import { block as block_${name_} } from '@gdi/block-${name}';`
        );
        blockParams.push(`[block_${name_}.id]: block_${name_}`);
    });

    const contentBlockInit = templateBlockInit(blockImports, blockParams);
    fs.writeFileSync(filepath, contentBlockInit);
};

const logCount = (packageName: string, count: Count) => {
    console.log(
        [
            chalk.yellow(`${packageName}:`),
            `${chalk.green(count.added)} added,`,
            `${chalk.red(count.removed)} removed`,
        ].join(' ')
    );
};

const addDependencies = (packageJsonPath: string, blocks: string[]) => {
    let count = 0;

    const packageContent = fs.readJsonSync(packageJsonPath);

    blocks.forEach((block) => {
        packageContent.dependencies[block] = 'latest';
        count++;
    });

    fs.writeJsonSync(packageJsonPath, packageContent, { spaces: 4 });

    return count;
};

const removeDependencies = (packageJsonPath: string, regex: RegExp) => {
    let count = 0;

    const packageContent = fs.readJsonSync(packageJsonPath);

    Object.keys(packageContent.dependencies).forEach((dep) => {
        if (dep.match(regex)) {
            delete packageContent.dependencies[dep];
            count++;
        }
    });

    fs.writeJsonSync(packageJsonPath, packageContent, { spaces: 4 });
    return count;
};

const templateBlockInit = (imports: string[], params: string[]) => {
    return `import { initBlocks as initBlockBase } from '@gdi/engine';
${imports.join('\n')}
    
    export const initBlocks = () => {
        initBlockBase({
            ${params.join(',\n\t\t\t')}
        });
    };
    `;
};

run();

type Count = {
    removed: number;
    added: number;
};
