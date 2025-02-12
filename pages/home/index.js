import { useEffect, useState } from 'react';
// import { MarketData } from 'react-tradingview-embed';
import { useRouter } from 'next/router';
import Head from 'next/head';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import MainLayout from '../../layouts/MainLayout';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import CooperativePartners from '../../components/Widgets/CooperativePartners/CoopPartners';
import EventCarousel from '../../components/Widgets/Homescreen/EventCarousel';
import {isNil, orderBy} from "lodash";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// import JSONDATA from './data.json';

const arrow = {
  position: 'relative',
  right: '7px'
};

const arrowdown = {
  position: 'absolute',
  cursor: 'pointer',
  bottom: '-8px',
};

const selectedArrowDown = {
  position: 'absolute',
  cursor: 'pointer',
  bottom: '-8px',
  color: 'black',
};

const arrowup = {
  position: 'absolute',
  cursor: 'pointer',
  top: '-5px',
};

const selectedArrowUp = {
  position: 'absolute',
  cursor: 'pointer',
  top: '-5px',
  color: 'black',
};

const reduceDecimal = (item) => {
  let dnum = item < 0 ? item - Math.ceil(item) : item - Math.floor(item);
  let num = item - dnum;
  let str = dnum < 0 ? String(dnum).slice(3) : String(dnum).slice(2);
  let array = str.split('');
  let index = 0;
  let value = '';
  let result = 0;
  if(array.length != 0){
    for(var i = 0 ; i < array.length; i++){
      if(array[i] != 0) {
        index = i;
        break;
      }else {
        index = 0;
      }
    }
  } else {
    // return item+'.00';
  }
  
  
  if(num <= 0){
    item = String(item);
    if(!item.includes('e')){
      for (var j = index; j < index + 3; j++) {
        value += '' + (array[j] != null ? array[j] : '');
      }

      var lll = '';
      for(var l = 0; l < index; l++){
        lll += '0';
      }
      result = num + '.' + lll + value;
      item = parseFloat(result);
    } else {
      item = item;
    }
      
  } else {
    for (var k = index; k < index + 2; k++) {
      value += '' + (array[k] != null ? array[k] : '');
    }
    result = num + '.' + value;
    item = parseFloat(result);
  }
  return item;
}


// eslint-disable-next-line react/jsx-props-no-spreading
const renderTooltip = (props) => <Tooltip {...props} className="tooltip-area tooltipArea">
  <table className='hover-table'>
    <thead>
      <tr>
        <th>Pair</th>
        <th>Price</th>
        <th>Change</th>
        <th>24H Volume</th>
      </tr>
    </thead>
    <tbody>
      {props !== undefined && props.map(item=>(
          <tr>
            <td>{item.display}</td>
            <td>{item.c}</td>
            <td className={'trading-change ' + (item.P > 0 ? 'green': (item.P == '0.00' ? 'gray':'red'))} >{item.P > 0 ? '+' : ''}{item.P}</td>
            <td>{item.p}</td>
          </tr>
        ))}
    </tbody>
  </table>
</Tooltip>;

