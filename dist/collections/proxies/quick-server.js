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
// shortcuts: quick
// desc: quick access to staging
const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const cors = require('cors');
const { config } = require('dotenv-flow');
const { getIps } = require('../../utils/ip');
const jsonServer = require('json-server');
const app = express();
const middlewares = jsonServer.defaults();
config();
const start = (port) => __awaiter(void 0, void 0, void 0, function* () {
    app.use(cors());
    app.use(bodyParser.json());
    app.use('/data', middlewares);
    app.get('/', (req, res) => {
        res.send('pong');
    });
    app.listen(port, () => {
        const ips = getIps();
        const domain = `http://${ips[0]}:${port}`;
        console.log(`Server running on ${chalk.cyan(domain)}\n\n`);
    });
});
start(5005);
