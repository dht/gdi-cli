"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
const delay = (duration) => {
    return new Promise((resolve) => setTimeout(resolve, duration));
};
exports.delay = delay;
