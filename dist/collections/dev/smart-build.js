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
// shortcuts: buildAll
// desc: builds all packages
const fs = require('fs');
const path = require('path');
const yml = require('yaml');
const { build } = require('../../utils-js/build');
const { getPackagesByPath, findPackageFuzzy } = require('../../utils-js/mono');
const LOGS_PATH = './.logs';
const rootLogsPath = path.resolve(LOGS_PATH);
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs.existsSync(rootLogsPath)) {
        fs.mkdirSync(rootLogsPath);
    }
    const allPackages = yield getPackagesByPath('.', []);
    writeLog('allPackages.json', allPackages);
    yield buildAll(allPackages);
    const allStats = gatherBuildResults(allPackages);
    writeLog('build.bundleSizes.json', allStats.bundleSizes);
    writeLog('build.errors.json', allStats.errors);
    const currentVersions = gatherCurrentVersions(allPackages);
    writeLog('currentVersions.json', currentVersions);
});
const gatherBuildResults = (allPackages) => {
    const output = {
        bundleSizes: {},
        errors: {},
    };
    allPackages.forEach((p) => {
        const { name, cwd } = p;
        const logsDir = path.resolve(`${cwd}/logs`);
        const statsPath = logsDir + '/build.stats.log';
        if (!fs.existsSync(statsPath)) {
            console.log('could not find stats for', name);
            return;
        }
        const stats = fs.readFileSync(statsPath, 'utf8');
        const statsJson = JSON.parse(stats);
        output.bundleSizes[name] = statsJson.bundleSizes.sizeKb;
        output.errors[name] = statsJson.errorCount;
    });
    return output;
};
const gatherCurrentVersions = (allPackages) => {
    const output = {};
    allPackages.forEach((p) => {
        const { name, version } = p;
        output[name] = version;
    });
    return output;
};
const buildAll = (allPackages) => __awaiter(void 0, void 0, void 0, function* () {
    const configPath = path.resolve('.build-order.yml');
    const config = fs.readFileSync(configPath, 'utf8');
    const buildOrder = yml.parse(config);
    for (const tier of buildOrder) {
        const { id, packages = [] } = tier;
        console.time(`building tier ${id}`);
        const packagesCwd = packages
            .map((id) => {
            const p = findPackageFuzzy(allPackages, id);
            if (!p) {
                console.log('could not find package', id);
                return null;
            }
            const { cwd } = p;
            return cwd;
        })
            .filter((i) => i !== null);
        const promises = packagesCwd.map((cwd) => {
            return build(cwd, true);
        });
        yield Promise.all(promises);
        console.timeEnd(`building tier ${id}`);
    }
});
const writeLog = (filename, data) => {
    fs.writeFileSync(`${rootLogsPath}/${filename}`, JSON.stringify(data, null, 4));
};
run();
