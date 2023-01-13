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

const start = async (port: number) => {
    app.use(cors());
    app.use(bodyParser.json());

    app.use('/data', middlewares);

    app.get('/', (req: any, res: any) => {
        res.send('pong');
    });

    app.listen(port, () => {
        const ips = getIps();
        const domain = `http://${ips[0]}:${port}`;
        console.log(`Server running on ${chalk.cyan(domain)}\n\n`);
    });
};

start(5005);
