"use strict";
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const globby = require('globby');
const { collectionsPath, indexJsonPath } = require('./paths');
const { getCommands } = require('./commands');
const { getConfig } = require('./config');
const { SCRIPT_TYPES } = require('./types');
const camelCase = require('lodash/camelCase');
const getCommentLines = (file) => {
    const content = fs.readFileSync(file).toString();
    const lines = content
        .split('\n')
        .filter((line) => { var _a; return (_a = line.match(/^\/\//)) !== null && _a !== void 0 ? _a : line.match(/^#/); });
    return lines.splice(0, 2).join('\n');
};
const getShortcuts = (options) => {
    var _a;
    const { onlyFirstAlias = false } = options;
    const commands = (_a = getCommands()) !== null && _a !== void 0 ? _a : {};
    return Object.values(commands).reduce((output, command) => {
        let { shortcuts } = command;
        if (onlyFirstAlias) {
            shortcuts = shortcuts.splice(0, 1);
        }
        shortcuts.forEach((shortcut) => output.push({
            name: shortcut,
            description: command.description,
        }));
        return output;
    }, []);
};
const parseShortcutsFromFile = (file) => {
    const regex = /^[#\/]+ shortcuts: ?([a-zA-Z ,-]+)/gm;
    let output;
    const content = getCommentLines(file);
    const match = regex.exec(content);
    if (match) {
        output = match[1]
            .split(',')
            .map((i) => i.trim())
            .filter((i) => i);
    }
    return output !== null && output !== void 0 ? output : [];
};
const getDescription = (file) => {
    const regex = /^[#\/]+ desc: ?([a-zA-Z ,-0-9:;'".]+)/gm;
    let output;
    const content = getCommentLines(file);
    const match = regex.exec(content);
    if (match) {
        output = match[1];
    }
    return output !== null && output !== void 0 ? output : '';
};
const rebuild = () => {
    console.log(chalk.green('rebuilding...'));
    const config = getConfig();
    const enabledCollections = Object.keys(config.enabled).filter((collection) => config.enabled[collection]);
    const files = globby
        .sync([collectionsPath + '/**/*.js', collectionsPath + '/**/*.sh'], {
        ignore: [
            collectionsPath + '/config.json',
            collectionsPath + '/index.json',
        ],
    })
        .filter((file) => {
        return !fs.lstatSync(file).isDirectory();
    });
    let content = files.reduce((output, file) => {
        const fileInfo = path.parse(file);
        const shortcuts = parseShortcutsFromFile(file);
        const description = getDescription(file);
        const { name, base, ext } = fileInfo;
        const commandId = camelCase(name);
        const collection = file
            .replace(collectionsPath, '')
            .replace(base, '')
            .replace(/\//g, '');
        if (enabledCollections.includes(collection)) {
            let type;
            switch (ext) {
                case '.sh':
                    type = SCRIPT_TYPES.BASH;
                    break;
                case '.ts':
                    type = SCRIPT_TYPES.TS_NODE;
                    break;
                case '.js':
                    type = SCRIPT_TYPES.NODE;
                    break;
                default:
            }
            output[commandId] = {
                type,
                file: name + ext,
                collection,
                shortcuts,
                description,
            };
        }
        return output;
    }, {});
    console.log(`${chalk.green(Object.keys(content).length)} commands found in path.`);
    const output = JSON.stringify(content, null, 4);
    process.stdout.write(`creating ${chalk.magenta(indexJsonPath)}...`);
    fs.writeFileSync(indexJsonPath, output);
};
module.exports = {
    getShortcuts,
    rebuild,
};
