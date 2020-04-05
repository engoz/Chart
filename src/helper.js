let restUrl = 'http://10.34.10.207:8080/rest/products';

let username = 'test2';
let password = '';
export const socketUsername = 'user';
export const socketPassword = 'password';
export const socketUrl = "ws://10.34.10.209:61615";
export const ourExchanges = [{value:'Arbitrage', name:'Arbitrage',desc:'Arbitrage'}];
export const ourSymbols = [];
export const ourCurrency = [{ name: "Currency", value: "Currency" }];
export const ourSymbolsChannel = [];
export const supportedResolutions = ["1", "3", "5", "15", "30", "60", "120", "240", "D"];


export const ourConfig = {
    supported_resolutions: supportedResolutions,
    exchanges: ourExchanges,
    symbols_types: ourCurrency
    // supports_marks: false,
    // supports_timescale_marks: true,
    // supports_time:true
};

export function getOurExchanges(){
        getProducts().then(
                json => {
                        parseProductsToExcahnge(json);
                }).catch(err => {return err;});     
}

export function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


export function barTime(barTime) {
	const date = new Date(barTime * 1000);
	date.setHours(date.getHours() + 3);
	return date.getTime() / 1000;
}

export function findChannel(symbol){
    const res = ourSymbolsChannel.filter(s => {
        const isSymbol = s.symbol.toLowerCase().indexOf(symbol.toLowerCase()) !== -1;
        return isSymbol;
    } )
    return res[0].channel;
}

export function consoloYaz(mesaj, tick){
    if(tick){
        console.log(mesaj);
    }
}


async function getProducts(){
    let headers = new Headers();   
    headers.append('Content-Type', 'text/json');
    headers.append('username', username);     
    try {
    const response = await fetch(restUrl, {method:'GET',headers: headers,});
    return response.json();
    }catch(error){
            throw new Error(` servicium request : ${error.status}`);     
    }        
}

function parseProductsToExcahnge(prods){
        var obj = prods;
        var products = obj.products;
        var synthetic = obj.syntheticProducts;
        for(let index in products){ 
                let prodObj = products[index];
                let product = prodObj.product;
                if(product.channelName != null || typeof product.channelName !== "undefined" ){
                    createSymbols(product);   
                }
                  
        }
        for(let index in synthetic){ 
                let syntObj = synthetic[index];
                let product = syntObj.syntheticProduct;   
                if(product.channelName != null || typeof product.channelName !== "undefined" ){
                    createSymbols(product);
                }
                       
         }
}


function createSymbols(product){
        var symb = {symbol:product.symbol, full_name:product.symbol,description:product.descriptionTR,ticker:product.symbol,type:ourCurrency[0].name};
        ourSymbols.push(symb);
        createChannel(product);
}

function createChannel(product){
        var channel = {symbol:product.symbol, pId:product.productId, channel:'/topic/'+product.channelName};
        ourSymbolsChannel.push(channel);
}



