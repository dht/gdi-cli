"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const midCreateWidget_1 = require("./midCreateWidget");
const midCreateSite_1 = require("./midCreateSite");
exports.default = {
    create: {
        widget: midCreateWidget_1.middlewares,
        site: midCreateSite_1.middlewares,
    },
};
