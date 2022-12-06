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
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamer = void 0;
const command_1 = require("./command");
const promise_1 = require("./promise");
let argv = {};
let middlewares = [];
let command;
let index = 0;
const init = (_argv) => {
    argv = _argv;
    return {
        use,
        next,
        run,
    };
};
const use = (middleware) => {
    middlewares.push(middleware);
};
const next = () => __awaiter(void 0, void 0, void 0, function* () {
    const nextMiddleware = middlewares[index++];
    if (!nextMiddleware) {
        return;
    }
    const response = nextMiddleware(command, next);
    if ((0, promise_1.isPromise)(response)) {
        yield response;
    }
});
const clear = () => {
    index = 0;
};
const run = () => {
    command = new command_1.Command(argv);
    clear();
    next();
};
exports.streamer = init;
