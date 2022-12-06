"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const jsonServer = require('json-server');
const init = (dbPath) => {
    const router = jsonServer.router(dbPath);
    return router;
};
exports.init = init;
const api = {};
module.exports = {
    init: exports.init,
    api,
};
