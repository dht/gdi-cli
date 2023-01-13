// shortcuts: img, raw, png
// desc: watches and compress images
import { parseArgv } from '../../utils/argv';
import { watch } from 'chokidar';
import chalk from 'chalk';
import { homedir } from 'os';
import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import bytes from 'bytes';
import { printTable } from '../../utils/console';

const argv = parseArgv(process.argv);
const { cwd } = argv;

const listen = async () => {
    const watcher = watch(cwd, {
        ignoreInitial: true,
    });

    watcher.addListener('add', async (path) => {
        console.log(`File ${prettyPath(path)} has been added`);
        const info = await compressImage(path);
        printSummary(info);
    });

    watcher.addListener('change', async (path) => {
        console.log(`File ${prettyPath(path)} has been changed`);
        const info: any = await compressImage(path);
        printSummary(info);
    });

    console.log(`Watching ${chalk.cyan(prettyPath(cwd))} for changes...`);
};

const printSummary = (info: any) => {
    printTable(
        [
            [chalk.yellow('filename'), info.fileName],
            [chalk.yellow('outSize'), chalk.magenta(info.sizeText)],
            [chalk.yellow('percent'), chalk.cyan(info.percent + '%')],
            [chalk.yellow('inSize'), info.sizeBeforeText],
        ],
        [15, 40]
    );
};

const compressImage = (inputPath: string) => {
    return new Promise((resolve, reject) => {
        const stats = fs.statSync(inputPath);
        const fileInfo = path.parse(inputPath);

        const outputPath = path.resolve(fileInfo.dir + '/../' + fileInfo.base);

        sharp(inputPath)
            .png({
                compressionLevel: 8,
                palette: true,
                colors: 256,
                force: true,
            })

            .toFile(outputPath, (err: any, info: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({
                    fileName: fileInfo.base,
                    sizeBeforeText: bytes(stats.size),
                    sizeBefore: stats.size,
                    ...info,
                    sizeText: bytes(info.size),
                    percent: Math.round((info.size / stats.size) * 100),
                });
            });
    });
};

const prettyPath = (path: string) => {
    return path.replace(homedir(), '~');
};

listen();
