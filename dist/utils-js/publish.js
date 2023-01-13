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
const fs = require('fs');
const path = require('path');
const { exec } = require('./exec');
const publish = (cwd, shouldWriteLogs) => __awaiter(void 0, void 0, void 0, function* () {
    const raw = yield exec('npm', ['publish', '--access', 'public'], cwd);
    if (shouldWriteLogs) {
        const logsDir = path.resolve(`${cwd}/logs`);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir);
        }
        fs.writeFileSync(logsDir + '/publish.raw.log', raw);
    }
    return {
        raw,
    };
});
module.exports = {
    publish,
};
