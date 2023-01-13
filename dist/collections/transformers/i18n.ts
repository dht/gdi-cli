// shortcuts: translate
// desc: translate i18n files
import fs from 'fs';
import globby from 'globby';
import { parseArgv } from '../../utils/argv';
import chalk from 'chalk';
import prettier from 'prettier';
import { isEmpty } from 'shared-base';

const { Translate } = require('@google-cloud/translate').v2;

let index = 0;

const translate = new Translate();

const argv = parseArgv(process.argv);
const { cwd } = argv;
const sourceLanguage = argv._[0] || 'en';

const globalKeys = [
    'intlNumber',
    'intlNumberWithOptions',
    'intlCurrencyWithOptionsSimplified',
    'intlCurrencyWithOptions',
    'twoIntlCurrencyWithUniqueFormatOptions',
    'intlDateTime',
    'intlRelativeTime',
    'intlRelativeTimeWithOptions',
    'intlRelativeTimeWithOptionsExplicit',
];

const run = async () => {
    const files = globby.sync('i18n.*.ts', { cwd });

    const source = files.find((file) => file.includes(`.${sourceLanguage}.`));

    if (!source) {
        console.log(
            chalk.red(`could not find ${sourceLanguage} source for translation`)
        );
        return;
    }

    const contentSource = readTranslationFile(source);
    const contentSourceKeys = Object.keys(contentSource);

    const ignoreKeys = readJson('.translated', []);

    const keysToTranslate = contentSourceKeys
        .filter((key) => !ignoreKeys.includes(key))
        .filter((key) => !globalKeys.includes(key));

    log('source', chalk.magenta(source));

    log(
        'there are',
        chalk.magenta(contentSourceKeys.length),
        'keys in the source file',
        chalk.magenta(ignoreKeys.length),
        'will be ignored'
    );

    const filesFiltered = files.filter(
        (filename) => !filename.includes(`.${sourceLanguage}.`)
    );

    for (let filename of filesFiltered) {
        const filepath = `${cwd}/${filename}`;

        const match: any = filename.match(/(\.([a-z]+)\.)/);
        const languageKey = match[2];

        log(
            'translating',
            chalk.magenta(sourceLanguage),
            'to',
            chalk.cyan(languageKey)
        );

        const contentOriginal = readTranslationFile(filename);
        const contentTranslated = await translateContent(contentSource, 'en', languageKey, {keysToTranslate}); // prettier-ignore

        const contentCombined = {
            ...contentOriginal,
            ...contentTranslated,
        };

        const contentJson = JSON.stringify(contentCombined, null, 4);

        const contentFormatted = prettier.format(
            'export default ' + contentJson,
            {
                parser: 'babel-ts',
            }
        );

        fs.writeFileSync(filepath, contentFormatted);
    }

    writeJson('.translated', contentSourceKeys);

    log(chalk.green('OK'));
    log(chalk.cyan(index) + " total translation requests to Google's API");
};

const readTranslationFile = (filename: string) => {
    const filepath = `${cwd}/${filename}`;
    const contentText = fs.readFileSync(filepath).toString();

    const content = new Function(
        contentText.replace('export default', 'return')
    )();

    return content;
};

const readJson = (filename: string, defaultValue?: any) => {
    const filepath = `${cwd}/${filename}`;
    try {
        const contentText = fs.readFileSync(filepath).toString();

        return JSON.parse(contentText);
    } catch (err: any) {
        return defaultValue || {};
    }
};

const writeJson = (filename: string, data: any) => {
    const filepath = `${cwd}/${filename}`;
    const contentText = JSON.stringify(data, null, 4);

    fs.writeFileSync(filepath, contentText);
};

type Options = {
    keysToTranslate: string[];
};

const translateContent = async (
    content: any,
    fromLanguage: string,
    toLanguage: string,
    options: Options
) => {
    const { keysToTranslate: keys } = options;
    const output: any = {};

    const promises = keys.map((key) => {
        return translateSentence(content[key], fromLanguage, toLanguage);
    });

    const responses = await Promise.all(promises);

    keys.forEach((key, index) => {
        output[key] = responses[index];
    });

    return output;
};

const translateSentence = (
    content: string,
    fromLanguage: string,
    toLanguage: string
) => {
    return translateText(content, fromLanguage, toLanguage);
};

async function translateText(
    input: string,
    fromLanguage: string,
    toLanguage: string
) {
    index++;
    let [translations] = await translate.translate(input, toLanguage);
    translations = Array.isArray(translations) ? translations : [translations];
    return translations.join(' ');
}

const log = (...params: string[]) => {
    const message = params.join(' ');
    console.log(message);
};

run();
