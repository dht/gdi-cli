// shortcuts: bootstrap
// desc: bootstrap gdi instance

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
    console.log('bootstrapping');
};

run();
