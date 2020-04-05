import * as Helper from './helper';
export default {

	history: history,

	getBars: (symbolInfo, resolution, from, to, first, limit) => {
		Helper.consoloYaz("==== **** GetBars cagrildi **** ====",false); 
		return new Promise((resolve, reject) => {
			fetch("history.json").
				then(response => response.json()).then(data => {
					if (data && data === 'undefined') {
						console.error('Arbitarage Error')
						return []
					}
					
				//	var date = new Date();
				//	var yesterday = date.setDate(date.getDate() - 1);	
					if (data.length > 0) {
						var bars = data.map(bar => {
						//	if (bar.time >= from && bar.time < to) {
								bars = {
									time: Helper.barTime(bar.time),
									low: bar.low,
									high: bar.high,
									open: bar.open,
									close: bar.close,
									volume: bar.volume
								}
								return bars;
						//	}
						})
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
