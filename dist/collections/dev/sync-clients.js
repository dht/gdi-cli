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
// shortcuts: sync-clients
// desc: sync gdi-admin and gdi-site to all instances
const fs = require('fs');
const path = require('path');
const { exec } = require('../../utils-js/exec');
console.log('copying to');
const copyTo = (root, source) => {
    const sourceFull = path.resolve(source);
    const destination = path.resolve(root, source.replace('clients/', ''));
    exec('rsync', ['-rhv', sourceFull + '/src/', destination + '/src/'], root, {
        stdOutMode: true,
    });
    exec('rsync', ['-rhv', sourceFull + '/package.json', destination + '/package.json'], root, {
        stdOutMode: true,
    });
    const scriptsPathPackageJson = sourceFull + '/scripts/package.json';
    if (fs.existsSync(scriptsPathPackageJson)) {
        exec('rsync', [
            '-rhv',
            scriptsPathPackageJson,
            destination + '/scripts/package.json',
        ], root, {
            stdOutMode: true,
        });
    }
};
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const root = '../instances';
    copyTo(`${root}/demo`, 'clients/gdi-admin');
    copyTo(`${root}/demo`, 'clients/gdi-site');
    copyTo(`${root}/freelancers`, 'clients/gdi-admin');
    copyTo(`${root}/freelancers`, 'clients/gdi-site');
    copyTo(`${root}/guidance`, 'clients/gdi-admin');
    copyTo(`${root}/guidance`, 'clients/gdi-site');
    copyTo(`${root}/level-up`, 'clients/gdi-admin');
    copyTo(`${root}/level-up`, 'clients/gdi-site');
    copyTo(`${root}/life`, 'clients/gdi-admin');
    copyTo(`${root}/life`, 'clients/gdi-site');
    copyTo(`${root}/use-gdi`, 'clients/gdi-admin');
    copyTo(`${root}/use-gdi`, 'clients/gdi-site');
});
run();
