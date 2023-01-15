import {
    ICommandBarItem,
    IContextBarItem,
    IMenuItem,
    IRoutes,
} from '@gdi/platformer';
import { ROOT } from './ids';

export const routes: IRoutes = {
    $APP_NAME: `${ROOT}`,
    userDrawer: `${ROOT}/users/:userId`,
    $APP_NAMEDrawer: `${ROOT}/users/:userId`,
    $APP_NAMEModal: `${ROOT}/announcement/:flavour/for/:name`,
};

export const menuItems: IMenuItem[] = [
    {
        path: routes.$APP_NAME,
        icon: '$APP_NAME',
        label: '$APP_NAME_CAPITAL',
        groupId: '$APP_NAME_CAPITAL',
        showOnSlim: true,
        order: 0,
    },
];

export const contextBarItems: IContextBarItem[] = [];

export const commandBarItems: ICommandBarItem[] = [];
