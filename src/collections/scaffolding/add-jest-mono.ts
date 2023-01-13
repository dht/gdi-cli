// shortcuts: monojest
// desc: adds jest to all packages in monorepo
import globby from 'globby';
import fs from 'fs-extra';
import path from 'path';
import { parseArgv } from '../../utils/argv';

const argv = parseArgv(process.argv);
const { cwd } = argv;

const rootPackage = fs.readJsonSync(`${cwd}/package.json`);
const { workspaces = {} } = rootPackage;
const { packages = [] } = workspaces;

const allFiles: string[] = [];

packages.forEach((p: string) => {
    const files = globby.sync(`${cwd}/${p}/package.json`);
    allFiles.push(...files);
});

allFiles.forEach((file) => {
    const content = fs.readJsonSync(file);
    content.devDependencies = {
        ...content.devDependencies,
        '@types/jest': '^27.5.1',
        jest: '^28.1.0',
        'ts-jest': '^28.0.2',
        typescript: '^4.6.4',
    };
    fs.writeJsonSync(file, content, { spaces: 4 });

    const { dir } = path.parse(file);
    const jestConfigPath = `${dir}/jest.config.js`;

    if (!fs.existsSync(jestConfigPath)) {
        fs.writeFileSync(
            jestConfigPath,
            `module.exports = {
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.spec.json',
        },
    },
    testMatch: ['<rootDir>/**/*.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js'],
};
`
        );
    }
});
