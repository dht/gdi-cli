"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const midWeb_1 = require("./midWeb");
const midPackage_1 = require("./midPackage");
const midCreateApp_1 = require("./midCreateApp");
const midCreateComponents_1 = require("./midCreateComponents");
exports.default = {
    create: {
        app: midCreateApp_1.middlewares,
        component: midCreateComponents_1.middlewares,
        web: midWeb_1.middlewares,
        package: midPackage_1.middlewares,
    },
};
