"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = void 0;
const isPromise = (object) => {
    return typeof object === 'function' && typeof object.then === 'function';
};
exports.isPromise = isPromise;
