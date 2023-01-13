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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// shortcuts: list
// desc: the commands table
const fs_extra_1 = __importDefault(require("fs-extra"));
const paths_1 = require("../../cli/paths");
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    const commands = fs_extra_1.default.readJSONSync(paths_1.indexJsonPath);
    const data = Object.keys(commands)
        .map((commandId) => {
        const command = commands[commandId], { collection, shortcuts, description } = command;
        return {
            collection,
            command: shortcuts.sort().join(', '),
            description,
        };
    })
        .filter((a) => a.command)
        .sort((a, b) => {
        if (a.collection < b.collection)
            return -1;
        if (a.collection > b.collection)
            return 1;
        if (a.command === b.command)
            return 0;
        return a.command > b.command ? 1 : -1;
    });
    console.table(data);
});
start();
