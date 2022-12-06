"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjects = void 0;
const globby_1 = __importDefault(require("globby"));
const path_1 = __importDefault(require("path"));
const getProjects = (cwd) => {
    return globby_1.default
        .sync(['packages/*', 'clients/*', 'servers/*'], {
        cwd,
        onlyDirectories: true,
    })
        .map((dirPath) => {
        const pathInfo = path_1.default.parse(dirPath);
        return pathInfo.base;
    });
};
exports.getProjects = getProjects;
