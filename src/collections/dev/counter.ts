// shortcuts: counter, cloc
// desc: counts files
import globby from 'globby';
import { parseArgv } from '../../utils/argv';
import path from 'path';
import * as fs from 'fs-extra';
import { get } from 'lodash';

const argv = parseArgv(process.argv);
const { cwd } = argv;

const mapExt: any = {
    '.ts': 'ts',
    '.tsx': 'jsx',
    '.js': 'js',
    '.scss': 'scss',
};

const mapSemantic: any = {
    selector: (filepath: string) => filepath.includes('selectors'),
    style: (filepath: string) => filepath.includes('.style.'),
    component: (filepath: string) => filepath.includes('/components/'),
    container: (filepath: string) => filepath.includes('/container/'),
    saga: (filepath: string) => filepath.includes('saga.') || filepath.includes('/sagas/'), // prettier-ignore
    utils: (filepath: string) => filepath.includes('/utils/'),
    hook: (filepath: string) => filepath.includes('use'),
};

let totalGlobal: any = {
    byType: {},
    bySemantic: {},
};

const ignorePackages = ['submodules/gdi-datasets'];

const analyzePackage = (pkg: string) => {
    if (ignorePackages.includes(pkg)) {
        return;
    }

    const root = `${cwd}/${pkg}`;
    const src = `${root}/src`;

    const name = pkg.split('/').pop();

    let gitIgnore: any = [];

    const gitIgnorePath = `${root}/.gitignore`;
    if (fs.existsSync(gitIgnorePath)) {
        gitIgnore = fs
            .readFileSync(gitIgnorePath, 'utf8')
            .split('\n')
            .filter((i) => i)
            .map((i) => i.replace(/^src\//, ''))
            .map((i) => `**/${i}`);
    }

    const files = globby
        .sync('**/*', {
            cwd: src,
            onlyFiles: true,
            ignore: [
                '**/node_modules/**',
                '**/dist/**',
                '**/*.driver.tsx',
                '**/*.driver.ts',
                '**/*.spec.tsx',
                '**/*.spec.ts',
                '**/*.snap',
                '**/*.md',
                '**/*.json',
                '**/*.yml',
                '**/*.css',
                '**/gdi-datasets/**/*',
                ...gitIgnore,
            ],
        })
        .map((file) => {
            const filepath = `${src}/${file}`;
            const fileInfo = fs.statSync(filepath);
            const pathInfo = path.parse(file);
            const content = fs.readFileSync(filepath, 'utf8');
            const lines = content.split('\n').length;

            const semantic =
                Object.keys(mapSemantic).find((key) => {
                    return mapSemantic[key](filepath);
                }) ?? 'unknown';

            return {
                filepath,
                size: fileInfo.size,
                semantic,
                lines,
                ext: mapExt[pathInfo.ext] ?? 'unknown',
            };
        });

    const byType: any = {};
    const bySemantic: any = {};

    const totalLines = files.reduce((acc, file) => acc + file.lines, 0);
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    files.forEach((file: any) => {
        sum(byType, file, file.ext);
        sum(totalGlobal.byType, file, file.ext);
    });

    files.forEach((file: any) => {
        sum(bySemantic, file, file.semantic);
        sum(totalGlobal.bySemantic, file, file.semantic);
    });

    return {
        name,
        packagePath: pkg,
        count: files.length,
        byType,
        bySemantic,
        totalLines,
        totalSize,
    };
};

const sum = (obj: any, file: any, key: string) => {
    obj[key] = obj[key] || {
        count: 0,
        lines: 0,
        size: 0,
    };

    obj[key].count += 1;
    obj[key].lines += file.lines;
    obj[key].size += file.size;

    obj['all'] = obj['all'] || {
        count: 0,
        lines: 0,
        size: 0,
    };

    obj['all'].count += 1;
    obj['all'].lines += file.lines;
    obj['all'].size += file.size;
};

const run = async () => {
    const packageJson = fs.readJsonSync(`${cwd}/package.json`);

    const packages = globby.sync(packageJson.workspaces, {
        cwd,
        onlyDirectories: true,
    });

    const output: any = {};
    console.time('start');

    packages.forEach((pkg) => {
        const result = analyzePackage(pkg);
        if (result) {
            output[pkg] = result;
        }
    });

    const summary: any = {
        byType: {},
        bySemantic: {},
        byPackage: {
            total: 0,
        },
    };

    Object.keys(output)
        .map((pkg) => {
            const json = output[pkg];
            const value = get(json, 'byType.all.lines');

            return {
                pkg,
                value,
            };
        })
        .sort(sortBy('value'))
        .forEach((pair) => {
            summary.byPackage.total += pair.value;
            summary.byPackage[pair.pkg] = pair.value;
        });

    Object.keys(totalGlobal.byType)
        .map((ext) => {
            const json = totalGlobal.byType[ext];
            const value = get(json, 'lines');

            return {
                ext,
                value,
            };
        })
        .sort(sortBy('value'))
        .forEach((pair) => {
            summary.byType[pair.ext] = pair.value;
        });

    Object.keys(totalGlobal.bySemantic)
        .map((semantic) => {
            const json = totalGlobal.bySemantic[semantic];
            const value = get(json, 'lines');

            return {
                ext: semantic,
                value,
            };
        })
        .sort(sortBy('value'))
        .forEach((pair) => {
            summary.bySemantic[pair.ext] = pair.value;
        });

    fs.writeJsonSync(`${cwd}/.cloc/summary.json`, summary, { spaces: 4 });
    fs.writeJsonSync(`${cwd}/.cloc/total.json`, totalGlobal, { spaces: 4 });
    fs.writeJsonSync(`${cwd}/.cloc/all.json`, output, { spaces: 4 });

    console.timeEnd('start');
};

const sortBy = (fieldName: string) => (a: any, b: any) => {
    if (a[fieldName] === b[fieldName]) {
        return 0;
    }
    return a[fieldName] > b[fieldName] ? -1 : 1;
};

run();
