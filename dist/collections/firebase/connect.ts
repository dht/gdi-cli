// shortcuts: connect
// desc: connect project to Firebase

import chalk from 'chalk';
import { writeEnvVite } from '../../utils/env';
import { parseArgv } from '../../utils/argv';
import * as fs from 'fs-extra';
import * as path from 'path';

const cli = require('../../cli/cli');

const argv = parseArgv(process.argv);
const { cwd } = argv;

// ================================================

const run = async () => {
    const webappJsonPath = path.resolve(cwd, 'webapp.json');

    if (!fs.existsSync(webappJsonPath)) {
        console.log(
            chalk.red(`could not find "webapp.json" in ${webappJsonPath}`)
        );
        return;
    }

    const firebaseConfig = fs.readJsonSync(webappJsonPath);
    const { projectId } = firebaseConfig;

    writeEnvVite(`${cwd}/gdi-admin`, firebaseConfig, {
        menu: ['doing', 'site', 'marketing', 'factory', 'shop', 'extra'].join(
            ','
        ),
    });

    writeEnvVite(`${cwd}/gdi-site`, firebaseConfig);

    const result = await cli.run(
        'firebase',
        ['use', projectId],
        `${cwd}/gdi-admin`
    );

    console.log(result);
};

run();
