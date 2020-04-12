import * as Helper from './helper';

var serviciumSocket = require('stompjs');
const channelToSubscription = new Map();

const subscriptionMap = new Map();
export async function subscribeOnStream (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback,lastBar) {
        
        
        let  client  = serviciumSocket.client(Helper.socketUrl); 
        let symbol = await Helper.findSymbol(symbolInfo.name);

        let destination = symbol.channel;
        const handler = {
            id: subscribeUID,
            callback: onRealtimeCallback,
        };

        let subscriptionItem = channelToSubscription.get(subscribeUID);

        if (subscriptionItem) {
            // daha once subscripe olmus
            subscriptionItem.handlers.push(handler);
            return;
        }

        subscriptionItem = {
            subscribeUID,
            resolution,
            symbolInfo,
            lastBar,
            handlers: [handler],
        };

        channelToSubscription.set(subscribeUID, subscriptionItem);
        //console.log('[subscribeBars]: Subscribe to streaming. Channel:', destination);
 
        client.connect(Helper.socketUsername,Helper.socketPassword,()=>{
            var subscription = client.subscribe(destination,function(message) {
                var tieredQuote = convertTiredQuote(message.body);
                var subscriptionSymbol = channelToSubscription.get(subscribeUID);
                if (subscriptionSymbol === undefined)  {
                    return;
                }
              //  var bar = updateBar(tieredQuote, subscription);

                // ---------- Begin Calculate Bar --------------- //
                
                let lastBar = subscriptionSymbol.lastBar
                const quateTime = tieredQuote.updateTime;
                
                if(lastBar === undefined || lastBar.time === undefined){
                    lastBar = {time:quateTime};
                }

                let beforeTime = Helper.calculateBeforeBarTime(quateTime,resolution);

                if(lastBar.time <= beforeTime ){
                    lastBar.time = quateTime;
                }
                
                const nextBarTime = Helper.calculateNextBarTime(lastBar.time,resolution);
                console.log("LastTime : " + new Date(lastBar.time));
                console.log("NextTime : " + new Date(nextBarTime));
                console.log("QuateTime : " + new Date(quateTime));
            
                const midPrice = (new Number(tieredQuote.quotes.offer) + new Number(tieredQuote.quotes.bid)) /2;
                const quateVolume = tieredQuote.quotes.band;
                let bar;    

               if ( quateTime >= nextBarTime) {
                 // create a new candle, use last close as open **PERSONAL CHOICE**
                bar = {
                  time: nextBarTime,
                  open: midPrice,
                  high: midPrice,
                  low: midPrice,
                  close: midPrice,
                  volume: quateVolume
                 }
                 console.log('[socket] Generate new bar', bar);
                 
                } else {
                    bar = {
                        ...lastBar,
                        high: Math.max(lastBar.high, midPrice),
                        low: Math.min(lastBar.low, midPrice),
                        close: midPrice,
                    };
                    console.log('[socket] Update the latest bar by price', midPrice);
                }
            

                // ---------- End Calculate Bar ----------------- //


                subscriptionSymbol.lastBar = bar;
                subscriptionSymbol.handlers.forEach(handler => handler.callback(bar));

            },
            {
                id: subscribeUID,
                'activemq.retroactive': true,
            }
            
        );  
        
        subscriptionMap.set(subscribeUID,subscription);

        },error_callback);
}

var error_callback = function(error) {
    Helper.consoloYaz("****** Subscribe error_callback == " +error,true);
};


export function unsubscribeFromStream(subscribeUID){
    //let socketClient = socketClient.get('client');
    
    let subscripe = subscriptionMap.get(subscribeUID);
    if(subscripe){
        Helper.consoloYaz("****** UnSubscribe == " +subscribeUID,true);

        subscripe.unsubscribe();
        subscriptionMap.delete(subscribeUID);
        
  
    }else {
        console.log(" Client NULL " );
    } 
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

