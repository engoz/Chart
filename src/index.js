import DataFeed from './app';
import * as Helper from './helper';

var sembol = 'USD/TRY';

async function initOnReady() {

    

    var widget = window.tvWidget = new TradingView.widget({
        // debug: true, // uncomment this line to see Library errors and warnings in the console
        fullscreen: true,
        autosize: true,
        symbol: sembol,
        interval: '1',
        container_id: "tv_chart_container",
        debug: true,
        //	BEWARE: no trailing slash is expected in feed URL
        //datafeed: new Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
        datafeed: DataFeed,
        library_path: "charting_library/",
        locale: Helper.getParameterByName('lang') || "en",
        timezone: 'Europe/Istanbul',
        //disabled_features: ["display_market_status"],
        //disabled_features: ["use_localstorage_for_settings"],
        //enabled_features: ['study_templates'],
        supported_resolutions: Helper.supportedResolutions,
        //charts_storage_url: 'http://saveload.tradingview.com',
        //charts_storage_api_version: "1.1",
        client_id: 'tradingview.com',
        user_id: 'public_user_id',
        studiesOverrides: {},
  //      locale: "tr", denemek lazim
        overrides: {
            // "mainSeriesProperties.showCountdown": true,
            "paneProperties.background": "#131722",
            "paneProperties.vertGridProperties.color": "#363c4e",
            "paneProperties.horzGridProperties.color": "#363c4e",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": "#AAA",
            "mainSeriesProperties.candleStyle.wickUpColor": '#336854',
            "mainSeriesProperties.candleStyle.wickDownColor": '#7f323f',
        },
        theme: Helper.getParameterByName('theme'),
    });
};

window.addEventListener('DOMContentLoaded', initOnReady, true);