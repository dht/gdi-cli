// shortcuts: depSync
// desc: syncs dependencies between packages
const fs = require('fs');
const path = require('path');
const kleur = require('kleur');
const { getPackagesByPath } = require('../../utils/mono');

const SILENT = process.argv.some((arg) => arg.includes('"silent":true'));

const dependenciesMap = {};

const run = async () => {
    const cwd = path.resolve('.');

    const packages = getPackagesByPath(cwd, [
        'submodules/shared-base/package.json',
    ]);

    // build maps
    packages.forEach((p) => {
        const { name, dependenciesGdi } = p;

        Object.keys(dependenciesGdi).forEach((key) => {
            dependenciesMap[key] = dependenciesMap[key] || [];
            dependenciesMap[key].push({
                key: name,
                version: dependenciesGdi[key],
            });
        });
    });

    // fix versions

    let changesCount = 0,
        changesPackages = {};

    packages.forEach((p) => {
        const { name, version } = p;
        const dependents = dependenciesMap[name] || [];

        log(kleur.yellow(header(name)));
        log(`version: ${kleur.magenta(version)}`);
        log(`dependents count: ${kleur.magenta(dependents.length)}\n`);

        for (let dependent of dependents) {
            print(` - updating ${kleur.yellow(dependent.key)}...`);

            if (dependent.version === version) {
                log(kleur.gray('no need'));
                continue;
            }

            const dependentPackage = packages.find(
                (item) => item.name === dependent.key
            );

            if (!dependentPackage) {
                log(kleur.red('missing in dependenciesMap'));
                continue;
            }

            const { content, fullPath } = dependentPackage;
            changesPackages[dependentPackage.name] =
                changesPackages[dependentPackage.name] || 0;
            changesPackages[dependentPackage.name]++;
            changesCount++;

            log(kleur.green(`Changed from ${dependent.version}`));

            content['dependencies'][name] = '^' + version;

            delete content[name];

            fs.writeFileSync(fullPath, JSON.stringify(content, null, 4));
        }
    });

    log(kleur.cyan(header('Summary')));

    log(`${kleur.magenta(changesCount)} changes`);
    Object.keys(changesPackages).forEach((name) => {
        log(` - ${kleur.yellow(name)} (${changesPackages[name]} changes)`);
    });
    log('\n');
};

const header = (text) => {
    return [
        '\n',
        '='.repeat(Math.floor((35 - text.length) / 2)),
        ' ',
        text,
        ' ',
        '='.repeat(Math.ceil((35 - text.length) / 2)),
    ].join('');
};

const print = (txt) => {
    if (SILENT) {
        return;
    }

    process.stdout.write(txt);
};

const log = (...args) => {
    if (SILENT) {
        return;
    }

    console.log.apply(this, args);
};

run();
