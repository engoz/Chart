import * as Helper from './helper';
import HistoryProvider from './history';

var serviciumSocket = require('stompjs');
const channelToSubscription = new Map();
var socketClient;

export function  subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) {
        
        var  client  = serviciumSocket.client(Helper.socketUrl);  
             
        socketClient = client;
        var destination = Helper.findChannel(symbolInfo.name);

        let subscriptionItem = channelToSubscription.get(destination);

        const handler = {
            id: subscribeUID,
            callback: onRealtimeCallback,
        };

        if (subscriptionItem) {
            // daha once subscripe olmus
            subscriptionItem.handlers.push(handler);
            return;
        }

        var sub = {
            subscribeUID,
            resolution,
            symbolInfo,
            lastBar: HistoryProvider.history[symbolInfo.name].lastBar,
            handlers: [handler],
        };

        channelToSubscription.set(destination, sub);
        //console.log('[subscribeBars]: Subscribe to streaming. Channel:', destination);
 
        client.connect(Helper.socketUsername,Helper.socketPassword,()=>{
            client.subscribe(destination,function(message) {
                var tieredQuote = convertTiredQuote(message.body);
                var subscription = channelToSubscription.get(destination);
                if (subscription === undefined || tieredQuote.updateTime < subscription.lastBar.time / 1000 )  {
                    return;
                }
                var _lastBar = updateBar(tieredQuote,subscription);
                subscription.handlers.forEach(handler => handler.callback(_lastBar));
                subscription.lastBar = _lastBar;
                Helper.consoloYaz("****** Subscribe == " +subscribeUID,true);   
            },
            {
                id: subscribeUID,
                'activemq.retroactive': true,
            }
            
        );      
        },error_callback);
}

export function unsubscribeFromStream(subscribeUID){
    if(socketClient != null && socketClient !== 'undefined'){
        Helper.consoloYaz("****** UnSubscribe == " +subscribeUID,true);
        socketClient.unsubscribe(subscribeUID);   
    }else {
        console.log(" Client NULL " );
    } 
}


var error_callback = function(error) {
    Helper.consoloYaz("****** Subscribe error_callback == " +error,true);
};

// Take a single trade, and subscription record, return updated bar
function updateBar(tieredQuote, sub) {
    let lastBar = sub.lastBar
    let resolution = sub.resolution

    let lastBarSec = lastBar.time
    let quateTime = Helper.calculateTime(tieredQuote.updateTime);
    let nextBarTime = Helper.calculateNextBarTime(lastBarSec,resolution); 
    let _lastBar;
    console.log("NextTime : " + new Date(nextBarTime));
    console.log("QuateTime : " + new Date(quateTime));

    let midPrice = (new Number(tieredQuote.quotes.offer) + new Number(tieredQuote.quotes.bid)) /2;
    let quateVolume = tieredQuote.quotes.band;
   if ( quateTime >= nextBarTime) {
     // create a new candle, use last close as open **PERSONAL CHOICE**
     _lastBar = {
      time: nextBarTime,
      open: midPrice,
      high: midPrice,
      low: midPrice,
      close: midPrice,
      volume: quateVolume
     }
     
    } else {
     // update lastBar candle!
     //if (tieredQuote.quotes.bid< lastBar.low) {
     // lastBar.low = tieredQuote.quotes.bid
     //} else if (tieredQuote.quotes.bid > lastBar.high) {
     // lastBar.high = tieredQuote.quotes.bid;
     //}
     lastBar.low = Math.min(lastBar.low, midPrice);
     lastBar.high = Math.max(lastBar.high, midPrice);
     lastBar.volume = quateVolume;
     lastBar.close  = midPrice;
     _lastBar = lastBar;
    }

    Helper.consoloYaz("PRİCE  == " +_lastBar.close + " | " + _lastBar.high, + " | " + _lastBar.low, true);
    return _lastBar
   }
   



function convertTiredQuote(obj){
    var tieredQuote = parseQuate(obj)
  //  console.log(tieredQuote.symbol +" "+ tieredQuote.quotes.band +" " + tieredQuote.quotes.bid +" " + tieredQuote.quotes.offer )
    return tieredQuote;
}


function parseQuate(obj) {
    var array = obj.split("|");
    
    var tieredQuote = {
        symbol : array[0],
        productId : array[1],
        brokerId : array[2],
        updateTime : Helper.calculateTime(array[3]),
        valueDate : array[4],  //valueDate != null ? valueDate.getTime() : 0
        indicative : array[5], //indicative ? "1" : "0"
        calculated : array[6], //calculated ? "1" : "0"
        quotes : convertQuote(array[7]),
        referenceIds : array[8],
        tenor : array[9]
    };

    return tieredQuote;
    
}

function convertQuote(obj){
    var array = obj.split(",");  
    var quote = {};
    var  i = 0;
    array.forEach(element => {
        if(i==0){
            quote.band = element;
        } else if(i==1){
            quote.bid = element;      
        }else if(i==2){
            quote.offer = element;
        } 
        i++;
    });
    
    return quote;
}

