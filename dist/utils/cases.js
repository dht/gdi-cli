"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
exports.default = {
    camelCase: (text) => lodash_1.default.camelCase(text),
    kebabCase: (text) => lodash_1.default.kebabCase(text),
    lowerCase: (text) => lodash_1.default.lowerCase(text),
    upperCase: (text) => lodash_1.default.upperCase(text),
    lowerFirst: (text) => lodash_1.default.lowerFirst(text),
    snakeCase: (text) => lodash_1.default.snakeCase(text),
    upperFirst: (text) => lodash_1.default.upperFirst(text), // fred => Fred
};
