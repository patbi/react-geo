```jsx
import * as React from 'react';

import {
  Statistic,
  Button,
  Icon,
  Spin
} from 'antd';

import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceOSM from 'ol/source/OSM';
import OlSourceTileWMS from 'ol/source/TileWMS';
import { fromLonLat } from 'ol/proj';

import * as copy from 'copy-to-clipboard';

import CoordinateInfo from '@terrestris/react-geo/CoordinateInfo/CoordinateInfo';

const queryLayer = new OlLayerTile({
  name: 'States (USA)',
  source: new OlSourceTileWMS({
    url: 'https://ahocevar.com/geoserver/wms',
    params: {
      'LAYERS': 'usa:states',
      'TILED': true
    },
    serverType: 'geoserver',
    crossOrigin: 'anonymous'
  })
});

class CoordinateInfoExample extends React.Component {

  constructor(props) {
    super(props);

    this.mapDivId = `map-${Math.random()}`;

    this.map = new OlMap({
      layers: [
        new OlLayerTile({
          name: 'OSM',
          source: new OlSourceOSM()
        }),
        queryLayer
      ],
      view: new OlView({
        center: fromLonLat([-99.4031637, 38.3025695]),
        zoom: 4
      })
    });
  }

  componentDidMount() {
    this.map.setTarget(this.mapDivId);
  }

  render() {
    return(
      <>
        <div
          id={this.mapDivId}
          style={{
            height: '400px'
          }}
        />
        <CoordinateInfo
          style={{
            position: 'relative',
            height: '500px'
          }}
          map={this.map}
          queryLayers={[queryLayer]}
          resultRenderer={(opts) => {
            const features = opts.features;
            const clickCoord = opts.clickCoordinate;
            const loading = opts.loading;

            return (
              Object.keys(features).length === 1 && features[Object.keys(features)[0]].length === 1 ?
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Spin
                      spinning={loading}
                    >
                      <Statistic
                        title="Coordinate"
                        value={clickCoord.join(', ')}
                      />
                    </Spin>
                    <Button
                      style={{ marginTop: 16 }}
                      type="primary"
                      onClick={() => {
                        copy(clickCoord);
                      }}
                    >
                      <Icon
                        type="copy"
                      />
                    </Button>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Spin
                      spinning={loading}
                    >
                      <Statistic
                        title="State"
                        value={features[Object.keys(features)[0]][0].get('STATE_NAME')}
                      />
                    </Spin>
                    <Button
                      style={{ marginTop: 16 }}
                      type="primary"
                      onClick={() => {
                        copy(clickCoord);
                      }}
                    >
                      <Icon
                        type="copy"
                      />
                    </Button>
                  </div>
                </div> :
                <span>Click on a state to get details about the clicked coordinate.</span>
            );
          }}
        />
      </>
    );
  }
}

<CoordinateInfoExample />
```