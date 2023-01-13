import { IWidgetInstancesByPageList } from '@gdi/platformer';
import { routes } from './routes';
import { AppWidgets } from './widgets';

export const instances: IWidgetInstancesByPageList = {
    $APP_NAME: [
        {
            id: '10',
            widgetId: AppWidgets.FirstComponent,
            position: { y: 2, x: 3 },
            dimension: { y: 46, x: 128 },
        },
        {
            id: '2',
            widgetId: AppWidgets.WelcomeModal,
            overlayRoute: routes.$APP_NAMEModal,
        },
        {
            id: '3',
            widgetId: AppWidgets.WelcomeDrawer,
            overlayRoute: routes.$APP_NAMEDrawer,
        },
    ],
};
