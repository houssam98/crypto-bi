import * as functions from 'firebase-functions';
import http = require('https');

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const getLatest = functions.https.onCall(async (data, context) => {
  const coinMarketCap = await getCoinMarketCapPrices();
  const coinbase = await getCoinbasePrices();

  // COMPARE PRICES BETWEEN EXCHANGES
  // GET CURRENCIES
  // CONVERT PRICES TO SELECTED CURRENCY

  return {
    coinMarketCap: JSON.parse(coinMarketCap),
    coinbase: JSON.parse(coinbase),
  };
});

function getCoinbasePrices() {
  return new Promise<string>(async (resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'api.coinbase.com',
      port: null,
      path: `/v2/exchange-rates`,
      headers: {
        'content-type': 'application/json',
      },
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

function getCoinMarketCapPrices() {
  return new Promise<string>(async (resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'pro-api.coinmarketcap.com',
      port: null,
      path: `/v1/cryptocurrency/listings/latest`,
      headers: {
        'X-CMC_PRO_API_KEY': `e3885ce2-4a1d-4596-8cba-8703d34bc616`,
        'content-type': 'application/json',
      },
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
