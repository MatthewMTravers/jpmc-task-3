import { ServerRespond } from './DataStreamer';

export interface Row {
  
  //Updated to match the new schema
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}


export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    
    //Compute  proper price per ask/bid, computing ratio afterwards
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
    const ratio = priceABC / priceDEF;

    //Create bounds for strike zone
    const upperBound = 1 + 0.083; //+8.3% Inflation Rate
    const lowerBound = 1 - 0.083; //-8.3% Inflation Rate

    return {
      //Regular prices and ratio
      price_abc: priceABC, 
      price_def: priceDEF,
      ratio,
      
      //Timestamps the calculations of ABC and DEF accordingly
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ? 
      serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      
      //Ensuring the user is alerted when the price ratio is above or below bounds
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    }
  }
}
