"use strict";
const child = require('child_process');
const execSync = (command, args = [], cwd) => {
    return new Promise((resolve, reject) => {
        const spawn = child.spawnSync(command, args, {
            cwd,
        });
        if (spawn.stdout) {
            const outputText = spawn.stdout.toString().trim();
            resolve(outputText);
        }
        else if (spawn.error) {
            reject(spawn.error);
        }
    });
};
const exec = (command, args = [], cwd) => {
    return new Promise((resolve, reject) => {
        let data = '';
        const spawn = child.spawn(command, args, {
            cwd,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        spawn.stdout.on('data', function (str) {
            const line = str.toString('utf8');
            process.stdout.write(line);
            data += line;
        });
        spawn.stderr.on('data', function (str) {
            const line = str.toString('utf8');
            process.stdout.write(line);
            data += line;
        });
        spawn.once('exit', (code) => {
            if (code === 0) {
                resolve(data);
            }
            else {
                reject(data);
            }
        });
    });
};
module.exports = {
    exec,
    execSync,
};
