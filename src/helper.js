export const username = 'test2';
export const password = '';
export const socketUsername = 'user';
export const socketPassword = 'password';
//export const socketUrl = "ws://213.128.89.179:61612";
//export const restUrl = "http://213.128.89.179:7532/rest/products";
export const socketUrl = "ws://10.34.10.209:61615";
export const restUrl = "http://10.34.10.207:8080/rest/products";
export const allExchanges = [{ value: 'Arbitrage', name: 'Arbitrage', desc: 'Arbitrage' }];
export const allProducts = [];
export const symbolTypes = [{name: 'Currency',value: 'Currency'}];
export const supportedResolutions = ["1", "3", "5", "15", "30", "60", "D", "W","M"];
export const one_day =1000*60*60*24;

export async function makeApiRequestForHistory(symbolInfo, resolution, from, to) {
	try {

        let productId = findProductId(symbolInfo.name);
        let toDate = calculateTime2(to);
        let fromDate = calculateTime2(from);

        let diff = toDate - fromDate;

        let days = Math.round(diff/one_day);
                   
        console.log("toDate : " + new Date(toDate));
        console.log("FromDate : " + new Date(fromDate));
        
        let frequency = getFrequency(resolution);	

        let history_url = restUrl + "/" + productId + "/chartData/"+frequency+ "/"+ fromDate+"/"+toDate;
        let headers = new Headers();
        headers.append('Content-Type', 'text/json');
        headers.append('username', username);
        var start = new Date().getTime();    
		const response = await fetch(history_url, { method: 'GET', headers: headers });
        let jsonData = response.json();
        var end = new Date().getTime();
        console.log("Historical Data Api Call Time = " + (end - start));
        return jsonData;
	} catch (error) {
		throw new Error(`Historical Data request error: ${error.status}`);
	}
}


async function makeApiRequestAllProducts() {
    let headers = new Headers();
    headers.append('Content-Type', 'text/json');
    headers.append('username', username);
    try {
        const response = await fetch(restUrl, { method: 'GET', headers: headers });
        const jsonData = response.json();
        return jsonData;
    } catch (error) {
        throw new Error(` servicium request : ${error.status}`);
    }
}

export async function getAllSymbols() {
    //
    const data = await makeApiRequestAllProducts();
    const symbols = parseResultProducts(data);
    return symbols;
}

export const ourConfig = {
    supported_resolutions: supportedResolutions,
    exchanges: allExchanges,
    symbols_types: symbolTypes
    // supports_marks: false,
    // supports_timescale_marks: true,
    // supports_time:true
};


export function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export function getFrequency(resolution) {
    switch (resolution) {
        case "1":
            return 'ONE_MINUTE';      
        case "3":
            return 'THREE_MINUTES';         
        case "5":
            return 'FIVE_MINUTES';
        case "10":
            return 'TEN_MINUTES';
        case "15":
            return 'FIFTEEN_MINUTES';
        case "30":
            return 'THIRTY_MINUTES';
        case "60":
            return 'ONE_HOUR';
        case "D":
            return 'ONE_DAY';
        case "W":
            return 'ONE_WEEK';
        case "M":
            return 'ONE_MONTH';
        default:
            return 'TICK_BY_TICK';
    }
}

export function nextDays(){
    var date = new Date();
    console.log(date);
    var d = date.getDay();
    if (d == 1) {
        date.setDate(date.getDate() -3);
    }else {
        if(d != 0 || d != 6 ){
            date.setDate(date.getDate() -1);
        } 
    }
    date.setHours(23, 59, 59, 999);
    return date;
}


export function calculateNextBarTime(barTime,resolution) {
    const date = new Date(barTime);
    //date.setHours(date.getHours() + 3);
    switch (resolution) {
        case "1":
            date.setMinutes(date.getMinutes() + 1);
            break;   
        case "3":
            date.setMinutes(date.getMinutes() + 3);
            break;        
        case "5":
            date.setMinutes(date.getMinutes() + 5);
            break; 
        case "10":
            date.setMinutes(date.getMinutes() + 10);
            break; 
        case "15":
            date.setMinutes(date.getMinutes() + 15);
            break; 
        case "30":
            date.setMinutes(date.getMinutes() + 30);
            break; 
        case "60":
            date.setHours(date.getHours() + 1);
            break; 
        case "1D":
            date.setDate(date.getDate() + 1);
            break; 
        case "1W":
            date.setDate(date.getDate + 7);
            break; 
        case "1M":
            date.setDate(date.getDate() + 30);
            break; 
    }
    //date.setHours(date.getHours() + 3);
    return date.getTime();
   
}

