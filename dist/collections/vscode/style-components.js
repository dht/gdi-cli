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
// shortcuts: st
// desc: add a style component tag
const fs_extra_1 = __importDefault(require("fs-extra"));
const argv_1 = require("../../utils/argv");
const lodash_1 = require("lodash");
const argv = (0, argv_1.parseArgv)(process.argv);
const { cwd } = argv;
const projectId = argv._[0];
const componentId = (0, lodash_1.upperFirst)(argv._[1]);
const tagNames = argv._[2].split(',').map((i) => i.trim());
const layoutPath = `${cwd}/.layout.json`;
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_extra_1.default.existsSync(layoutPath)) {
        console.log(`could not find .layout.json`);
        return;
    }
    const layout = fs_extra_1.default.readJsonSync(`${cwd}/.layout.json`);
    const projectConfig = layout[projectId];
    if (!projectConfig) {
        console.log(`could not find configuration in .layout.json for ${projectId}`);
        return;
    }
    const { path } = projectConfig;
    const componentPath = `${cwd}/${path}/${componentId}/${componentId}.tsx`;
    const componentStylePath = `${cwd}/${path}/${componentId}/${componentId}.style.tsx`;
    if (!fs_extra_1.default.existsSync(componentPath)) {
        console.log(`could not find component in ${componentPath}`);
        return;
    }
    if (!fs_extra_1.default.existsSync(componentStylePath)) {
        console.log(`could not find component style in ${componentStylePath}`);
        return;
    }
    let content = fs_extra_1.default.readFileSync(componentPath).toString();
    let contentStyle = fs_extra_1.default.readFileSync(componentStylePath).toString();
    let match;
    const regexImport = new RegExp(`import {([^}]+)} from '\.\/${componentId}\.style';`, 'gm');
    match = regexImport.exec(content);
    if (!match) {
        console.log('cannot find style imports');
        return;
    }
    const tagsImport = tagNames.join(', ');
    content = content.replace(match[1], `${match[1]}, ${tagsImport} `);
    const regexContainer = /\<Container[^>]*>/m;
    match = regexContainer.exec(content);
    if (!match) {
        console.log('cannot find container tag in component');
        return;
    }
    const tagsContent = tagNames
        .map((i) => `<${i}>${i}</${i}>`)
        .join('\n');
    content = content.replace(match[0], `${match[0]}\n${tagsContent}`);
    const tagsStyle = tagNames
        .map((i) => `export const ${i} = styled.div\`\`;`)
        .join('\n\n');
    contentStyle += `\n\n${tagsStyle}`;
    fs_extra_1.default.writeFileSync(componentPath, content);
    fs_extra_1.default.writeFileSync(componentStylePath, contentStyle);
});
run();
