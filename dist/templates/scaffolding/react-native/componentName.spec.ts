import { $CMPDriver } from './$CMP.driver';

describe('$CMP', () => {
    let driver: $CMPDriver;

    beforeAll(() => {
        driver = new $CMPDriver();
    });

    it('should render component', () => {
        const labelText = driver.when //
            .rendered()
            .when.buttonPressed()
            .get.labelText();

        expect(labelText).toBe('good');
    });
});

describe('$CMP snapshots', () => {
    let driver: $CMPDriver;

    beforeAll(() => {
        driver = new $CMPDriver();
    });

    it('should render component', () => {
        expect(driver.when.snapshot()).toMatchSnapshot();
    });
});
