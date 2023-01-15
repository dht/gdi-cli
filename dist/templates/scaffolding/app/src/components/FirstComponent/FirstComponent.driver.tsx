import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { FirstComponent, FirstComponentProps } from './FirstComponent';
import { BaseComponentDriver } from '@gdi/testing-base';

export class FirstComponentDriver extends BaseComponentDriver {
    private props: Partial<FirstComponentProps> = {};

    constructor() {
        super('FirstComponent');
    }

    when: any = {
        rendered: () => {
            render(<FirstComponent {...this.props} />);
            return this;
        },
        click: () => {
            fireEvent.click(this.wrapper);
            return this;
        },
    };

    given: any = {
        props: (props: Partial<FirstComponentProps>) => {
            this.props = props;
            return this;
        },
    };

    get = {
        wrapperClassName: () => {
            return this.wrapper.className;
        },
    };
}
