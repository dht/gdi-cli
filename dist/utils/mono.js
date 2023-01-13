"use strict";
const globby = require('globby');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const getPackages = (cwd, patterns, extraPatterns) => {
    patterns.push(...extraPatterns);
    return globby
        .sync(patterns, {
        cwd,
    })
        .map((packagePath) => {
        const fullPath = path.resolve(cwd, packagePath);
        const fullDir = fullPath.replace('/package.json', '');
        const contentRaw = fs.readFileSync(fullPath).toString();
        const content = JSON.parse(contentRaw);
        const { name, version, dependencies } = content;
        const dependenciesGdi = _.pickBy(dependencies, (value, key) => key.match(/^@gdi/));
        return {
            name,
            version,
            dependencies,
            dependenciesGdi,
            fullPath: fullPath,
            cwd: fullDir,
            content,
        };
    });
};
const getPackagesByPath = (cwd, extraPatterns = []) => {
    const packageJson = path.resolve(cwd, 'package.json');
    const contentRaw = fs.readFileSync(packageJson).toString();
    const content = JSON.parse(contentRaw);
    const patterns = content.workspaces.map((i) => i + '/package.json');
    return getPackages(cwd, patterns, extraPatterns);
};
const findPackageFuzzy = (allPackages, name) => {
    const possibleNames = [name, `@gdi/${name}`, `@gdi/gdi${name}`];
    return allPackages.find((packageInfo) => {
        const { name: packageName } = packageInfo;
        return possibleNames.includes(packageName);
    });
};
const parseArgv = (argv) => {
    const lastArg = [...argv].pop();
    try {
        return JSON.parse(lastArg || '');
    }
    catch (e) {
        return null;
    }
};
const setPackageVersion = (cwd, version) => {
    const packageJson = path.resolve(cwd, 'package.json');
    const contentRaw = fs.readFileSync(packageJson).toString();
    const content = JSON.parse(contentRaw);
    content.version = version;
    fs.writeFileSync(packageJson, JSON.stringify(content, null, 4));
};
module.exports = {
    parseArgv,
    getPackages,
    getPackagesByPath,
    findPackageFuzzy,
    setPackageVersion,
};
