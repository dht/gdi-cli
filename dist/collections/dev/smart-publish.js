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
// shortcuts: publishAll
// desc: publishes all packages
const fs = require('fs');
const path = require('path');
const yml = require('yaml');
const { publish } = require('../../utils-js/publish');
const { parseArgv, getPackagesByPath, findPackageFuzzy, setPackageVersion, setPackageDependenciesVersion, } = require('../../utils-js/mono');
const argv = parseArgv(process.argv);
const LOGS_PATH = './.logs';
const rootLogsPath = path.resolve(LOGS_PATH);
const [version] = argv._;
if (!version) {
    console.log('no version provided');
    process.exit(1);
}
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs.existsSync(rootLogsPath)) {
        fs.mkdirSync(rootLogsPath);
    }
    const allPackages = yield getPackagesByPath('.', []);
    yield gradualPublish(allPackages);
});
const gradualPublish = (allPackages) => __awaiter(void 0, void 0, void 0, function* () {
    const configPath = path.resolve('.build-order.yml');
    const config = fs.readFileSync(configPath, 'utf8');
    const buildOrder = yml.parse(config);
    for (const tier of buildOrder) {
        const { id, packages = [] } = tier;
        console.time(`publishing tier ${id}`);
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
        const packagesNames = allPackages.map((p) => p.name);
        const promises = packagesCwd.map((cwd) => {
            setPackageVersion(cwd, version);
            setPackageDependenciesVersion(cwd, packagesNames, version);
            return publish(cwd, true);
        });
        yield Promise.all(promises);
        console.timeEnd(`publishing tier ${id}`);
    }
});
const writeLog = (filename, data) => {
    fs.writeFileSync(`${rootLogsPath}/${filename}`, JSON.stringify(data, null, 4));
};
run();
