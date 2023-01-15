"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// shortcuts: staging
// desc: configure staging
const chalk_1 = __importDefault(require("chalk"));
const middlewares_1 = __importDefault(require("../../middlewares"));
const midBase_1 = require("../../middlewares/midBase");
const argv_1 = require("../../utils/argv");
const streamer_1 = require("../../utils/streamer");
const argv = (0, argv_1.parseArgv)(process.argv);
const entityType = argv._[0];
const midTemplate = middlewares_1.default.staging[entityType];
if (!midTemplate) {
    console.log(chalk_1.default.red(`could not find template for "${entityType}"`));
    process.exit();
}
const stream = (0, streamer_1.streamer)(argv);
stream.use(midBase_1.middlewares.input());
stream.use(midTemplate.preRun());
stream.use(midTemplate.parseInstructions());
stream.use(midBase_1.middlewares.saveToCliDb());
stream.use(midTemplate.postRun());
stream.run();
