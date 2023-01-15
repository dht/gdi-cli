import React from 'react';
import {
    Container,
    Actions,
    CTA,
    Details,
    H1,
    Column,
    Row,
    Image,
    ImageWrapper,
    Wrapper,
} from './$CMP.style';

export const id = '$TEMPLATE_ID.$CMPCC-basic';

export type $CMPProps = {
    strings: $CMPStrings;
    colors: $CMPColors;
    extra: $CMPExtra;
};

export type $CMPStrings = {
    header: string;
    ctaButtonText: string;
};

export type $CMPColors = {
    background?: string;
    text?: string;
};

export type $CMPExtra = {
    href: string;
    imageUrl: string;
    backgroundImageUrl?: string;
};

export function $CMP(props: $CMPProps) {
    const { strings, colors, extra } = props;
    const { header, ctaButtonText } = strings;
    const { imageUrl, href } = extra;

    return (
        <Wrapper className="$CMP-wrapper" data-testid="$CMP-wrapper">
            <Container>
                <Row>
                    <Column>
                        <Details>
                            <H1>{header}</H1>
                            <Actions>
                                <CTA colors={colors} href={href}>
                                    {ctaButtonText}
                                </CTA>
                            </Actions>
                        </Details>
                    </Column>
                    <Column>
                        <ImageWrapper>
                            <Image src={imageUrl} />
                        </ImageWrapper>
                    </Column>
                </Row>
            </Container>
        </Wrapper>
    );
}

export default $CMP;
