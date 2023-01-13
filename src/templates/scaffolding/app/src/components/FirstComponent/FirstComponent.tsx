import React from 'react';
import { Wrapper } from './FirstComponent.style';

export type FirstComponentProps = {};

export function FirstComponent(_props: FirstComponentProps) {
    return (
        <Wrapper
            className="FirstComponent-wrapper"
            data-testid="FirstComponent-wrapper"
        >
            FirstComponent
        </Wrapper>
    );
}

export default FirstComponent;
