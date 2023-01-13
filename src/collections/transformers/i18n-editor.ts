// shortcuts: edit-lan
// desc: translate i18n files
import fs from 'fs';
import globby from 'globby';
import { parseArgv } from '../../utils/argv';
import chalk from 'chalk';
import prettier from 'prettier';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';

const argv = parseArgv(process.argv);
const { cwd } = argv;
const sourceLanguage = argv._[0] || 'en';

const run = async () => {
    const app = express();
    const port = 3300;

    app.use(bodyParser.json());

    app.get('/', (req, res) => {
        res.sendFile(path.resolve('./src/templates/html/i18n-editor.html'));
    });

    app.get('/:language', (req, res) => {
        const { language } = req.params;

        const json = readLanguage(`i18n.${language}.ts`);
        res.json(json);
    });

    app.patch('/:language/:key', (req, res) => {
        const { language, key } = req.params;
        const { value } = req.body;

        if (!value || !language || !key) {
            res.json({ success: false });
            return;
        }

        try {
            const filename = `i18n.${language}.ts`;
            const json = readLanguage(filename);

            const newJson = {
                ...json,
                [key]: value,
            };

            writeLanguage(filename, newJson);

            res.json({
                success: true,
            });
        } catch (err: any) {
            res.json({ success: false });
            return;
        }
    });

    app.listen(port, () => {
        console.log(
            `I18n editor http://localhost:${port}?iw=${sourceLanguage}`
        );
    });
};

const readLanguage = (filename: string) => {
    const filepath = `${cwd}/${filename}`;
    try {
        const contentText = fs
            .readFileSync(filepath)
            .toString()
            .replace('export default', 'return');
        const value = new Function(contentText)();
        return value;
    } catch (err: any) {
        return {};
    }
};

const writeLanguage = (filename: string, data: any) => {
    const filepath = `${cwd}/${filename}`;
    const contentText = JSON.stringify(data, null, 4);

    const contentCode = 'export default ' + contentText;
    const contentPretty = prettier.format(contentCode, {
        parser: 'babel-ts',
        trailingComma: 'es5',
        tabWidth: 4,
        semi: true,
        singleQuote: true,
    });

    fs.writeFileSync(filepath, contentPretty);
};

run();
