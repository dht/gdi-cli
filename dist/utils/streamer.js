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
exports.Streamer = void 0;
const command_1 = require("./command");
const promise_1 = require("./promise");
class Streamer {
    constructor(argv) {
        this.argv = argv;
        this.middlewares = [];
        this.index = 0;
        this.next = () => __awaiter(this, void 0, void 0, function* () {
            const nextMiddleware = this.middlewares[this.index++];
            if (!nextMiddleware) {
                return;
            }
            if (this.command) {
                const response = nextMiddleware(this.command, this.next);
                if ((0, promise_1.isPromise)(response)) {
                    yield response;
                }
            }
        });
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }
    clear() {
        this.index = 0;
    }
    run() {
        this.command = new command_1.Command(this.argv);
        this.clear();
        this.next();
    }
}
exports.Streamer = Streamer;
