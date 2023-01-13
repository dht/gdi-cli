// shortcuts: clearnm
// desc: clears node_modules recursively
import globby from 'globby';
import fs from 'fs-extra';
import { parseArgv } from '../../utils/argv';

const argv = parseArgv(process.argv);
const { cwd } = argv;

const rootPackage = fs.readJsonSync('./package.json');
const { workspaces = {} } = rootPackage;
const { packages: monorepoPackages = [] } = workspaces;

const packagesPaths = monorepoPackages
    .filter((p) => p.match(/[a-zA-Z0-9]+\/\*/))
    .map((p) => p.replace(/\/\*$/, ''));

const packagesNodeModulesPaths = packagesPaths.map(
    (p) => `${p}/*/node_modules`
);

const packagesLockFilesPaths = packagesPaths.reduce(
    (output: string[], p: string) => {
        output.push(`${p}/*/yarn.lock`);
        output.push(`${p}/*/yalc.lock`);
        output.push(`${p}/*/yarn-error.log`);
        return output;
    },
    ['yarn.lock', 'yalc.lock', 'yarn-error.log']
);

const dirs = globby.sync(packagesNodeModulesPaths, {
    cwd,
    onlyDirectories: true,
});

if (fs.existsSync('node_modules')) {
    dirs.push('node_modules');
}

dirs.forEach((dir) =>
    fs.rmSync(dir, {
        recursive: true,
        force: true,
    })
);

const files = globby.sync(packagesLockFilesPaths, {
    cwd,
});
files.forEach((file) =>
    fs.rmSync(file, {
        force: true,
    })
);

console.log('files ->', files);
console.log('dirs ->', dirs);
