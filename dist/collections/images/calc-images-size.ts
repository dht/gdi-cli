// shortcuts: img-size
// desc: calculate image sizes
import fs from 'fs';
import globby from 'globby';
import path from 'path';
import sharp from 'sharp';
import { parseArgv } from '../../utils/argv';

const argv = parseArgv(process.argv);
const { cwd } = argv;

let cwdRoot = cwd;

while (fs.existsSync(cwdRoot + '/package.json') === false) {
    cwdRoot = path.resolve(cwdRoot + '/../');
}

const publicRoot = path.resolve(cwdRoot + '/public');

const run = async () => {
    const files = globby.sync('*.data.ts', { cwd });

    for (let file of files) {
        const data = readDataFile(`${cwd}/${file}`);

        const dataWithImageSizes = [];

        for (let item of data) {
            const { imageUrl } = item;
            const imagePath = path.resolve(publicRoot + imageUrl);
            const image = await sharp(imagePath);
            const metadata = await image.metadata();
            const { width = 0, height = 1 } = metadata;

            dataWithImageSizes.push({
                ...item,
                imageWidth: width,
                imageHeight: height,
                ratio: width / height,
            });
        }

        fs.writeFileSync(
            `${cwd}/${file}`,
            `export const items = ${JSON.stringify(
                dataWithImageSizes,
                null,
                4
            )}`
        );
    }
};

const readDataFile = (filepath: string) => {
    const raw = fs.readFileSync(filepath, 'utf-8');
    const code = raw.replace(/export const [a-zA-Z]+ =/, '');

    return new Function(`return ${code}`)();
};

run();
