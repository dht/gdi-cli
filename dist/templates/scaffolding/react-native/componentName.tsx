import React, { useState } from 'react';
import { Button, Text } from 'react-native';
import { Wrapper } from './$CMP.style';

export type $CMPProps = {};

export const $CMP = (_props: $CMPProps) => {
    const [text, setText] = useState('');

    return (
        <Wrapper>
            <Button
                testID="button"
                onPress={() => setText('good')}
                title="Click me"
            />
            <Text testID="label">{text}</Text>
        </Wrapper>
    );
};

export default $CMP;
