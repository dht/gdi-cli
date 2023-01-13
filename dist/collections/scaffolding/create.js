"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// shortcuts: create
// desc: generates scaffolding for fs and data
const chalk_1 = __importDefault(require("chalk"));
const scaffoldingVerbs_1 = require("../../config/scaffoldingVerbs");
const middlewares_1 = __importDefault(require("../../middlewares"));
const midBase_1 = require("../../middlewares/midBase");
const argv_1 = require("../../utils/argv");
const streamer_1 = require("../../utils/streamer");
const argv = (0, argv_1.parseArgv)(process.argv);
const entityType = argv._[0];
const isScaffolding = scaffoldingVerbs_1.scaffoldingVerbs[entityType];
const midTemplate = middlewares_1.default.create[entityType];
if (!midTemplate) {
    console.log(chalk_1.default.red(`could not find template for "${entityType}"`));
    process.exit();
}
const names = [...argv._].splice(1);
names.forEach((name) => {
    const _ = [entityType, name];
    const newArgv = Object.assign(Object.assign({}, argv), { _ });
    const stream = new streamer_1.Streamer(newArgv);
    stream.use(midBase_1.middlewares.input());
    stream.use(midTemplate.preRun());
    stream.use(midBase_1.middlewares.scanTemplateFiles({ skip: !isScaffolding }));
    stream.use(midTemplate.parseInstructions());
    stream.use(midBase_1.middlewares.writeFiles({ skip: !isScaffolding }));
    stream.use(midTemplate.postRun());
    stream.run();
});
