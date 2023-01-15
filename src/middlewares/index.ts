import { middlewares as web } from './midWeb';
import { middlewares as npmPackage } from './midPackage';
import { middlewares as app } from './midCreateApp';
import { middlewares as component } from './midCreateComponents';

export default {
    create: {
        app,
        component,
        web,
        package: npmPackage,
    },
};
