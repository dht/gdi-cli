"use strict";
// shortcuts: depTree
// desc: analyzes the dependency tree of all packages
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const path = require('path');
const globby = require('globby');
const fs = require('fs');
const child = require('child_process');
const chalk = require('chalk');
const root = path.resolve('.');
let allPackages = [];
let outputContent = [];
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(root);
    console.time('deptree');
    // await writeLatestVersionForAllPackages();
    allPackages = yield getInfo();
    addCurrentStoreVersion();
    const markDownTableHeader = getMarkdownTableHeader([
        { name: 'id' },
        { name: 'packageType', title: 'type/depId' },
        { name: 'name' },
        { name: 'version' },
        { name: 'storeVersion' },
    ]);
    outputContent.push(...markDownTableHeader);
    const tableBody = getTableBody();
    outputContent.push(...tableBody);
    fs.writeFileSync('.cloc/.dependency-tree.md', outputContent.join('\n'), 'utf8');
    console.log(`file written to ${chalk.cyan('.cloc/.dependency-tree.md')}`);
    console.timeEnd('deptree');
});
const writeLatestVersionForAllPackages = () => __awaiter(void 0, void 0, void 0, function* () {
    const output = {};
    allPackages = yield getInfo();
    console.time('getLatestVersion');
    const promises = allPackages.map((packageInfo) => getLatestVersionInNpm(packageInfo.name));
    const responses = yield Promise.all(promises);
    allPackages.forEach((packageInfo, index) => {
        output[packageInfo.name] = responses[index].replace(/\n/g, '');
    });
    console.timeEnd('getLatestVersion');
    fs.writeFileSync('.cloc/.dependency.versions.json', JSON.stringify(output, null, 2), 'utf8');
});
const ignorePackages = ['@gdi/gdi-admin', '@gdi/gdi-site'];
const getLatestVersionInNpm = (packageName) => {
    if (ignorePackages.includes(packageName)) {
        return '-';
    }
    try {
        return exec(`npm view ${packageName} version`, root);
    }
    catch (err) {
        return '-';
    }
};
const addCurrentStoreVersion = () => {
    const storeVersions = fs.readFileSync('.cloc/.dependency.versions.json', 'utf8');
    const storeVersionsParsed = JSON.parse(storeVersions);
    allPackages.forEach((packageInfo) => {
        const storeVersion = storeVersionsParsed[packageInfo.name];
        packageInfo.storeVersion = storeVersion;
        if (packageInfo.version !== storeVersion && storeVersion !== '-') {
            packageInfo.storeVersion += '!';
        }
    });
};
const getTableBody = () => {
    const rows = [];
    let row = [];
    allPackages.forEach((packageInfo) => {
        row = [
            packageInfo.id,
            packageInfo.packageType,
            packageInfo.name,
            packageInfo.version,
            packageInfo.storeVersion,
        ].join('|');
        rows.push('|' + row + '|');
        const { dependenciesRaw } = packageInfo;
        Object.keys(dependenciesRaw).forEach((dependency) => {
            const versionNeeded = dependenciesRaw[dependency];
            const depInfo = findPackageByName(dependency);
            if (depInfo) {
                let text = depInfo.storeVersion;
                if (versionNeeded.replace('^', '') !== depInfo.storeVersion) {
                    text += '!';
                }
                row = [' ', depInfo.id, depInfo.name, versionNeeded, text].join('|');
                rows.push('|' + row + '|');
            }
        });
    });
    return rows;
};
const findPackageByName = (name) => {
    return allPackages.find((packageInfo) => packageInfo.name === name);
};
const getInfo = () => __awaiter(void 0, void 0, void 0, function* () {
    const packageJson = fs.readFileSync(`${root}/package.json`, 'utf8');
    const packageData = JSON.parse(packageJson);
    let { workspaces } = packageData;
    workspaces = workspaces.filter((workspace) => !workspace.includes('submodules/'));
    workspaces.push('./submodules/*');
    const packageJsonFiles = workspaces.map((workspace) => `${workspace}/package.json`);
    const packages = yield globby(packageJsonFiles, {
        cwd: root,
    });
    let index = 0;
    const packagesInfo = packages.map((packageJsonFile) => {
        const packageJson = fs.readFileSync(`${root}/${packageJsonFile}`, 'utf8');
        const packageData = JSON.parse(packageJson);
        const { name, version, dependencies: dependenciesRaw } = packageData;
        let packageType = 'package';
        if (packageJsonFile.includes('clients/')) {
            packageType = 'client';
        }
        else if (packageJsonFile.includes('app-')) {
            packageType = 'app';
        }
        else if (packageJsonFile.includes('store-')) {
            packageType = 'store';
        }
        else if (packageJsonFile.includes('template-')) {
            packageType = 'template';
        }
        else if (packageJsonFile.includes('submodules/')) {
            packageType = 'submodule';
        }
        const id = typeToId(packageType);
        return {
            index: index++,
            id,
            packageType,
            name,
            version,
            dependenciesRaw,
            dependencies: [],
        };
    });
    return packagesInfo;
});
const counters = {
    app: 1,
    client: 1,
    store: 1,
    package: 1,
    submodule: 1,
    template: 1,
};
const letters = {
    app: 'A',
    client: 'C',
    store: 'S',
    package: 'P',
    submodule: 'M',
    template: 'T',
};
const typeToId = (packageType) => {
    const counter = counters[packageType];
    counters[packageType] = counter + 1;
    return `${letters[packageType]}${counter}`;
};
const getMarkdownTableHeader = (fields) => {
    const header = '|' + fields.map((field) => field.name).join('|') + '|';
    const divider = '|' + fields.map((_field) => '---').join('|') + '|';
    return [header, divider];
};
const exec = (run, cwd) => {
    return new Promise((resolve, reject) => {
        let data = '';
        const args = run.split(' ');
        const command = args.shift();
        args.push('--color');
        const childProcess = child.spawn(command, args, {
            cwd,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        childProcess.stdout.on('data', function (str) {
            const line = str.toString('utf8');
            process.stdout.write(line);
            data += line;
        });
        childProcess.stderr.on('data', function (str) {
            const line = str.toString('utf8');
            process.stdout.write(line);
            data += line;
        });
        childProcess.once('exit', (code) => {
            if (code === 0) {
                resolve(data);
            }
            else {
                reject(data);
            }
        });
    });
};
run();
