import styled from 'styled-components';
import { ButtonBase } from '../../components/Button/Button.style';
import { Grid, mobile, css } from '@gdi/engine';

export const Wrapper = styled.div`
    flex: 1;
    height: 60vh;

    ${mobile(css``)}
`;

export const Container = styled(Grid.Container)``;

export const Row = styled(Grid.Row)`
    border-color: 1px solid green;
`;

export const Column = styled(Grid.Column)`
    border-color: 1px solid green;
`;

export const ImageWrapper = styled.div`
    flex: 1;
`;

export const Image = styled.img`
    max-width: 88vw;
    min-height: 300px;
`;

export const Details = styled.div`
    flex: 1;
`;

export const H1 = styled.h1`
    font-size: 42px;
    max-width: 400px;
`;

export const P = styled.p`
    font-size: 20px;
    max-width: 400px;
    line-height: 29px;
`;

export const Actions = styled.div`
    margin-top: 70px;
`;

export const CTA = styled.a(ButtonBase)`
    box-shadow: 0 4px 14px rgb(247 206 130 / 50%);
`;