export function calculateBeforeBarTime(barTime,resolution) {
    const date = new Date(barTime);
    //date.setHours(date.getHours() + 3);
    switch (resolution) {
        case "1":
            date.setMinutes(date.getMinutes() - 1);
            break;   
        case "3":
            date.setMinutes(date.getMinutes() - 3);
            break;        
        case "5":
            date.setMinutes(date.getMinutes() - 5);
            break; 
        case "10":
            date.setMinutes(date.getMinutes() - 10);
            break; 
        case "15":
            date.setMinutes(date.getMinutes() - 15);
            break; 
        case "30":
            date.setMinutes(date.getMinutes() - 30);
            break; 
        case "60":
            date.setHours(date.getHours() - 1);
            break; 
        case "1D":
            date.setDate(date.getDate() - 1);
            break; 
        case "1W":
            date.setDate(date.getDate - 7);
            break; 
        case "1M":
            date.setDate(date.getDate() - 30);
            break; 
    }
    //date.setHours(date.getHours() + 3);
    return date.getTime();
   
}

export function getPriceScale(ticksize){
    let scale = 1;
    let multiplier = 10;
    for(let i=0; i<=ticksize; i++){
        scale = scale * multiplier;
    }
    return scale;
}

export function calculateTime2(barTime) {
    const date = new Date(barTime *1000);
    date.setHours(date.getHours() + 3);
    return date.getTime();
}

export function calculateTime(barTime) {
    const date = new Date(barTime *1000);
    date.setHours(date.getHours() + 3);
    return date.getTime() /1000;
}

export function findProductId(symbolName) {
    const symbolItem = allProducts.find(({
        full_name,
    }) => full_name === symbolName);
    return symbolItem.productId;
}

export function findProductIdOld(symbol) {
    const res = allProducts.filter(s => {
        const isSymbol = s.symbol.toLowerCase().indexOf(symbol.toLowerCase()) !== -1;
        return isSymbol;
    })
    return res[0].productId;
}

export async function findSymbolFromArr(symbolName, symbols) {
    const res = symbols.filter(s => {
            const isSymbol = s.symbol.toLowerCase().indexOf(symbolName.toLowerCase()) !== -1;
            return isSymbol;   
    })
    return res[0];
    
}


export async function findSymbol(symbol) {
    const res = allProducts.filter(s => {
            const isSymbol = s.symbol.toLowerCase().indexOf(symbol.toLowerCase()) !== -1;
            return isSymbol;   
    })
    return res[0];
    
}


export function consoloYaz(mesaj, tick) {
    if (tick) {
        console.log(mesaj);
    }
}

function parseResultProducts(prods) {
    var obj = prods;
    var products = obj.products;
    var synthetic = obj.syntheticProducts;
    allProducts.length = 0;
    for (let index in products) {
        let prodObj = products[index];
        let product = prodObj.product;
        let arb;
        if (product.channelName != null || typeof product.channelName !== "undefined") {
         arb = parseSymbols(product);
        }
        if(arb !== undefined){
        allProducts.push(arb);
        }
    }
    for (let index in synthetic) {
        let syntObj = synthetic[index];
        let product = syntObj.syntheticProduct;
        let synt;
        if (product.channelName != null || typeof product.channelName !== "undefined") {
        synt = parseSymbols(product);
        }
        if(synt !== undefined){
        allProducts.push(synt);
        }
    }
    return allProducts;
}


function parseSymbols(product) {
    var symb = { 
        symbol: product.symbol, 
        full_name: product.symbol, 
        description: product.descriptionTR, 
        ticker: product.symbol, 
        ticksize:product.tickSize, 
        type: symbolTypes[0].name,
        productId: product.productId, 
        channel: '/topic/' + product.channelName };
    return symb;
}


/*
export const ourSymbols = [
        {
            symbol: "EUR/TRY",
            full_name: "EUR/TRY",
            description: "EURO TURKISH LIRA",
            ticker:"EUR/TRY",
            type:"Currency",
            productId: 7008,
            exchanges:'Arbitrage',
        },
        {
            symbol: "EUR/USD",
            full_name: "EUR/USD",
            description: "EURO DOLAR",
            ticker:"EUR/USD",
            type:"Currency",
            productId: 7009,
            exchanges:'Arbitrage',
            },
            {
            symbol: "USD/TRY",
            full_name: "USD/TRY",
            description: "USD TURKISH LIRA",
            ticker:"USD/TRY",
            type:"Currency",
            exchanges:'Arbitrage',
            productId: 7007,
            }
];
*/
