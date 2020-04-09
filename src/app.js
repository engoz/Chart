
import * as Helper from './helper';
import {subscribeOnStream,unsubscribeFromStream} from './stream';

const lastBarsCache = new Map();

export default {


    onReady : (callback) => {
        Helper.consoloYaz("==== onReady call ====",true); 
        setTimeout(() => callback(Helper.ourConfig));
    },
    searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
        Helper.consoloYaz("==== searchSymbols call ====",true);
       
        // console.log(' Search Symbols :' + userInput);
        // console.log(' Exchange = ' + exchange);
        // console.log(' SymbolType = ' + symbolType);
        const newSeymbols = Helper.ourSymbols.filter(symbol => {
            const isFullSymbolContainsInput = symbol.full_name
                .toLowerCase()
                .indexOf(userInput.toLowerCase()) !== -1;
            return isFullSymbolContainsInput;
        });
    
        onResultReadyCallback(newSeymbols);
        
    },
    resolveSymbol: async(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {


        const symbolItem = await Helper.findSymbol(symbolName);

        if (!symbolItem) {
			console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
			onResolveErrorCallback('cannot resolve symbol');
			return;
		}

        var symbolInfo = {
            name: symbolItem.symbol,
            ticker: symbolItem.ticker,
            format: 'price',
            description: symbolItem.description,
            type: 'Currency',
            session: '24x7',
            timezone:  'Europe/Istanbul',
            exchange: 'Arbitrage',
            minmov: 1,
            pricescale: 100000, //dynamic
            has_no_volume: true,
            supports_time : true,
            has_empty_bars : true,
            //has_weekly_and_monthly: false,
            minmov2: 0,
            //    fractional: false,
            has_intraday: true,
            //intraday_multipliers: ['1'],
            supported_resolution: Helper.supportedResolutions,
            has_seconds: false,
            //seconds_multipliers: ['60s'],
               has_daily: true,
               has_weekly_and_monthly: true,
            //   has_empty_bars : false,
            //   force_session_rebuild : true,
            //   has_no_volume : false,
            volume_precision: 5, //dynamic
            data_status: "streaming",
            //    expired: true,
            //    expiration_date : 0,
            //     sector : "fff s",
            currency_code: "TRY"
        };
                
        onSymbolResolvedCallback(symbolInfo);
    },
    getBars: async (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
        Helper.consoloYaz("==== getBars call ====",false); 
       
        try {

			const data = await Helper.makeApiRequest(symbolInfo, resolution, from, to);
			if (data.Response && data.Response === 'Error' || data.length === 0) {
				console.log("response Hata");
				onHistoryCallback([], {
					noData: true,
				});
				return;
			}
			let bars = [];
			 data.forEach(bar => {
		//		if (bar.chartData.updateTime  >= from && bar.chartData.updateTime < to) {
					bars = [...bars, {
                        time: bar.chartData.updateTime,
                        low: (bar.chartData.lowAsk + bar.chartData.lowBid)/2 ,
                        high: (bar.chartData.highAsk + bar.chartData.highBid)/2 ,
                        open: (bar.chartData.openAsk + bar.chartData.openBid)/2,
                        close: (bar.chartData.closeAsk + bar.chartData.closeBid)/2,
					}];
		//		}
			});
			if (firstDataRequest) {
				lastBarsCache.set(symbolInfo.full_name, {
					...bars[bars.length - 1],
				});
			}
			console.log(`[getBars]: returned ${bars.length} bar(s)`);
			onHistoryCallback(bars, {
				noData: false,
			});
		} catch (error) {
			console.log('[getBars]: Get error', error);
			onErrorCallback(error);
		}
    },
    subscribeBars : async (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
        Helper.consoloYaz('[subscribeBars]: Method call with subscribeUID:' + subscribeUID, true); 
        subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback,lastBarsCache.get(symbolInfo.full_name))
    },
    unsubscribeBars :  (subscriberUID) => {
        Helper.consoloYaz('[unsubscribeBars]: Method call with subscribeUID:' + subscriberUID, true); 
        unsubscribeFromStream(subscriberUID)
    },
    /*
    calculateHistoryDepth : (resolution, resolutionBack, intervalBack) => {
        //optional
        Helper.consoloYaz("==== calculateHistoryDepth ====",false); 
       return resolution < 60 ? { resolutionBack: 'D', intervalBack: '1' } : undefined
    }
    
    getMarks : (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
        //optional
        Helper.consoloYaz("==== getMarks ====",false); 
    },
    getTimeScaleMarks : (symbolInfo, startDate, endDate, onDataCallback, resolution) =>{
        //optional
        Helper.consoloYaz("==== getTimeScaleMarks ====",false); 
    },
    getServerTime: (cb) => {
        Helper.consoloYaz("==== getServerTime " + cb ,false); 
    }
    */
};