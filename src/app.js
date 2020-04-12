
import * as Helper from './helper';
import {subscribeOnStream,unsubscribeFromStream} from './stream';

const lastBarsCache = new Map();

export default {


    onReady : (callback) => {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(Helper.ourConfig));
    },
    searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
        console.log('[searchSymbols]: Method call');
     
        const newSeymbols = Helper.allProducts.filter(symbol => {
            const isFullSymbolContainsInput = symbol.full_name
                .toLowerCase()
                .indexOf(userInput.toLowerCase()) !== -1;
            return isFullSymbolContainsInput;
        });
    
        onResultReadyCallback(newSeymbols);
        
    },
    resolveSymbol: async(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {

        console.log('[resolveSymbol]: Method call', symbolName);
   
        const symbols = await Helper.getAllSymbols();
        //const symbolItem = Helper.findSymbolFromArr(symbolName,symbols);

        const symbolItem = symbols.find(({
			full_name,
        }) => full_name === symbolName);
        
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
            pricescale: Helper.getPriceScale(symbolItem.ticksize), //dynamic
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
            volume_precision: symbolItem.ticksize, //dynamic
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

			const data = await Helper.makeApiRequestForHistory(symbolInfo, resolution, from, to);
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
                nextTime: Helper.nextDays().getTime()
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
    
    calculateHistoryDepth : (resolution, resolutionBack, intervalBack) => {
        //optional
        Helper.consoloYaz("==== calculateHistoryDepth ====",false); 
        if(resolution < 30)
        return { resolutionBack: 'D', intervalBack: '5' };
        if(resolution >= 30 && resolution <= 60 ){
            return { resolutionBack: 'D', intervalBack: '5' };
        }else if(resolution === 'D'){
            return { resolutionBack: 'D', intervalBack: '10' };
        }if(resolution === 'M' ){
            return { resolutionBack: 'M', intervalBack: '30' };
        }else {
            return undefined;
        }
    }
    /*
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