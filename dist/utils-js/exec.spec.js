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
const { exec, execSync } = require('./exec');
describe('execSync', () => {
    let response;
    it('return response', () => __awaiter(void 0, void 0, void 0, function* () {
        response = yield execSync('pwd', [], '/');
        expect(response).toEqual('/');
    }));
    it('return error', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            response = yield execSync('foofoo', [], '.');
        }
        catch (err) {
            expect(err.message).toBe('spawnSync foofoo ENOENT');
        }
    }));
    it('parallel', () => __awaiter(void 0, void 0, void 0, function* () {
        const promises = [
            execSync('pwd', [], '/'),
            execSync('pwd', [], '/'),
            execSync('pwd', [], '/'),
        ];
        const responses = yield Promise.all(promises);
        expect(responses.length).toBe(3);
        responses.forEach((response) => {
            expect(response).toEqual('/');
        });
    }));
});
describe('exec', () => {
    let response;
    it('return response', () => __awaiter(void 0, void 0, void 0, function* () {
        response = yield exec('pwd', [], '/');
        expect(response).toEqual('/\n');
    }));
});
