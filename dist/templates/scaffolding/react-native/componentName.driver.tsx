import React from 'react';
import type { $CMPProps } from './$CMP';
import { $CMP } from './$CMP';
import { BaseMobileComponentDriver } from '@gdi/testing-base/lib/mobile/BaseMobileComponentDriver';

export class $CMPDriver extends BaseMobileComponentDriver {
    private props: Partial<$CMPProps> = {
        defaultIsChecked: true,
    };

    constructor() {
        super('$CMP');
    }

    when: any = {
        snapshot: () => {
            return this.snapshot(<$CMP {...(this.props as any)} />);
        },
        rendered: () => {
            this.render(<$CMP {...(this.props as any)} />);
            return this;
        },
        buttonPressed: () => {
            this.fire('button', 'press');
            return this;
        },
    };

    given: any = {
        props: (props: Partial<$CMPProps>) => {
            this.props = props;
            return this;
        },
    };

    get = {
        labelText: () => {
            const instance = this.element('label');
            if (instance) {
                return instance.props.children;
            }
        },
    };
}
