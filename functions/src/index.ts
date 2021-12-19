import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as http from 'https';
import { filteredAssets } from './filteredAssets';

interface ExchangeItem {
  exchange_id: string;
  name: string;
  website: string;
  volume_24h: number;
}

interface AssetItem {
  asset_id: string;
  name: string;
  ethereum_contract_address: string;
  price: number;
  volume_24h: number;
  change_1h: number;
  change_24h: number;
  change_7d: number;
  total_supply: number;
  circulating_supply: number;
  max_supply: number;
  market_cap: number;
  fully_diluted_market_cap: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

interface MarketItem {
  exchange_id: string;
  symbol: string;
  base_asset: string;
  quote_asset: string;
  price_unconverted: number;
  price: number;
  change_24h: number;
  spread: number;
  volume_24h: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

admin.initializeApp({
  credential: admin.credential.cert(
    require('../cryptosights-firebase-adminsdk-s05g8-ecd46c540d.json')
  ),
});

export const updateScheduler = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    await extractData();
    return 'Updated';
  });

export const refreshData = functions.https.onCall(async (data, context) => {
  await extractData();
  return 'Refreshed';
});

async function extractData() {
  return new Promise<boolean>(async (resolve, reject) => {
    // EXTRACT EXCHANGE DATA
    const extractedExchanges = await requestData('exchanges');

    // PARSE DATA TO JSON AND GET EXCHANGES OBJECT
    const exchanges = <Array<ExchangeItem>>(
      JSON.parse(extractedExchanges).exchanges
    );

    // CREATE INITIAL DATA OBJECT
    let dataObj: {
      [exchangeId: string]: {
        id: string;
        name: string;
        volume_24h: number;
        prices: { [assetId: string]: any };
      };
    } = {};

    // SET EXCHANGES to dataObj BY ID
    exchanges.map((exchange: ExchangeItem) => {
      dataObj[exchange.exchange_id] = {
        id: exchange.exchange_id,
        name: exchange.name,
        volume_24h: exchange.volume_24h,
        prices: {},
      };
    });

    // ASSIGN EXCHANGES BY ID AS STRING ARRAY
    const exchangeIds = Object.keys(dataObj);

    // EXTRACT ASSETS DATA
    const extractedAssets = await requestData('assets');

    // PARSE DATA TO JSON AND GET ASSETS OBJECT
    let assets = <Array<AssetItem>>JSON.parse(extractedAssets).assets;

    // FILTER ASSETS FROM THE LIST OF SELECTED ASSETS
    assets = assets.filter((asset) => filteredAssets.includes(asset.asset_id));

    // SET ASSETS to dataObj BY EXCHANGEID-ASSETID
    exchangeIds.map((exchangeId: string) => {
      assets.map(
        (assetItem: AssetItem) =>
          (dataObj[exchangeId].prices[assetItem.asset_id] = {})
      );
    });

    // ASSIGN ASSETS BY ID AS STRING ARRAY
    const assetIds = Object.keys(dataObj[exchangeIds[0]].prices);

    // EXTRACT MARKETS DATA
    const extractedMarkets = await requestData('markets');

    // PARSE DATA TO JSON AND GET MARKETS OBJECT
    const markets = <Array<MarketItem>>JSON.parse(extractedMarkets).markets;

    // SET PRICES BY EXCHANGE ID AND ASSET ID
    exchangeIds.map((exchangeId: string) => {
      assetIds.map((assetId: string) => {
        markets
          .filter(
            (item: MarketItem) =>
              item.exchange_id === exchangeId && item.base_asset === assetId
          )
          .map((item) => {
            dataObj[exchangeId].prices[assetId][item.quote_asset] = item.price;
          });
      });
    });

    // STORE DOCUMENTS BY EXCHANGE ID IN FIRESTORE DATABASE
    for (const exchangeId of exchangeIds) {
      await admin
        .firestore()
        .doc(`prices/${exchangeId}`)
        .set({
          modified: admin.firestore.FieldValue.serverTimestamp(),
          ...dataObj[exchangeId],
        });
    }

    resolve(true);
  });
}

function requestData(type: 'markets' | 'exchanges' | 'assets') {
  return new Promise<string>(async (resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'www.cryptingup.com',
      port: null,
      path: `/api/${
        type === 'markets'
          ? 'markets?size=5100'
          : type === 'exchanges'
          ? 'exchanges'
          : 'assets?size=1250'
      }`,
    };

    const req = http.request(options, function (res) {
      const chunks: any[] = [];

      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        const body = Buffer.concat(chunks);
        resolve(body.toString());
      });

      res.on('error', (err) => {
        console.error(err.stack);
      });
    });
    req.end();
  });
}
