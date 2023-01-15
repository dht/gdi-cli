import { FirstComponentDriver } from './FirstComponent.driver';

describe('FirstComponent', () => {
    let driver: FirstComponentDriver;

    beforeAll(() => {
        driver = new FirstComponentDriver();
    });

    it('should render component', () => {
        const wrapperClassName = driver.given //
            .props({})
            .when.rendered()
            .get.wrapperClassName();

        expect(wrapperClassName).toBe('FirstComponent-wrapper');
    });
});

describe('IsoBuilder snapshots', () => {
    let driver: FirstComponentDriver;

    beforeAll(() => {
        driver = new FirstComponentDriver();
    });

    it('should render component', () => {
        expect(driver.when.snapshot()).toMatchSnapshot();
    });
});
