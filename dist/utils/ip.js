"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIps = void 0;
const { networkInterfaces } = require('os');
const getIps = () => {
    const nets = networkInterfaces();
    const results = [];
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                results.push(net.address);
            }
        }
    }
    return results;
};
exports.getIps = getIps;
