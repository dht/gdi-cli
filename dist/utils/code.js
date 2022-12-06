"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCode = void 0;
const prettier_1 = require("prettier");
const formatCode = (code) => {
    return (0, prettier_1.format)(code, {
        parser: 'babel-ts',
        trailingComma: 'es5',
        tabWidth: 4,
        semi: true,
        singleQuote: true,
        jsxSingleQuote: true,
        endOfLine: 'auto',
        useTabs: false,
    });
};
exports.formatCode = formatCode;
