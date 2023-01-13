"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// shortcuts: translate
// desc: translate i18n files
const fs_1 = __importDefault(require("fs"));
const globby_1 = __importDefault(require("globby"));
const argv_1 = require("../../utils/argv");
const chalk_1 = __importDefault(require("chalk"));
const prettier_1 = __importDefault(require("prettier"));
const { Translate } = require('@google-cloud/translate').v2;
let index = 0;
const translate = new Translate();
const argv = (0, argv_1.parseArgv)(process.argv);
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
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const files = globby_1.default.sync('i18n.*.ts', { cwd });
    const source = files.find((file) => file.includes(`.${sourceLanguage}.`));
    if (!source) {
        console.log(chalk_1.default.red(`could not find ${sourceLanguage} source for translation`));
        return;
    }
    const contentSource = readTranslationFile(source);
    const contentSourceKeys = Object.keys(contentSource);
    const ignoreKeys = readJson('.translated', []);
    const keysToTranslate = contentSourceKeys
        .filter((key) => !ignoreKeys.includes(key))
        .filter((key) => !globalKeys.includes(key));
    log('source', chalk_1.default.magenta(source));
    log('there are', chalk_1.default.magenta(contentSourceKeys.length), 'keys in the source file', chalk_1.default.magenta(ignoreKeys.length), 'will be ignored');
    const filesFiltered = files.filter((filename) => !filename.includes(`.${sourceLanguage}.`));
    for (let filename of filesFiltered) {
        const filepath = `${cwd}/${filename}`;
        const match = filename.match(/(\.([a-z]+)\.)/);
        const languageKey = match[2];
        log('translating', chalk_1.default.magenta(sourceLanguage), 'to', chalk_1.default.cyan(languageKey));
        const contentOriginal = readTranslationFile(filename);
        const contentTranslated = yield translateContent(contentSource, 'en', languageKey, { keysToTranslate }); // prettier-ignore
        const contentCombined = Object.assign(Object.assign({}, contentOriginal), contentTranslated);
        const contentJson = JSON.stringify(contentCombined, null, 4);
        const contentFormatted = prettier_1.default.format('export default ' + contentJson, {
            parser: 'babel-ts',
        });
        fs_1.default.writeFileSync(filepath, contentFormatted);
    }
    writeJson('.translated', contentSourceKeys);
    log(chalk_1.default.green('OK'));
    log(chalk_1.default.cyan(index) + " total translation requests to Google's API");
});
const readTranslationFile = (filename) => {
    const filepath = `${cwd}/${filename}`;
    const contentText = fs_1.default.readFileSync(filepath).toString();
    const content = new Function(contentText.replace('export default', 'return'))();
    return content;
};
const readJson = (filename, defaultValue) => {
    const filepath = `${cwd}/${filename}`;
    try {
        const contentText = fs_1.default.readFileSync(filepath).toString();
        return JSON.parse(contentText);
    }
    catch (err) {
        return defaultValue || {};
    }
};
const writeJson = (filename, data) => {
    const filepath = `${cwd}/${filename}`;
    const contentText = JSON.stringify(data, null, 4);
    fs_1.default.writeFileSync(filepath, contentText);
};
const translateContent = (content, fromLanguage, toLanguage, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { keysToTranslate: keys } = options;
    const output = {};
    const promises = keys.map((key) => {
        return translateSentence(content[key], fromLanguage, toLanguage);
    });
    const responses = yield Promise.all(promises);
    keys.forEach((key, index) => {
        output[key] = responses[index];
    });
    return output;
});
const translateSentence = (content, fromLanguage, toLanguage) => {
    return translateText(content, fromLanguage, toLanguage);
};
function translateText(input, fromLanguage, toLanguage) {
    return __awaiter(this, void 0, void 0, function* () {
        index++;
        let [translations] = yield translate.translate(input, toLanguage);
        translations = Array.isArray(translations) ? translations : [translations];
        return translations.join(' ');
    });
}
const log = (...params) => {
    const message = params.join(' ');
    console.log(message);
};
run();
