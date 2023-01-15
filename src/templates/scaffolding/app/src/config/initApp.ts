import { APP_ID } from './ids';
import { appSagas } from '../sagas';
import { initialState, reducers, selectors } from '../store';
import { instances } from './instances';
import { routes, menuItems, commandBarItems, contextBarItems } from './routes';
import { widgets } from './widgets';
import type { AppBuilders } from '@gdi/platformer';

export const initApp = (builders: AppBuilders) => {
    const { storeBuilder, selectorsBuilder, routerBuilder, widgetBuilder } =
        builders;

    console.log(`init ${APP_ID} app`);

    routerBuilder
        .withRoutes(APP_ID, routes)
        .withInstances(APP_ID, instances, { addHeader: true })
        .withContextBar(APP_ID, contextBarItems)
        .withMenu(menuItems)
        .withCommandBar(APP_ID, commandBarItems);

    widgetBuilder //
        .withWidgets(APP_ID, widgets);

    storeBuilder
        .withReducers(reducers)
        .withInitialState(initialState)
        .withSagas(...appSagas);

    selectorsBuilder //
        .withSelectors(APP_ID, selectors);
};
