import React, {
  useState
} from 'react';
import axios from 'axios';
import {
  AzureMap,
  AzureMapDataSourceProvider,
  AzureMapFeature,
  AzureMapLayerProvider,
  AzureMapsProvider,
  IAzureDataSourceChildren,
  IAzureMapControls,
  IAzureMapFeature,
  IAzureMapOptions,
} from 'react-azure-maps';
import {
  AuthenticationType,
  ControlOptions
} from 'azure-maps-control';
import {
  DatePicker,
  DetailsList,
  Pivot,
  PivotItem,
  PrimaryButton,
  Selection,
  ScrollablePane,
  ScrollbarVisibility,
  Stack,
  Text,
  TextField,
  IColumn,
  initializeIcons,
  SelectionMode,
} from '@fluentui/react';
import {
  CreateDataOrderRequestBody,
  CreateDataOrderRequestGeoJSONFeature,
  DataOrderResponse,
  GetDataOrderResponse,
  GetMarketplaceDataResponse,
  GetMarketplaceDataResponseGeoJSONFeature,
} from './model/models';

initializeIcons();

const controls: IAzureMapControls[] = [
  {
    controlName: 'StyleControl',
    controlOptions: { mapStyles: 'all' },
    options: { position: 'top-right' } as ControlOptions,
  },
];

function renderLayer(layer: any): IAzureDataSourceChildren {
  return (
    <AzureMapFeature
      type={layer.type}
      id={layer.id}
      coordinates={layer.coordinates}
    />
  )
}

async function populateOrderIds() {
  let base = 'https://t-azmaps.azurelbs.com/data-ordering/catalogs/imagery/orders';
  let api = "api-version=1.0";
  let sub = `subscription-key=`;  // TODO needs fixing
  let args = [api, sub].join('&');
  let url = `${base}?${args}`; 
  let result = await axios.get(url);
  let promises = [];
  for (let i = 0; i < result.data.values.length; i++) {
    let orderId = result.data.values[i];
    if (orderId) {
      let orderUrl = `${base}/${orderId}?${args}`
      promises.push(await axios.get(orderUrl));
    }
  }
  let orderIds = await Promise.all(promises);
  return orderIds;
};

