import React from 'react';
import { IWidget } from '@gdi/platformer';
import { Wireframes } from '@gdi/ui';
import { FirstComponentContainer } from '../containers/FirstComponentContainer';

export enum AppWidgets {
    FirstComponent = 'FirstComponent',
    WelcomeModal = 'WelcomeModal',
    WelcomeDrawer = 'WelcomeDrawer',
}
export const widgets: IWidget[] = [
    {
        id: AppWidgets.FirstComponent,
        name: 'FirstComponent',
        description: 'FirstComponent',
        defaultDimension: {
            y: 16,
            x: 12,
        },
        component: (props: any) => <FirstComponentContainer {...props} />,
    },
    {
        id: AppWidgets.WelcomeModal,
        name: 'WelcomeModal',
        description: 'Welcome modal',
        defaultDimension: {
            y: 16,
            x: 12,
        },
        component: (props: any) => <Wireframes type="table" />,
    },
    {
        id: AppWidgets.WelcomeDrawer,
        name: 'WelcomeDrawer',
        description: 'Welcome drawer',
        defaultDimension: {
            y: 16,
            x: 12,
        },
        component: (props: any) => <Wireframes type="table" />,
    },
];
