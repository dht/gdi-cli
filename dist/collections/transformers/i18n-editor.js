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
// shortcuts: edit-lan
// desc: translate i18n files
const fs_1 = __importDefault(require("fs"));
const argv_1 = require("../../utils/argv");
const prettier_1 = __importDefault(require("prettier"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
const sourceLanguage = argv._[0] || 'en';
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    const port = 3300;
    app.use(body_parser_1.default.json());
    app.get('/', (req, res) => {
        res.sendFile(path_1.default.resolve('./src/templates/html/i18n-editor.html'));
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
            const newJson = Object.assign(Object.assign({}, json), { [key]: value });
            writeLanguage(filename, newJson);
            res.json({
                success: true,
            });
        }
        catch (err) {
            res.json({ success: false });
            return;
        }
    });
    app.listen(port, () => {
        console.log(`I18n editor http://localhost:${port}?iw=${sourceLanguage}`);
    });
});
const readLanguage = (filename) => {
    const filepath = `${cwd}/${filename}`;
    try {
        const contentText = fs_1.default
            .readFileSync(filepath)
            .toString()
            .replace('export default', 'return');
        const value = new Function(contentText)();
        return value;
    }
    catch (err) {
        return {};
    }
};
const writeLanguage = (filename, data) => {
    const filepath = `${cwd}/${filename}`;
    const contentText = JSON.stringify(data, null, 4);
    const contentCode = 'export default ' + contentText;
    const contentPretty = prettier_1.default.format(contentCode, {
        parser: 'babel-ts',
        trailingComma: 'es5',
        tabWidth: 4,
        semi: true,
        singleQuote: true,
    });
    fs_1.default.writeFileSync(filepath, contentPretty);
};
run();
