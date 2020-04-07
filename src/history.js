import * as Helper from './helper';
export default {

	history: history,

	getBars: (symbolInfo, resolution, from, to, first, limit) => {
		Helper.consoloYaz("==== **** GetBars cagrildi **** ====", false);
		return new Promise((resolve, reject) => {

			let productId = Helper.findProductId(symbolInfo.name);
			var toDate = Helper.calculateTime(to);
			var fromDate = Helper.calculateTime(from);
			var days = 25;
			
			let frequency = Helper.getFrequency(resolution);	

			let history_url = Helper.restUrl + "/" + productId + "/chartData/"+frequency+ "/"+ 100;
			let headers = new Headers();
			headers.append('Content-Type', 'text/json');
			headers.append('username', Helper.username);
		
			fetch(history_url, { method: 'GET', headers: headers }).
				then(response => response.json()).then(data => {
					if (data && data === 'undefined') {
						console.error('Arbitarage Error')
						return []
					}

					if (data.length > 0) {
						var bars = data.map(bar => {
							//	if (bar.time >= from && bar.time < to) {
							var b = {
								time: Helper.calculateTime(bar.chartData.updateTime),
								low: (bar.chartData.lowAsk + bar.chartData.lowBid)/2 ,
								high: (bar.chartData.highAsk + bar.chartData.highBid)/2 ,
								open: (bar.chartData.openAsk + bar.chartData.openBid)/2,
								close: (bar.chartData.closeAsk + bar.chartData.closeBid)/2,
								volume: 0
							}
							return b;
							//	}
						});
						if (first) {
							var lastBar = bars[bars.length - 1]
							history[symbolInfo.name] = { lastBar: lastBar }
						}
						resolve(bars);
					} else {
						resolve([]);
					}
				})
				.catch(err => reject(err));
		});

	}
};
