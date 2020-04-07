export const username = 'test2';
export const password = '';
export const socketUsername = 'user';
export const socketPassword = 'password';
export const socketUrl = "ws://10.34.10.209:61615";
export const restUrl = "http://10.34.10.207:8080/rest/products";
export const ourExchanges = [{ value: 'Arbitrage', name: 'Arbitrage', desc: 'Arbitrage' }];
export const ourSymbols = [];
export const ourCurrency = [{ name: "Currency", value: "Currency" }];
export const ourSymbolsChannel = [];
export const supportedResolutions = ["1", "3", "5", "15", "30", "60", "D", "W","M"];


export const ourConfig = {
    supported_resolutions: supportedResolutions,
    exchanges: ourExchanges,
    symbols_types: ourCurrency
    // supports_marks: false,
    // supports_timescale_marks: true,
    // supports_time:true
};

export function getOurExchanges() {
    getProducts().then(
        json => {
            parseProductsToExcahnge(json);
        }).catch(err => { return err; });
}

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

export function calculateNextBarTime(barTime,resolution) {
    let date = new Date(barTime * 1000);
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
  
    return date.getTime() / 1000;
   
}

function getDateWithResoulution(date,resolution){
    let minutes,d;

    switch (resolution) {
        case "1":
            minutes = 1 * 60 * 1000; // convert 1 minutes to milliseconds
            d = new Date(date.getTime() + minutes);
            return d; 
        case "3":
            minutes = 3 * 60 * 1000; // convert 3 minutes to milliseconds
            d = new Date(date.getTime() + minutes);
            return d;      
        case "5":
            minutes = 5 * 60 * 1000; // convert 5 minutes to milliseconds
            d = new Date(date.getTime() + minutes);
            return d;   
        case "10":
            minutes = 10 * 60 * 1000; // convert 10 minutes to milliseconds
            d = new Date(date.getTime() + minutes);
            return d; 
        case "15":
            minutes = 15 * 60 * 1000; // convert 15 minutes to milliseconds
            d = new Date(date.getTime() + minutes);
            return d; 
        case "30":
            minutes = 30 * 60 * 1000; // convert 30 minutes to milliseconds
            d = new Date(date.getTime() + minutes);
            return d;
        case "60":
            minutes = 60 * 60 * 1000; // convert 15 minutes to milliseconds
            d = new Date(date.getTime() + minutes);
            return d;
        case "1D":
            minutes = 24 * 60 * 60 * 1000; // convert 15 minutes to milliseconds
            d = new Date(date.getTime() + minutes);
            return d;
        case "1W":
            minutes = 7 * 24 * 60 * 60 * 1000; // convert 15 minutes to milliseconds
            d = new Date(date.getTime() + minutes);
            return d;
        case "1M":
            minutes = 30 * 24 * 60 * 60 * 1000; // convert 15 minutes to milliseconds
            d = new Date(date.getTime() + minutes);
            return d;
    }
}




export function calculateTime(barTime) {
    const date = new Date(barTime * 1000);
    date.setHours(date.getHours() + 3);
    return date.getTime() / 1000;
}


export function findChannel(symbol) {
    const res = ourSymbolsChannel.filter(s => {
        const isSymbol = s.symbol.toLowerCase().indexOf(symbol.toLowerCase()) !== -1;
        return isSymbol;
    })
    return res[0].channel;
}


export function findProductId(symbol) {
    const res = ourSymbolsChannel.filter(s => {
        const isSymbol = s.symbol.toLowerCase().indexOf(symbol.toLowerCase()) !== -1;
        return isSymbol;
    })
    return res[0].pId;
}


export function findSymbol(symbol) {
    const res = ourSymbolsChannel.filter(s => {
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


async function getProducts() {
    let headers = new Headers();
    headers.append('Content-Type', 'text/json');
    headers.append('username', username);
    try {
        const response = await fetch(restUrl, { method: 'GET', headers: headers });
        return response.json();
    } catch (error) {
        throw new Error(` servicium request : ${error.status}`);
    }
}

function parseProductsToExcahnge(prods) {
    var obj = prods;
    var products = obj.products;
    var synthetic = obj.syntheticProducts;
    for (let index in products) {
        let prodObj = products[index];
        let product = prodObj.product;
        if (product.channelName != null || typeof product.channelName !== "undefined") {
            createSymbols(product);
        }

    }
    for (let index in synthetic) {
        let syntObj = synthetic[index];
        let product = syntObj.syntheticProduct;
        if (product.channelName != null || typeof product.channelName !== "undefined") {
            createSymbols(product);
        }

    }
}


function createSymbols(product) {
    var symb = { symbol: product.symbol, full_name: product.symbol, description: product.descriptionTR, ticker: product.symbol, type: ourCurrency[0].name };
    ourSymbols.push(symb);
    createChannel(product);
}

function createChannel(product) {
    var channel = { symbol: product.symbol, pId: product.productId, channel: '/topic/' + product.channelName };
    ourSymbolsChannel.push(channel);
}



