import HistoryProvider from './history';
import * as Helper from './helper';
import {subscribeOnStream,unsubscribeFromStream} from './stream';

export default class OurDataFeed {
    onReady(cb) {
        Helper.consoloYaz("==== onReady call ====",false);
        setTimeout(() => cb(Helper.ourConfig), 0)
    }
    searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
        Helper.consoloYaz("==== searchSymbols call ====",false);
       
        // console.log(' Search Symbols :' + userInput);
        // console.log(' Exchange = ' + exchange);
        // console.log(' SymbolType = ' + symbolType);
        const newSeymbols = Helper.ourSymbols.filter(symbol => {
            const isFullSymbolContainsInput = symbol.full_name
                .toLowerCase()
                .indexOf(userInput.toLowerCase()) !== -1;
            return isFullSymbolContainsInput;
        });
        setTimeout(function () {
            onResultReadyCallback(newSeymbols);
        }, 0);
    }
    resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {

        var symbol_stub = {
            name: symbolName,
            ticker: symbolName,
            format: 'price',
            description: symbolName,
            type: 'Currency',
            session: '24x7',
            timezone:  'Europe/Istanbul',
            exchange: 'Arbitrage',
            minmov: 1,
            pricescale: 100000, //dynamic
            has_no_volume: true,
            //has_weekly_and_monthly: false,
            minmov2: 0,
            //    fractional: false,
            has_intraday: true,
            intraday_multipliers: ["1", "60"],
            supported_resolution: Helper.supportedResolutions,
               has_seconds: false,
               seconds_multipliers: [],
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

        setTimeout(function () {           
            onSymbolResolvedCallback(symbol_stub);
        }, 0);

        setTimeout(function () {
            onResolveErrorCallback();
        }, 0);

    }
    getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest)  {
        Helper.consoloYaz("==== getBars call ====",false); 
        HistoryProvider.getBars(symbolInfo, resolution, from, to, firstDataRequest).then(
            bars => {
                if (bars != null) {
                    onHistoryCallback(bars, { noData: false })
                } else {
                    onHistoryCallback(bars, { noData: true })
                }
            }
        ).catch(err => console.log('Hata'));
    }
    subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) {
        Helper.consoloYaz("==== subscribeBars ====",false); 
        subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback)
    }
    unsubscribeBars(subscriberUID) {
        Helper.consoloYaz("==== unsubscribeBars ====",false); 
        unsubscribeFromStream(subscriberUID)
    }
    calculateHistoryDepth(resolution, resolutionBack, intervalBack) {
        //optional
        Helper.consoloYaz("==== calculateHistoryDepth ====",false); 
        return resolution < 60 ? { resolutionBack: 'D', intervalBack: '1' } : undefined
    }
    getMarks(symbolInfo, startDate, endDate, onDataCallback, resolution) {
        //optional
        Helper.consoloYaz("==== getMarks ====",false); 
    }
    getTimeScaleMarks(symbolInfo, startDate, endDate, onDataCallback, resolution) {
        //optional
        Helper.consoloYaz("==== getTimeScaleMarks ====",false); 
    }
    getServerTime(cb) {
        Helper.consoloYaz("==== getServerTime " + cb ,false); 
    }

};