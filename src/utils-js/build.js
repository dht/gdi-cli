const fs = require('fs');
const path = require('path');
const { exec } = require('./exec');
const bytes = require('bytes');

const build = async (cwd, shouldWriteLogs) => {
    const raw = await exec('npm', ['run', 'build', '--no-color'], cwd);

    const regex = /([a-z/\.]+)\((\d+,\d+)\): error TS\d+: ([^\n]+)/gi;

    const errors = findMatches(regex, raw).map((match) => {
        const [, file, line, message] = match;

        const [lineNumber, columnNumber] = line
            .split(',')
            .map((n) => parseInt(n));

        return {
            file,
            lineNumber,
            columnNumber,
            message,
        };
    });

    const errorsByFile = errors.reduce((acc, error) => {
        const { file, lineNumber } = error;

        if (!acc[file]) {
            acc[file] = {};
        }

        acc[file][lineNumber] = error.message;

        return acc;
    }, {});

    const duration = parseDuration(raw);
    const bundleSizes = parseBundleSizes(raw);

    const errorCount = errors.length;

    const stats = {
        durationMs: duration,
        errorCount,
        bundleSizes,
        isSuccess: errorCount === 0,
    };

    if (shouldWriteLogs) {
        const logsDir = path.resolve(`${cwd}/logs`);

        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir);
        }

        fs.writeFileSync(logsDir + '/build.raw.log', raw);

        fs.writeFileSync(
            logsDir + '/build.stats.log',
            JSON.stringify(stats, null, 4)
        );

        fs.writeFileSync(
            logsDir + '/build.errors.log',
            JSON.stringify(errorsByFile, null, 4)
        );
    }

    return {
        raw,
        stats,
        errors,
        errorsByFile,
    };
};

const parseDuration = (raw) => {
    let duration = 0;

    try {
        const durationRegex =
            /\[vite:dts\] Declaration files built in (\d+)ms\./g;
        const durationMatch = findMatches(durationRegex, raw)[0];
        duration = parseInt(durationMatch[1]);
    } catch (_err) {}
};

const parseBundleSizes = (raw) => {
    const output = {
        size: 0,
        sizeKb: 0,
        esSize: 0,
        esSizeGzip: 0,
        esMapSize: 0,
        umdSize: 0,
        umdSizeGzip: 0,
        umdMapSize: 0,
    };

    const regexEs =
        /^dist\/[a-z-]+\.es\.js\s+([0-9,\.]+) ([a-z]+) \/ gzip: *([0-9,\.]+) ([a-z]+)/gim;
    const regexEsMap = /^dist\/[a-z-]+\.es\.js\.map\s+([0-9,\.]+) ([a-z]+)/gim;
    const regexUmd =
        /^dist\/[a-z-]+\.umd\.js\s+([0-9,\.]+) ([a-z]+) \/ gzip: *([0-9,\.]+) ([a-z]+)/gim;
    const regexUmdMap =
        /^dist\/[a-z-]+\.umd\.js\.map\s+([0-9,\.]+) ([a-z]+)/gim;

    const matchesEs = findMatches(regexEs, raw);
    const matchesEsMap = findMatches(regexEsMap, raw);
    const matchesUmd = findMatches(regexUmd, raw);
    const matchesUmdMap = findMatches(regexUmdMap, raw);

    if (matchesEs.length > 0) {
        const [, size, sizeUnit, gzipSize, gzipSizeUnit] = matchesEs[0];
        output.esSize = kibToBytes(
            parseFloat(size.replace(/,/g, '')) + sizeUnit
        );
        output.esSizeGzip = kibToBytes(
            parseFloat(gzipSize.replace(/,/g, '')) + gzipSizeUnit
        );
    }

    if (matchesEsMap.length > 0) {
        const [, size, sizeUnit] = matchesEsMap[0];
        output.esMapSize = kibToBytes(
            parseFloat(size.replace(/,/g, '')) + sizeUnit
        );
    }

    if (matchesUmd.length > 0) {
        const [, size, sizeUnit, gzipSize, gzipSizeUnit] = matchesUmd[0];
        output.umdSize = kibToBytes(
            parseFloat(size.replace(/,/g, '')) + sizeUnit
        );
        output.umdSizeGzip = kibToBytes(
            parseFloat(gzipSize.replace(/,/g, '')) + gzipSizeUnit
        );
    }

    if (matchesUmdMap.length > 0) {
        const [, size, sizeUnit] = matchesUmdMap[0];
        output.umdMapSize = kibToBytes(
            parseFloat(size.replace(/,/g, '')) + sizeUnit
        );
    }

    output.size = output.umdSizeGzip;
    output.sizeKb = bytes(output.size, { unitSeparator: '' });

    return output;
};

const kibToBytes = (valueAndUnit) => {
    return bytes(valueAndUnit.replace('KiB', 'KB'));
};

const findMatches = (regex, string) => {
    const matches = [];

    let match;

    while ((match = regex.exec(string))) {
        matches.push(match);
    }

    return matches;
};

module.exports = {
    build,
};
