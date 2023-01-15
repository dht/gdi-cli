// shortcuts: sync-clients
// desc: sync gdi-admin and gdi-site to all instances
const fs = require('fs');
const path = require('path');
const { exec } = require('../../utils-js/exec');

console.log('copying to');

const copyTo = (root, source) => {
    const sourceFull = path.resolve(source);
    const destination = path.resolve(root, source.replace('clients/', ''));

    exec('rsync', ['-rhv', sourceFull + '/src/', destination + '/src/'], root, {
        stdOutMode: true,
    });

    exec(
        'rsync',
        ['-rhv', sourceFull + '/package.json', destination + '/package.json'],
        root,
        {
            stdOutMode: true,
        }
    );

    const scriptsPathPackageJson = sourceFull + '/scripts/package.json';

    if (fs.existsSync(scriptsPathPackageJson)) {
        exec(
            'rsync',
            [
                '-rhv',
                scriptsPathPackageJson,
                destination + '/scripts/package.json',
            ],
            root,
            {
                stdOutMode: true,
            }
        );
    }
};

const run = async () => {
    const root = '../instances';
    copyTo(`${root}/demo`, 'clients/gdi-admin');
    copyTo(`${root}/demo`, 'clients/gdi-site');
    copyTo(`${root}/freelancers`, 'clients/gdi-admin');
    copyTo(`${root}/freelancers`, 'clients/gdi-site');
    copyTo(`${root}/guidance`, 'clients/gdi-admin');
    copyTo(`${root}/guidance`, 'clients/gdi-site');
    copyTo(`${root}/level-up`, 'clients/gdi-admin');
    copyTo(`${root}/level-up`, 'clients/gdi-site');
    copyTo(`${root}/life`, 'clients/gdi-admin');
    copyTo(`${root}/life`, 'clients/gdi-site');
    copyTo(`${root}/use-gdi`, 'clients/gdi-admin');
    copyTo(`${root}/use-gdi`, 'clients/gdi-site');
};

run();
