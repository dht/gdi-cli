const fs = require('fs');
const path = require('path');
const { exec } = require('./exec');

const publish = async (cwd, shouldWriteLogs) => {
    const raw = await exec('npm', ['publish', '--access', 'public'], cwd);

    if (shouldWriteLogs) {
        const logsDir = path.resolve(`${cwd}/logs`);

        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir);
        }

        fs.writeFileSync(logsDir + '/publish.raw.log', raw);
    }

    return {
        raw,
    };
};

module.exports = {
    publish,
};
