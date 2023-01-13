import { params } from './meta/$CMP.params';
import { sampleData } from './meta/$CMP.sample';
import { dimensions } from './meta/$CMP.dimensions';
import { screenshots } from './meta/$CMP.screenshots';

export const widgetInfo: IWidget = {
    id: '$TEMPLATE_ID.$CMPCC-basic',
    name: '$CMPCC-basic',
    description: '',
    params,
    sampleData,
    dimensions,
    screenshots,
    tags: ['type-$CMPCC'],
    dataTags: [],
    widgetType: '$CMPCC',
    isBlock: true,
};