const DataOrderingApp: React.FC = () => {
  // State
  const [mapKey, setMapKey] = useState('');

  const [layers, setLayers] = useState([] as IAzureMapFeature[]);

  const [orderId, setOrderId] = useState('');

  const [orderIds, setOrderIds] = useState(populateOrderIds());

  const [searchParams, setSearchParams] = useState({
    // TODO different default values?
    minCloudCover: 0,
    maxCloudCover: 100,
    minSnowCover: 0,
    maxSnowCover: 100,
    minIncidenceAngle: 0,
    maxIncidenceAngle: 90,
    minAcquisitionDate: '2013-04-20T00:00:00.000Z',
    maxAcquisitionDate: '2019-06-04T00:00:00.000Z',
    bbSouthwestX: -121.854172,
    bbSouthwestY: 47.538065,
    bbNortheastX: -121.424332,
    bbNortheastY: 47.789632,
  });

  const [cartItems, setCartItems] = useState([] as DataOrderResponse[]);
  const [cartItemSelection, setCartItemSelection] = useState(new Selection(
    {
      onSelectionChanged: () => {
        let s = layers.slice();
        let selection = cartItemSelection.getSelection();
        let ss = selection.map(addLayers);
        for (let i = 0; i < ss.length; i++) {
          s = s.concat(ss[i]);
        }
        setLayers(s);
      }
    }
  ));

  const [dataItems, setDataItems] = useState([] as DataOrderResponse[]);
  const [dataItemSelection, setDataItemSelection] = useState(new Selection(
    {
      onSelectionChanged: () => {
        let s = layers.slice();
        let selection = dataItemSelection.getSelection();
        let ss = selection.map(addLayers);
        for (let i = 0; i < ss.length; i++) {
          s = s.concat(ss[i]);
        }
        setLayers(s);
      }
    }
  ));

  const [searchItems, setSearchItems] = useState([] as GetMarketplaceDataResponse[]);
  const [searchItemSelection, setSearchItemSelection] = useState(new Selection(
    {
      onSelectionChanged: () => {
        let s = layers.slice();
        let selection = searchItemSelection.getSelection();
        let ss = selection.map(addLayer);
        let l = s.concat(ss);
        setLayers(l);
      }
    }
  ));

  const [cartColumns, setCartColumns] = useState([
    {
      key: 'column1',
      name: 'Order ID',
      fieldName: 'orderId',
      ariaLabel: 'Order ID Column',
      minWidth: 100,
      maxWidth: 100,
      // onColumnClick: _onCartColumnClick,
      onRender: (item: GetDataOrderResponse) => {
        return <span>{item.id}</span>;
      },
    },
    {
      key: 'column2',
      name: 'Tile Count',
      fieldName: 'tileCount',
      minWidth: 50,
      maxWidth: 50,
      isRowHeader: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: 'Sorted A to Z',
      sortDescendingAriaLabel: 'Sorted Z to A',
      // onColumnClick: _onCartColumnClick,
      onRender: (item: GetDataOrderResponse) => {
        return <span>{item.features.length}</span>;
      },
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column3',
      name: 'Price',
      fieldName: 'price',
      minWidth: 50,
      maxWidth: 50,
      // onColumnClick: _onCartColumnClick,
      data: 'number',
      onRender: (item: GetDataOrderResponse) => {
        return <span>{`$${item.price}`}</span>;
      },
      isPadded: true,
    },
  ] as IColumn[]);
  
  const dataColumns: IColumn[] = [
    {
      key: 'column1',
      name: 'Order ID',
      fieldName: 'orderId',
      ariaLabel: 'Order ID Column',
      minWidth: 100,
      maxWidth: 100,
      // onColumnClick: _onColumnClick,
      onRender: (item: DataOrderResponse) => {
        return <span>{item.id}</span>;
      },
    },
    {
      key: 'column2',
      name: 'Status',
      fieldName: 'status',
      ariaLabel: 'Status Column',
      minWidth: 100,
      maxWidth: 100,
      // onColumnClick: _onColumnClick,
      onRender: (item: DataOrderResponse) => {
        return <span>{item.status}</span>;
      },
    },
    {
      key: 'column3',
      name: 'Tile Count',
      fieldName: 'tileCount',
      minWidth: 50,
      maxWidth: 50,
      isRowHeader: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: 'Sorted A to Z',
      sortDescendingAriaLabel: 'Sorted Z to A',
      // onColumnClick: _onColumnClick,
      onRender: (item: GetDataOrderResponse) => {
        return <span>{item.features.length}</span>;
      },
      data: 'string',
      isPadded: true,
    },
  ];
  
  const searchColumns: IColumn[] = [
    {
      key: 'column1',
      name: 'Date',
      fieldName: 'date',
      ariaLabel: 'Column operations for File type, Press to sort on File type',
      minWidth: 100,
      maxWidth: 100,
      // onColumnClick: _onColumnClick,
      onRender: (item: GetMarketplaceDataResponseGeoJSONFeature) => {
        return <span>{item.properties.acquisitionDate}</span>;
      },
    },
    {
      key: 'column2',
      name: 'Cloud Cover',
      fieldName: 'cc',
      minWidth: 50,
      maxWidth: 50,
      isRowHeader: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: 'Sorted A to Z',
      sortDescendingAriaLabel: 'Sorted Z to A',
      // onColumnClick: _onColumnClick,
      onRender: (item: GetMarketplaceDataResponseGeoJSONFeature) => {
        return <span>{item.properties.cloudCover}</span>;
      },
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column3',
      name: 'Snow Cover',
      fieldName: 'sc',
      minWidth: 50,
      maxWidth: 50,
      // onColumnClick: _onColumnClick,
      data: 'number',
      onRender: (item: GetMarketplaceDataResponseGeoJSONFeature) => {
        return <span>{item.properties.snowCover}</span>;
      },
      isPadded: true,
    },
    {
      key: 'column4',
      name: 'Angle',
      fieldName: 'angle',
      minWidth: 50,
      maxWidth: 50,
      isCollapsible: false,
      data: 'string',
      // onColumnClick: _onColumnClick,
      onRender: (item: GetMarketplaceDataResponseGeoJSONFeature) => {
        return <span>{item.properties.incidenceAngle}</span>;
      },
      isPadded: true,
    },
  ];

  // Event Handlers

  const addLayers = (item: any) => {
    let l = item.features.map(addLayer);
    return l;
  }

  const addLayer = (item: any) => {
    return (
      {
        id: item.id,
        type: "Polygon",
        coordinates: item.geometry.coordinates[0],
      } as IAzureMapFeature
    )
  }

  const createFeature = (item: any) => {
    return {
      type: 'Feature',
      geometry: {
        type: item.geometry.type,  // Polygon
        coordinates: item.geometry.coordinates,
      },
      id: item.id,
      properties: {
        format: 'image/jp2'
      },
    } as CreateDataOrderRequestGeoJSONFeature;
  }

  const addToCart = async () => {
    if (orderId) {
      let base = `https://t-azmaps.azurelbs.com/data-ordering/catalogs/imagery/orders/${orderId}`;
      let api = "api-version=1.0";
      let sub = `subscription-key=`;  // TODO Needs fixing
      let selection = searchItemSelection.getSelection();
      let s = selection[0] as any;
      let datasetId = `datasetId=${s.id}`;
      let features = selection.map(createFeature) as CreateDataOrderRequestGeoJSONFeature[];
      let body = {
        type: "FeatureCollection",
        features: features
      } as CreateDataOrderRequestBody;
      let args = [api, datasetId, sub].join('&');
      let url = `${base}?${args}`;
      let headers = {
        'Content-Type': 'application/json'
      };
      let result = await axios.put(url, body, { headers });
      setOrderId('');
      setOrderIds(populateOrderIds());
    } else {
      alert("Order ID Required");
    }
  }

  const handleMaxDate = (date: Date | null | undefined) => {
    let iso = date?.toISOString();
    // TODO Handle the undefined case better
    if (!iso) { iso = '2020-01-01T00:00:00.000Z' };
    setSearchParams({
      ...searchParams,
      maxAcquisitionDate: iso,
    });
  }

  const handleMinDate = (date: Date | null | undefined) => {
    let iso = date?.toISOString();
    // TODO Handle the undefined case better
    if (!iso) { iso = '2012-01-01T00:00:00.000Z' };
    setSearchParams({
      ...searchParams,
      minAcquisitionDate: iso,
    });
  }

  const handleOrderIdChange = (event: any) => {
    let value = event.target.value;
    setOrderId(value);
  }

  const handleSearchParamChange = (event: any) => {
    let target = event.target;
    let value = target.value;
    setSearchParams({
      ...searchParams,
      [target.id]: value
    });
  }

  const handleMapKeyChange = (event: any) => {
    let target = event.target;
    let value = target.value;
    setMapKey(value);
  }

  const placeOrder = async () => {
    let selection = cartItemSelection.getSelection();
    let orderId = selection.map((item: any) => { return item.id })[0];
    let api = "api-version=1.0";
    let sub = `subscription-key=`;  // TODO Needs fixing
    let base = `https://t-azmaps.azurelbs.com/data-ordering/catalogs/imagery/orders/${orderId}/place`;
    let args = [api, sub].join('&');
    let url = `${base}?${args}`;
    await axios.post(url).then(() => {refreshOrders() });    
  }

  const searchMarketplace = async () => {
    let p = searchParams;
    let base = "https://t-azmaps.azurelbs.com/data-ordering/catalogs/imagery";
    let api = "api-version=1.0";
    let sub = `subscription-key=`;  // TODO Needs fixing
    let cc = `cloudCover=[${p.minCloudCover},${p.maxCloudCover}]`;
    let sc = `snowCover=[${p.minSnowCover},${p.maxSnowCover}]`;
    let ia = `incidenceAngle=[${p.minIncidenceAngle},${p.maxIncidenceAngle}]`;
    let ad = `acquisitionDate=[${p.minAcquisitionDate},${p.maxAcquisitionDate}]`;
    let bb = `bbox=${p.bbSouthwestX},${p.bbSouthwestY},${p.bbNortheastX},${p.bbNortheastY}`
    let args = [api, sub, cc, sc, ia, ad, bb].join('&');
    let url = `${base}?${args}`;
    let result = await axios.get(url);
    setSearchItems(result.data.features);
  };

  const layerRender = () => {
    return layers.map((layer) => renderLayer(layer))
  }

  const refreshOrders = async () => {
    setOrderIds(populateOrderIds());
    let orders = await orderIds;
    let notStarted = [];
    let started = [];
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i].data;
      if (order.status === DataOrderResponse.StatusEnum.NotStarted) {
        notStarted.push(order);
      } else {
        started.push(order);
      }
    }
    setCartItems(notStarted);
    setDataItems(started);
  }

  const pivot = async () => {
    await refreshOrders();
    setLayers([] as IAzureMapFeature[]);
  }

  // This is really ugly code, needed to finish demo but please improve!
  const renderMap = () => {
    if (mapKey.length != 43) {  // 43 is length of typical subscription key
      return (
        <Stack>
          <TextField
            label="Enter Map Key"
            id='mapKey'
            value={mapKey}
            onChange={handleMapKeyChange}
          />
        </Stack>
      )
    }
    return (
      <Stack>
          <AzureMapsProvider>
            <div style={{ height: '97vh', width: '76vw' }}>
              <AzureMap
                controls={controls}
                options={{
                  authOptions: {
                    authType: AuthenticationType.subscriptionKey,
                    subscriptionKey: mapKey,
                  },
                  center: [-122.2796965774825, 47.59784152255815],
                  zoom: 10,
                  style: 'satellite',
                  view: 'Auto',
                }}
              >
                <AzureMapDataSourceProvider
                  id={'polygonExample AzureMapDataSourceProvider'}
                  options={{}}>
                  <AzureMapLayerProvider
                    id={'polygonExample LayerProvider'}
                    options={{
                      fillOpacity: 0.5,
                      fillColor: '#ff0000',
                    }}
                    type={'PolygonLayer'}
                  />
                  {layerRender()}
                </AzureMapDataSourceProvider>
              </AzureMap>
            </div>
          </AzureMapsProvider>
        </Stack>
    )
  }

  return (
    <Stack horizontal>
      <Pivot
        styles={{
          root: {
            marginLeft: 133,
            paddingBottom: 20
          }
        }}
        onLinkClick={pivot}
      >
        <PivotItem headerText="Search" >
          <Stack
            horizontalAlign="center"
            verticalAlign="start"
            verticalFill
            styles={{
              root: {
                width: '450px',
                margin: '0 auto',
                textAlign: 'left',
                color: '#605e5c',
                paddingBottom: 20
              }
            }}
            tokens={{ childrenGap: 7 }}
          >
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <TextField
                label="Min Cloud Cover"
                id='minCloudCover'
                placeholder='0'
                onChange={handleSearchParamChange}
              />
              <TextField
                label="Max Cloud Cover"
                id='maxCloudCover'
                placeholder='100'
                onChange={handleSearchParamChange}
              />
            </Stack>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <TextField
                label="Min Snow Cover"
                id='minSnowCover'
                onChange={handleSearchParamChange}
                placeholder='0'
              />
              <TextField
                label="Max Snow Cover"
                id='maxSnowCover'
                onChange={handleSearchParamChange}
                placeholder='100'
              />
            </Stack>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <TextField
                label="Min Incidence Angle"
                id='minIncidenceAngle'
                onChange={handleSearchParamChange}
                placeholder='0'
              />
              <TextField
                label="Max Incidence Angle"
                id='maxIncidenceAngle'
                onChange={handleSearchParamChange}
                placeholder='90'
              />
            </Stack>
            <Text>Acquisition Date Range</Text>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <DatePicker
                styles={{ root: { width: '168px' } }}
                onSelectDate={handleMinDate}
              />
              <DatePicker
                styles={{ root: { width: '168px' } }}
                onSelectDate={handleMaxDate}
              />
            </Stack>
            <Text>Bounding Box SW Coords</Text>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <TextField
                label="X"
                id='bbSouthwestX'
                onChange={handleSearchParamChange}
              />
              <TextField
                label="Y"
                id='bbSouthwestY'
                onChange={handleSearchParamChange}
              />
            </Stack>
            <Text>Bounding Box NE Coords</Text>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <TextField
                label="X"
                id='bbNortheastX'
                onChange={handleSearchParamChange}
              />
              <TextField
                label="Y"
                id='bbNortheastY'
                onChange={handleSearchParamChange}
              />
            </Stack>
            <Stack.Item align="start">
              <PrimaryButton
                text="Search"
                styles={{ root: { marginLeft: 52 } }}
                onClick={searchMarketplace}
              />
            </Stack.Item>
          </Stack>
          <div style={{ height: '260px', position: 'relative' }}>
            <ScrollablePane
              scrollbarVisibility={ScrollbarVisibility.auto}>
              <Stack>
                <DetailsList
                  items={searchItems}
                  columns={searchColumns}
                  selection={searchItemSelection}
                  selectionPreservedOnEmptyClick={true}
                />
              </Stack>
            </ScrollablePane>
          </div>
          <Stack
            horizontalAlign="center"
            verticalAlign="start"
            verticalFill
            styles={{
              root: {
                width: '450px',
                margin: '0 auto',
                textAlign: 'left',
                color: '#605e5c'
              }
            }}
            tokens={{ childrenGap: 7 }}
          >
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <TextField
                label="Order ID"
                id="orderId"
                onChange={handleOrderIdChange} />
              <Stack.Item align="end">
                <PrimaryButton
                  text="Add to Cart"
                  onClick={addToCart}
                />
              </Stack.Item>
            </Stack>
          </Stack>
        </PivotItem>
        <PivotItem
          headerText="Cart"
        >
          <div
            style={{
              height: '500px',
              position: 'relative',
              width: '450px'
            }}
          >
            <ScrollablePane
              scrollbarVisibility={ScrollbarVisibility.auto}>
              <Stack>
                <DetailsList
                  items={cartItems}
                  columns={cartColumns}
                  selection={cartItemSelection}
                  selectionMode={SelectionMode.single}
                />
              </Stack>
            </ScrollablePane>
          </div>
          <Stack
            horizontalAlign="center"
            verticalAlign="start"
            verticalFill
            styles={{
              root: {
                width: '450px',
                margin: '0 auto',
                textAlign: 'left',
                color: '#605e5c',
                paddingBottom: 20
              }
            }}
            tokens={{ childrenGap: 7 }}
          >
            <PrimaryButton
              text="Order Data"
              onClick={placeOrder} />
          </Stack>
        </PivotItem>
        <PivotItem
          headerText="Data"
        >
          <div
            style={{
              height: '280px',
              position: 'relative',
              width: '450px'
            }}
          >
            <ScrollablePane
              scrollbarVisibility={ScrollbarVisibility.auto}>
              <Stack>
                <DetailsList
                  items={dataItems}
                  columns={dataColumns}
                  selection={dataItemSelection}
                  selectionMode={SelectionMode.single}
                />
              </Stack>
            </ScrollablePane>
          </div>
        </PivotItem>
      </Pivot>
      {renderMap()}
    </Stack>
  );
}

export default DataOrderingApp;