export default function HomeScreen() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const CRYTOCOMPARE_API_KEY = '22ecd4c3d9ba9629fe8555875cb826598533e729ef38e46af033f4f6fdec2802';
  const [sortkey, setSortKey] = useState('');
  const [sortorder, setSortOrder] = useState('');
  const [loaded, setLoaded] = useState(false);

  const trade_data = new Map([
    ["ETHUSD", "Ethereum"],
    ["BTCUSD", "Bitcoin"], 
    ["GALAUSDT", "Gala"], 
    ["SHIBUSDT", "Shiba Inu"], 
    ["DOTUSDT", "Polkadot"]
  ]); 

  const trade_strong_data = new Map([
    ["ETHUSD", "ETH"],
    ["BTCUSD", "BTC"], 
    ["GALAUSDT", "GALA"], 
    ["SHIBUSDT", "SHIB"], 
    ["DOTUSDT", "DOT"]
  ])

  const trading_init = [
    {
      image: 'https://icons-for-free.com/iconfiles/png/512/btc+coin+crypto+icon-1320162856490699468.png',
      name: 'BTCUSD',
      pair: [
        {name: 'BTCUSDT', display: 'BTC/USDT'},
        {name: 'BTCUSDC', display: 'BTC/USDC'},
      ]
    },
    {
      image: "https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/ETH_1_LOGO.png",
      name: 'ETHUSD',
      pair: [
        {name: 'ETHUSDT', display: 'ETH/USDT'},
        {name: 'ETHUSDC', display: 'ETH/USDC'},
        {name: 'ETHBTC', display: 'ETH/BTC'},
      ]
    },
    {
      image: 'https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/SHIB_LOGO.png',
      name: 'SHIBUSDT',
      pair: [
        {name: 'SHIBUSDT', display: 'SHIBU/USDT'},
        {name: 'SUSHIBNB', display: 'SHIBU/BNB'},
      ]
    },
    {
      image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png?1639712644',
      name: 'DOTUSDT',
      pair: [
        {name: 'DOTUSDT', display: 'DOT/USDT'},
        {name: 'DOTBTC', display: 'DOT/BTC'},
      ]
    },
    {
      image: 'https://assets.coingecko.com/coins/images/12493/large/GALA-COINGECKO.png?1600233435',
      name: 'GALAUSDT',
      pair: [
        {name: 'GALABTC', display: 'GALA/BTC'},
        {name: 'GALABNB', display: 'GALA/BNB'},
      ]
    }
  ]
  const [trading, setTrading] = useState(trading_init);
  const [height, setHeight] = useState(0);

  const marketChartProps = {
    width: '100%',
    marginLeft: 100,
    height: 350,
    symbolsGroups: [
      {
        name: 'Coins',
        originalName: 'Indices',
        symbols: [
          {
            name: 'COINBASE:ETHUSD',
          },
          {
            name: 'BITSTAMP:BTCUSD',
          },
          {
            name: 'BINANCE:SHIBUSDT',
          },
          {
            name: 'BINANCE:DOTUSDT',
          },
          {
            name: 'BINANCE:GALAUSDT',
          },
        ],
      },
    ],
    showSymbolLogo: true,
    colorTheme: 'light',
    isTransparent: false,
    locale: 'en',
  };

  useEffect(()=>{

  }, []);

  useEffect(() => {
    const localToken = localStorage.getItem('token');
    setToken(localToken);

    const trading_list = ['ETHUSDT', 'BTCUSDT', 'SHIBUSDT', 'DOTUSDT', 'GALAUSDT'];

    // if (!localToken) {
    //   router.push('/');
    // }

    const url = 'wss://stream.binance.com:9443/stream?streams=!ticker@arr@3000ms';
    const isBrowser = typeof window !== "undefined";
    const ws = isBrowser ? new WebSocket(url) : null;
    if (!isNil(ws)) {
      ws.onopen = (event) => {
      };
      ws.onclose = function (eventclose) {
      };

      ws.onmessage = function (event) {
        const json = JSON.parse(event.data);

      // var json = JSONDATA;
        try {
          if (json.data !== undefined) {
            const json_data = json.data;
            window.sessionStorage.setItem("market_websocket", JSON.stringify(json_data));
            trading_list.map(item=>{
              const find_data = json_data.find(x=>x.s == item);
              if (find_data !== undefined) {
                const find_index = trading.findIndex(x=>find_data.s.includes(x.name));
                // console.log("Find Index : " + find_index);
                if (find_index > -1) {
                  const now_time = new Date().getTime();
                  if ((now_time % 4 == 0 && trading[find_index].s !== undefined) || trading[find_index].s === undefined) {
                    Object.keys(find_data).map(key=>{
                      if (!loaded) setLoaded(true);
                      trading[find_index][key] = parseFloat(find_data[key]);
                      console.log(trading[find_index][key]);
                    });
                  }
                  const pair = trading[find_index].pair;
                  if (pair !== undefined) {
                    pair.map((pair_item, pair_index)=>{
                      const pair_find_data = json_data.find(x=>x.s === pair_item.name);
                      if (pair_find_data !== undefined) {
                        Object.keys(pair_find_data).map(key=>{
                          pair[pair_index][key] = reduceDecimal(pair_find_data[key]);
                        });
                      }
                    });
                  }
                }
              }
              setTrading([...trading]);
            });
          }
        } catch (err) {
          console.log(err);
        }
      };
    }

    document.body.setAttribute('style', 'min-width: auto;');
  }, []);

  const sort = (key, order) =>{
    // if (key === sortkey && order === sortorder) {
    //   setSortKey('');
    //   setSortOrder('');
    // } else {
      // setSortKey(key)
      // setSortOrder(order);
      setSortKey(key)
      if(sortorder == "asc" && order == "asc")
        setSortOrder("desc");
      else if(sortorder == "desc" && order == "desc")
        setSortOrder("asc");
      else
      {
        setSortOrder(order);
      }
  };

  const commonWidthStyle = {
    minWidth: 'auto',
    width: 'inherit',
  };

  const spotStyle = {
    // marginTop: 50,
    minWidth: 'auto',
    width: 'inherit',
  };
  const sortedCoins = orderBy(trading, sortkey, sortorder);

  // console.log(sortedCoins);
  // console.log(sortkey, sortorder);
  // console.log(sortedCoins);

  function gotoPage () {
    window.location = '/exchange';
  }



  return (
    <MainLayout>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </Head>
      <div className='mobileResponsive HomeScreen content'>
        <Header />
        <div className='index-page'>
          <div
            data-v-4654f51e
            className='banner-index'
            style={{
              backgroundImage: `url('https://upload-hotbit-io.oss-accelerate.aliyuncs.com/index-finalbanner.png')`,
            }}
          >
            <div
              data-v-4654f51e
              className='banner-index-content common-width'
              style={commonWidthStyle}
            >
              <div data-v-4654f51e className='banner-txt bannerTxt'>
                <p data-v-4654f51e style={{ textAlign: 'center' }} data-nsfw-filter-status='swf'>
                  {/* The Worlds Leading Cryptocurrency Trading Platform */}
                  Thanks for your registration with Tupe.
                  <br />
                  Tupe exchange platform is coming soon for crypto currency investors all around the world, stay connected with Tupe for more update’s.
                </p>
                {/* <p data-v-4654f51e style={{ textAlign: 'center' }} data-nsfw-filter-status='swf'>
                  Highly-Efficient &nbsp;·&nbsp; Flexible &nbsp;·&nbsp; Diverse &nbsp;·&nbsp; Stable
                  &nbsp;·&nbsp; Secure
                </p> */}
              </div>
              <div data-v-4654f51e className='banner-index-poster-box'>
                <EventCarousel height={setHeight}/>
                <div data-v-4654f51e className='banner-index-quotations' id="banner" style={{ height : height}}>
                  <div data-v-4654f51e className='fixed_term'>
                    <div data-v-a2f3dc54 data-v-4654f51e className='rate-wrap'>
                      <div data-v-a2f3dc54 className='rate-inner'>
                        <div data-v-a2f3dc54 className='rate-container interest-box'>
                          <div data-v-a2f3dc54 className='rate-left'>
                            <div data-v-a2f3dc54 className='quotation-title font-bold'>
                              APY of Investment Products
                            </div>
                          </div>
                          <div data-v-a2f3dc54 className='rate-marquee2'>
                            <ul data-v-a2f3dc54 className='item-list3'>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                     <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                    </span>
                                  </span>
                                 
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                     <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                    </span>
                                  </span>
                                 
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                     <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                    </span>
                                  </span>
                                 
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                     <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                    </span>
                                  </span>
                                 
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                     <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                    </span>
                                  </span>
                                 
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                     <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                    </span>
                                  </span>
                                 
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                     <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                    </span>
                                  </span>
                                 
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                     <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                    </span>
                                  </span>
                                 
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                              <li data-v-a2f3dc54='' className='rate-item'>
                                <div data-v-a2f3dc54='' className='rate-item-content2'>
                                  <span data-v-a2f3dc54=''>
                                    <img
                                      data-v-a2f3dc54=''
                                      src='https://upload-hotbit-io.oss-ap-southeast-1.aliyuncs.com/files/NEW_ATOM_LOGO.png'
                                      alt=''
                                      srcSet=''
                                      className='rate-icon2'
                                    />
                                    <span data-v-a2f3dc54='' className='text symbol _auto_size'>
                                      ATOM
                                  </span>
                                  </span>
                                  
                                  <a data-v-a2f3dc54='' href='/invest' className='sdf'>
                                    <span data-v-a2f3dc54='' className='text' />
                                    <span data-v-a2f3dc54='' className='vam _auto_size'>
                                      10.67%
                                    </span>
                                  </a>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="news">
            <div class="news_wrap">
              <div class="marquee2_wrap marquee2_pr">
                <div class="marquee2">
                  <ul style={{height: '900px'}}>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6974486730519-Announcement-on-the-Suspension-of-BEP20-SUSHI-and-ERC20-SUSHI-Withdrawal-Functions-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Suspension of BEP20-SUSHI and ERC20-SUSHI Withdrawal Functions on June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6972694758935-Announcement-on-the-Reopening-of-Deposit-and-Withdrawal-Function-of-All-Tokens-on-AYA-Chain-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Reopening of Deposit and Withdrawal Function of All Tokens on AYA Chain on June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6972481369239-Hotbit-s-Announcement-Regarding-the-Suspension-on-the-Deposit-and-Withdrawal-Functions-of-All-Tokens-Based-on-AYA-Chain-Starting-From-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Hotbit’s Announcement Regarding the Suspension on the Deposit and Withdrawal Functions of All Tokens Based on AYA Chain Starting From June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-23</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6972372691607-Hotbit-will-launch-WELL-Moonwell-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Hotbit will launch WELL(Moonwell) on June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6971677500823-Announcement-on-the-Suspension-of-ZIK-Trading-Function-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Suspension of ZIK Trading Function on June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6974486730519-Announcement-on-the-Suspension-of-BEP20-SUSHI-and-ERC20-SUSHI-Withdrawal-Functions-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Suspension of BEP20-SUSHI and ERC20-SUSHI Withdrawal Functions on June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6972694758935-Announcement-on-the-Reopening-of-Deposit-and-Withdrawal-Function-of-All-Tokens-on-AYA-Chain-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Reopening of Deposit and Withdrawal Function of All Tokens on AYA Chain on June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6972481369239-Hotbit-s-Announcement-Regarding-the-Suspension-on-the-Deposit-and-Withdrawal-Functions-of-All-Tokens-Based-on-AYA-Chain-Starting-From-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Hotbit’s Announcement Regarding the Suspension on the Deposit and Withdrawal Functions of All Tokens Based on AYA Chain Starting From June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-23</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6972372691607-Hotbit-will-launch-WELL-Moonwell-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Hotbit will launch WELL(Moonwell) on June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6971677500823-Announcement-on-the-Suspension-of-ZIK-Trading-Function-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Suspension of ZIK Trading Function on June 23rd, 2022
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="marquee2_wrap marquee2_pl">
                <div class="marquee2">
                  <ul style={{height: '900px'}}>
                    <li>
                      <span class="date">06-23</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6971329692183-Hotbit-s-Announcement-Regarding-the-Suspension-on-the-Deposit-and-Withdrawal-Functions-of-All-Tokens-Based-on-BTCV-Chain-Starting-From-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Hotbit’s Announcement Regarding the Suspension on the Deposit and Withdrawal Functions of All Tokens Based on BTCV Chain Starting From June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6971289015831-Announcement-on-the-Suspension-of-TRX-Withdrawal-Function-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Suspension of TRX Withdrawal Function on June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6970680896791-Announcement-on-the-Suspension-of-SAFELAMBO-Deposit-Withdrawal-and-Trading-Functions-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Suspension of SAFELAMBO Deposit, Withdrawal and Trading Functions on June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6970601960727-Announcement-on-the-Reopening-Trading-Function-of-XCN-on-June-21st-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Reopening Trading Function of XCN on June 21st, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6970598112279-Announcement-on-the-Reopening-Withdrawal-Function-of-XCN-on-June-21st-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Reopening Withdrawal Function of XCN on June 21st, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-23</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6971329692183-Hotbit-s-Announcement-Regarding-the-Suspension-on-the-Deposit-and-Withdrawal-Functions-of-All-Tokens-Based-on-BTCV-Chain-Starting-From-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Hotbit’s Announcement Regarding the Suspension on the Deposit and Withdrawal Functions of All Tokens Based on BTCV Chain Starting From June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6971289015831-Announcement-on-the-Suspension-of-TRX-Withdrawal-Function-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Suspension of TRX Withdrawal Function on June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6970680896791-Announcement-on-the-Suspension-of-SAFELAMBO-Deposit-Withdrawal-and-Trading-Functions-on-June-23rd-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Suspension of SAFELAMBO Deposit, Withdrawal and Trading Functions on June 23rd, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6970601960727-Announcement-on-the-Reopening-Trading-Function-of-XCN-on-June-21st-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Reopening Trading Function of XCN on June 21st, 2022
                      </a>
                    </li>
                    <li>
                      <span class="date">06-24</span> 
                      <a href="https://hotbit.zendesk.com/hc/en-us/articles/6970598112279-Announcement-on-the-Reopening-Withdrawal-Function-of-XCN-on-June-21st-2022" target="_blank" class="col-sm-10 col-xs-8 news_title">
                        Announcement on the Reopening Withdrawal Function of XCN on June 21st, 2022
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className='markets-data common-width' style={spotStyle}>
            <ol className='exchange-type'>
              <li className='active-type'>Spot Trading</li>
            </ol>
            {/* <SpotTradingDummy /> */}
            <div style={{width:"90%", margin:'auto'}}>
              <table className='trading-table'>
                <thead>
                  <tr>
                    <th className="trading-name">
                      <span onClick={()=>sort('', '')}>Name</span>
                      <span style={arrow}>
                        <ArrowDropUpIcon style={sortkey === 'name' && sortorder === 'asc' ? selectedArrowUp : arrowup} onClick={()=>sort('name', 'asc')}/>
                        <ArrowDropDownIcon style={sortkey === 'name' && sortorder === 'desc' ? selectedArrowDown : arrowdown} onClick={()=>sort('name', 'desc')}/>
                      </span>
                    </th>
                    <th className="trading-change ">
                      <span onClick={()=>sort('', '')}>PRICE($)</span>
                      <span style={arrow}>
                        <ArrowDropUpIcon style={sortkey === 'c' && sortorder === 'asc' ? selectedArrowUp : arrowup} onClick={()=>sort('c', 'asc')}/>
                        <ArrowDropDownIcon style={sortkey === 'c' && sortorder === 'desc' ? selectedArrowDown : arrowdown} onClick={()=>sort('c', 'desc')}/>
                      </span>
                    </th>
                    <th className="trading-percent">
                      <span onClick={()=>sort('', '')}>CHANGE</span>
                      <span style={arrow}>
                        <ArrowDropUpIcon style={sortkey === 'P' && sortorder === 'asc' ? selectedArrowUp : arrowup} onClick={()=>sort('P', 'asc')}/>
                        <ArrowDropDownIcon style={sortkey === 'P' && sortorder === 'desc' ? selectedArrowDown : arrowdown} onClick={()=>sort('P', 'desc')}/>
                      </span>
                    </th>
                    <th className="trading-change ">
                      <span onClick={()=>sort('', '')}>Open</span>
                      <span style={arrow}>
                        <ArrowDropUpIcon style={sortkey === 'o' && sortorder === 'asc' ? selectedArrowUp : arrowup} onClick={()=>sort('o', 'asc')}/>
                        <ArrowDropDownIcon style={sortkey === 'o' && sortorder === 'desc' ? selectedArrowDown : arrowdown} onClick={()=>sort('o', 'desc')}/>
                      </span>
                    </th>
                    <th className="trading-change ">
                      <span onClick={()=>sort('', '')}>High</span>
                      <span style={arrow}>
                        <ArrowDropUpIcon style={sortkey === 'h' && sortorder === 'asc' ? selectedArrowUp : arrowup} onClick={()=>sort('h', 'asc')}/>
                        <ArrowDropDownIcon style={sortkey === 'h' && sortorder === 'desc' ? selectedArrowDown : arrowdown} onClick={()=>sort('h', 'desc')}/>
                      </span>
                    </th>
                    <th className="trading-change ">
                      <span onClick={()=>sort('', '')}>Low</span>
                      <span style={arrow}>
                        <ArrowDropUpIcon style={sortkey === 'l' && sortorder === 'asc' ? selectedArrowUp : arrowup} onClick={()=>sort('l', 'asc')}/>
                        <ArrowDropDownIcon style={sortkey === 'l' && sortorder === 'desc' ? selectedArrowDown : arrowdown} onClick={()=>sort('l', 'desc')}/>
                      </span>
                    </th>
                    <th className="trading-change ">
                      <span onClick={()=>sort('', '')}>24h Volume</span>
                      <span style={arrow}>
                        <ArrowDropUpIcon style={sortkey === 'a' && sortorder === 'asc' ? selectedArrowUp : arrowup} onClick={()=>sort('a', 'asc')}/>
                        <ArrowDropDownIcon style={sortkey === 'a' && sortorder === 'desc' ? selectedArrowDown : arrowdown} onClick={()=>sort('a', 'desc')}/>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loaded && sortedCoins.map(item=>(
                      <OverlayTrigger
                        placement="bottom"
                        overlay={renderTooltip(item.pair)}
                      >
                        <tr key={item.name} onClick={gotoPage}>
                          <td className='trading-name'>
                            <div style={{display: 'flex', alignItems : 'center'}}>
                              <img src={item.image} alt=''/>
                              <div style={{display : 'flex', flexDirection : 'column'}}>
                                <strong>{trade_strong_data.get(item.name)}</strong>
                                <span>{trade_data.get(item.name)}</span>
                              </div>
                            </div>
                          </td>
                          <td className='trading-change'>{reduceDecimal(item.c)}</td>
                          <td className={'trading-change ' + (item.P > 0 ? 'green': (item.P == '0.00' ? 'gray':'red'))} >{item.P > 0 ? '+' : ''}{reduceDecimal(item.P)}</td>
                          <td className='trading-change'>{reduceDecimal(item.o)}</td>
                          <td className='trading-change'>{reduceDecimal(item.h)}</td>
                          <td className='trading-change'>{reduceDecimal(item.l)}</td>
                          <td className='trading-change'>{reduceDecimal(item.a)}</td>
                        </tr>
                      </OverlayTrigger>
                    ))}
                </tbody>
                
              </table>
              {/* <MarketData widgetProps={marketChartProps} /> */}
            </div>
          </div>
          <div className='section3'>
            <div className='common-width s3-wrap' style={commonWidthStyle}>
              <ul className='s3_main text-center'>
                <li>
                  <img
                    src='https://upload-hotbit-io.oss-accelerate.aliyuncs.com/resource/static/img/s3-img3.796436e.png'
                    alt='.png'
                    data-nsfw-filter-status='sfw'
                    style={{ visibility: 'visible' }}
                  />
                  <p className='s3_main_text1' data-nsfw-filter-status='swf'>
                    Various Token Types Supported
                  </p>
                  <p className='s3_main_text2' data-nsfw-filter-status='swf'>
                    Constantly introducing and listing high quality digital currencies from all over
                    the world, providing users with various types of transactional services in most
                    digital currencies.
                  </p>
                </li>
                <li>
                  <img
                    src='/images/user.png'
                    alt='.png'
                    data-nsfw-filter-status='sfw'
                    style={{ visibility: 'visible' }}
                  />
                  <p className='s3_main_text1' data-nsfw-filter-status='swf'>
                    User Experience
                  </p>
                  <p className='s3_main_text2' data-nsfw-filter-status='swf'>
                    We provide 24/7 online customer support to ensure quick and readily available
                    support when needed.
                  </p>
                </li>
                <li>
                  <img
                    src='/images/high.png'
                    alt='.png'
                    data-nsfw-filter-status='sfw'
                    style={{ visibility: 'visible' }}
                  />
                  <p className='s3_main_text1' data-nsfw-filter-status='swf'>
                    High Liquidity
                  </p>
                  <p className='s3_main_text2' data-nsfw-filter-status='swf'>
                    With a built in Artificial Intelligence market maker that meets the high
                    standards set by Wall Street, our model analysis based on over 250 market
                    parameters, providing 24/7 Customer Support and high liquidity.
                  </p>
                </li>
                <li>
                  <img
                    src='/images/secure.png'
                    alt='.png'
                    data-nsfw-filter-status='sfw'
                    style={{ visibility: 'visible' }}
                  />
                  <p className='s3_main_text1' data-nsfw-filter-status='swf'>
                    Secure And Stable
                  </p>
                  <p className='s3_main_text2' data-nsfw-filter-status='swf'>
                    We conduct the multinodular structure which meets the requirements set by the IT
                    surveillance logical structure from the Financial Industry, ensuring steady
                    operations of our systems. The front and back-end designs, combined with our
                    multi-node and multimodular distributed deployment, scales out our capacity and
                    thus providing better service for our customers.
                  </p>
                </li>
              </ul>
            </div>
          </div>
          <div className='mobile-banner'>
            <div className='mobile-banner-bg common-width' style={{width: '1280px'}}>
              <div className='mobile-banner-right'>
                <img
                  src='https://upload-hotbit-io.oss-accelerate.aliyuncs.com/resource/static/img/mobile-phone-img-index.b3bc6e1.png'
                  alt='phone.png'
                  data-nsfw-filter-status='sfw'
                  style={{ visibility: 'visible' }}
                  data-xblocker='passed'
                />
              </div>
              <div className='mobile-banner-wrap'>
                <div className='mobile-banner-left'>
                  <p className='title' data-nsfw-filter-status='swf'>
                    Trade Anytime, Anywhere
                  </p>
                  <p className='text' data-nsfw-filter-status='swf'>
                    Download and enjoy Tupe&apos;s mobile APP specially tailored for you, enjoy
                    real-time transactions anytime, anywhere, together with the latest market trends
                    right in the palm of your hands.
                  </p>
                  <div className='download'>
                    <div className='download_android'>
                      <div className='download_text google'>
                        <img
                          src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAz1BMVEUAAAD/ygr6Pk3b0BsQ1uXKXHKpcIu8ZXwP8H4P74EP8H4Qz//6Pk0P8H4Q1OsQ3cwQ2N0P8H78eTH/ygr6Pk0P8H7/ygr/ygr/ygoP8H4P8H7/ygoY73n/ygr/ygrlzhca28D6Pk3NWm/8gS0Q2deYe5iwbIYQ2tP8bjb6Pk0d7nf6QEz6Pk0P8H4P8H76Pk2QgJ4Q2df6Pk0P8H4P8H76Pk36Pk0P8H4P8H76Pk36Pk36Pk3izxj+shX6Pk36Pk0Qz//6Pk0P8H7/ygoV73tYL49GAAAAQHRSTlMA4frS0NDOzgL9+u/r6tLQz8/PwrSxflcnJA4J/fb11dPT0dHQz8/OzsqopZOQiIeAfGtpYWBDQjw4KyIhHhINoSjA4QAAALtJREFUKM910NUSAjEMQNGw2OLu7u7u2Sz//03QLlBoy309M0kmALAIZAqgLxQNBCdFLSFGiSIrU0voIaLETkvcSF2JHwtOixrCOLEia1MiYZTYq4RtchqeFcIel3Ktki3JhLGn3N22bbtyEjFjwkrlJcI6E55Lpmb/H3ktKykNFMJNnCGE16oqx/stp9EF3v3K4ACibwlv1M93GRizGyjkY5I+gdRLGltQ4hJemqAW6ljG+Aq65kb6CJoeQKJO6tjlVf0AAAAASUVORK5CYII='
                          alt=''
                        />
                        <div className='download_font'>
                          <span data-nsfw-filter-status='swf'>Download </span>
                          <span data-nsfw-filter-status='swf'>Android APK </span>
                        </div>
                      </div>
                    </div>
                    <div className='download_android'>
                      <div className='download_text android'>
                        <i className='material-icons'>android</i>
                        <div className='download_font'>
                          <span data-nsfw-filter-status='swf'>Download </span>
                          <span data-nsfw-filter-status='swf'>Android APK </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='download'>
                    <div className='download_ios'>
                      <div className='download_text ios'>
                        <i className='material-icons'>apple</i>
                        <div className='download_font'>
                          <span data-nsfw-filter-status='swf'>Download </span>
                          <span data-nsfw-filter-status='swf'>IOS </span>
                        </div>
                      </div>
                    </div>
                    <div className='download_ios download_code'>
                      <div className='download_text code flex flex-center'>
                        <i className='material-icons'>qr_code</i>
                      </div>
                      <div className='qr-code-box'>
                        <img
                          src='https://upload-hotbit-io.oss-accelerate.aliyuncs.com/mobile-qr.png'
                          className='mobile-qrcode'
                          data-nsfw-filter-status='sfw'
                          style={{ visibility: 'visible' }}
                          data-xblocker='passed'
                          alt=''
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CooperativePartners />
          <div className='communities'>
            <div className='communities-content'>
              <p data-nsfw-filter-status='swf'>Join Tupe communities</p>
              <p data-nsfw-filter-status='swf'>
                Tupe has already accumulated more than 700,000 registered users from more than 210
                countries and areas all over the world. By focusing on the world&apos;s emerging
                markets such as the markets of Russia, Japan, South Korea, Turkey and Southeast
                Asian countries, Tupe has gathered its users from Twitter, Telegram, VK and
                Facebook. Join in Tupe community, communicate and share your thoughts and experience
                of cryptocurrency with our experienced users from all over the world and gain an
                insight into the new trend of cryptocurrency industry.
              </p>
              <button className type='button'>
                Join now
              </button>
            </div>
          </div>
          <div className='Using-HotBit'>
            <div className='start-trading'>
              <p className='title' data-nsfw-filter-status='swf'>
                Start Trading Now
              </p>
              <div className='btn-wrap'>
                <a href='/market' className='btn1' data-nsfw-filter-status='swf'>
                  Trade now
                </a>
                <a href='/members/signup/' className='btn2' data-nsfw-filter-status='swf'>
                  Register now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer responsive />
    </MainLayout>
  );
}
