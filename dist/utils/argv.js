"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgv = void 0;
const parseArgv = (argv) => {
    const lastArg = [...argv].pop();
    try {
        return JSON.parse(lastArg !== null && lastArg !== void 0 ? lastArg : '');
    }
    catch (e) {
        return null;
    }
};
exports.parseArgv = parseArgv;
