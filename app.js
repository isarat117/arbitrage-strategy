




const axios = require('axios')
const postgres = require('./config/db')

const client = postgres.client
client.connect()



const sorgu1 = "SELECT c.name, min(c.fiyat) as min_price, max(c.fiyat) as max_price, (max(c.fiyat) - min(c.fiyat))/min(c.fiyat) fiyat_farki, (CASE minb.borsa_id      WHEN 0 THEN 'kucoin'      WHEN 1 THEN 'bitmart'      WHEN 2 THEN 'mexc'      WHEN 3 THEN 'binance'      WHEN 4 THEN 'gate' END) as minborsa, (CASE maxb.borsa_id      WHEN 0 THEN 'kucoin'      WHEN 1 THEN 'bitmart'      WHEN 2 THEN 'mexc'      WHEN 3 THEN 'binance'      WHEN 4 THEN 'gate' END) as maxborsa FROM coin c LEFT JOIN ( SELECT name, fiyat, borsa_id FROM coin c1 WHERE fiyat = (SELECT MIN(fiyat) FROM coin WHERE name = c1.name) ) minb ON minb.name = c.name LEFT JOIN ( SELECT name, fiyat, borsa_id FROM coin c2 WHERE fiyat = (SELECT MAX(fiyat) FROM coin WHERE name = c2.name) ) maxb ON maxb.name = c.name GROUP BY c.name, minb.borsa_id, maxb.borsa_id HAVING max(c.fiyat) - min(c.fiyat) > (min(c.fiyat) * 0.03) AND max(c.fiyat) - min(c.fiyat) < (min(c.fiyat) * 0.07) AND min(c.fiyat) > 0"








const getKucoinPrices =async ()=> 
{
    const values = [];
    const object =await axios.get(`https://api.kucoin.com/api/v1/prices?base=usd`) 

    for (const prop in object.data.data) {
        values.push({ name: prop, value: object.data.data[prop] });
    }
    
  return values;
  
}

const getBitmartPrices =async()=>{
    const response = await axios.get(`https://api-cloud.bitmart.com/spot/v1/ticker`)
    data =response.data.data.tickers
    //console.log(data)
    const values =[]
    for(var i=0;i<data.length; i++)
    {
        if(data[i].symbol.includes('_USDT') && !(

            data[i].symbol.includes('5S_') || data[i].symbol.includes('5L_') ||
            data[i].symbol.includes('4S_') || data[i].symbol.includes('4L_') ||
            data[i].symbol.includes('3S_') || data[i].symbol.includes('3L_') ||
            data[i].symbol.includes('2S_') || data[i].symbol.includes('2L_'))){
            values.push({name:data[i].symbol.slice(0,-5) , value:data[i].close_24h})

        }
    }
    return values
  
}

const getMexcPrices =async()=>{
    const response = await axios.get(`https://www.mexc.com/open/api/v2/market/ticker`)
    data =response.data.data
    const values=[]
    for(var i= 0; i<data.length;i++){
        if(data[i].symbol.includes('_USDT') && !(

            data[i].symbol.includes('5S_') || data[i].symbol.includes('5L_') ||
            data[i].symbol.includes('4S_') || data[i].symbol.includes('4L_') ||
            data[i].symbol.includes('3S_') || data[i].symbol.includes('3L_') ||
            data[i].symbol.includes('2S_') || data[i].symbol.includes('2L_'))
        ){
            values.push({name:data[i].symbol.slice(0,-5) , value:data[i].last})

        }

    }
   return values

}

const getBinancePrices =async()=>{
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr`)
    data = response.data
    const values =[]
    for(var i=0 ; i<data.length;i++){
        if(data[i].symbol.endsWith('USDT')){
            values.push({name:data[i].symbol.slice(0,-4), value:data[i].lastPrice})
        }
    }
    return values
}

const getGatePrices =async()=>{

    const response = await axios.get(`https://api.gateio.ws/api/v4/spot/tickers`)
    data = response.data
    const values = []
    for(var i=0 ; i<data.length;i++){
        if(data[i].currency_pair.endsWith('_USDT') && !(

            data[i].currency_pair.includes('5S_') || data[i].currency_pair.includes('5L_') ||
            data[i].currency_pair.includes('4S_') || data[i].currency_pair.includes('4L_') ||
            data[i].currency_pair.includes('3S_') || data[i].currency_pair.includes('3L_') ||
            data[i].currency_pair.includes('2S_') || data[i].currency_pair.includes('2L_'))){
            values.push({name:data[i].currency_pair.slice(0,-5), value:data[i].last})
        }
    }
    return values
}

const dataEkle =async()=>{
    
    const values=[]
    const result =[]
    const dateFirst = Date.now()

    // tüm dataları silip tekrar yazmak için
    client.query(`DELETE FROM public.coin WHERE true`,(err,res)=>{
        if(err){
            console.log(err)
        }else{
           // console.log("silindi")
        }
        client.end
    })


    const kucoin =await getKucoinPrices()
    
    for(var i=0; i<kucoin.length;i++){
        client.query(`INSERT INTO coin(id, name, borsa_id, fiyat) VALUES (${i}, '${kucoin[i].name}', 0, '${kucoin[i].value}')`,(err,res)=>{
            if(err){
                console.log(err)
            }else{
              //  console.log("basarılı")
            }
            client.end
        })
    } 


    const bitmart = await getBitmartPrices()
    for(var i=0; i<bitmart.length;i++){
        client.query(`INSERT INTO coin(id, name, borsa_id, fiyat) VALUES (${i+kucoin.length}, '${bitmart[i].name}', 1, '${bitmart[i].value}')`,(err,res)=>{
            if(err){
                console.log(err)
            }else{
              //  console.log("basarılı")
            }
            client.end
        })
    } 


    const mexc = await getMexcPrices()
    for(var i=0; i<mexc.length;i++){
        client.query(`INSERT INTO coin(id, name, borsa_id, fiyat) VALUES (${i+kucoin.length+bitmart.length}, '${mexc[i].name}', 2, '${mexc[i].value}')`,(err,res)=>{
            if(err){
                console.log(err)
            }else{
              //  console.log("basarılı")
            }
            client.end
        })
    }
    
    const binance = await getBinancePrices()
    for(var i=0; i<binance.length;i++){
        client.query(`INSERT INTO coin(id, name, borsa_id, fiyat) VALUES (${i+kucoin.length+bitmart.length+mexc.length}, '${binance[i].name}', 3, '${binance[i].value}')`,(err,res)=>{
            if(err){
                console.log(err)
            }else{
               // console.log("basarılı")
            }
            client.end
        })
    }
    const gate = await getGatePrices()
    for(var i=0; i<gate.length;i++){
        client.query(`INSERT INTO coin(id, name, borsa_id, fiyat) VALUES (${i+kucoin.length+bitmart.length+mexc.length+binance.length}, '${gate[i].name}', 4, '${gate[i].value}')`,(err,res)=>{
            if(err){
                console.log(err)
            }else{
               // console.log("basarılı")
            }
            client.end
        })
    }

    // sorgu
    client.query(sorgu1,async(err,res)=>{
        if(err){
            console.log(err)
        }else{
          values.push(res.rows)
            
          // düşük fiyatlı yerde deposit ve yüksek fiyatlı yerde withdraw aktif mi kontrolü
          for(var i =0; i<values[0].length;i++)
          {
            try {
            
          const situationWithdraw = await isAviableForDeposit(values[0][i].name,values[0][i].minborsa)
          const situationDeposit = await  isAviableForDeposit(values[0][i].name,values[0][i].maxborsa)
          if(situationDeposit[0].deposit && situationWithdraw[0].withdraw){
            const minBorsaDepthData = await getDepth(values[0][i].name,values[0][i].minborsa)
            const maxBorsaDepthData  = await getDepth(values[0][i].name,values[0][i].maxborsa)
           if(maxBorsaDepthData[0].bestBuy>minBorsaDepthData[0].bestSell){
            result.push({
                name:values[0][i].name,
                minPrice: values[0][i].min_price,
                maxPrice: values[0][i].max_price,
                fiyatFarki: values[0][i].fiyat_farki.toFixed(3),
                minborsa: values[0][i].minborsa,
                maxborsa: values[0][i].maxborsa,
                alis:minBorsaDepthData[0].bestSell,
                alisToplami:(minBorsaDepthData[0].bestSell*minBorsaDepthData[0].bestSellAmount).toFixed(4),

                satis:maxBorsaDepthData[0].bestBuy,
                satisToplami:(maxBorsaDepthData[0].bestBuy*maxBorsaDepthData[0].bestBuyAmount).toFixed(4),
                
            })

           }


           
          }
        } catch (error) {
            
        }
          }
          const dateLast = Date.now()
        console.log((dateLast-dateFirst)/1000 , " saniye sürdü")
        console.table(result)
        return result;

        }
    })
  
   
}
// deposit ve withdraw için kontrol fonksiyonu
 const isAviableForDeposit =async(coin,borsa)=>{
    const values =[]
    //done
    if(borsa==="kucoin"){
        const response  = await axios.get(`https://api.kucoin.com/api/v1/currencies`)
        data = response.data.data
       
        for(var i= 0; i<data.length;i++){
            if(coin===data[i].currency){
                values.push({
                    withdraw: data[i].isWithdrawEnabled,
                    deposit: data[i].isDepositEnabled,
                })
            }
        }
        return values
    }
    //done
    try {
    if(borsa==="bitmart"){
        const response  = await axios.get(`https://api-cloud.bitmart.com/account/v1/currencies`)
        data = response.data.data.currencies
    
        for(var i= 0; i<data.length;i++){
            if(coin===data[i].currency){
                values.push({
                    withdraw: data[i].withdraw_enabled,
                    deposit: data[i]. deposit_enabled,
                })
            }
        }
        return values
    }
} catch (error) {     
}
    if(borsa==="mexc"){
        const response  = await axios.get(`https://www.mexc.com/open/api/v2/market/coin/list?currency=${coin}`)
        data = response.data.data[0].coins
        withdraw=false
        deposit=false

        for(var i= 0; i<data.length;i++){
            if(data[i].is_withdraw_enabled && !values.withdraw){
               withdraw=true
            }

            if(data[i].is_deposit_enabled && !values.deposit){
                deposit=true
            }   
        }

        values.push({
            withdraw:withdraw,
            deposit:  deposit,
        })
        //console.log(values)
        return values
    }
    //done
    if(borsa==="gate"){
        const response  = await axios.get(`https://api.gateio.ws/api/v4/spot/currencies/${coin}`)
        data = response.data
     
      if(coin===data.currency){
        values.push({
            withdraw: !data.withdraw_disabled,
            deposit:  !data.deposit_disabled,
        })
        return values
    }
    }
    
 }

 const getDepth =async(coin,borsa)=>{
    const values =[]
   //done
    if(borsa==="kucoin"){
        coin = coin+"-USDT"
         const response = await axios.get(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${coin}`)
         values.push({

            bestBuy: response.data.data.bestBid,
            bestBuyAmount:response.data.data.bestBidSize,
            
            bestSell:response.data.data.bestAsk,
            bestSellAmount:response.data.data.bestAskSize,
         })
       
         return values
    }
     ///done
    if(borsa==="bitmart"){
        coin = coin+"_USDT"
        const response = await axios.get(`https://api-cloud.bitmart.com/spot/v1/ticker_detail?symbol=${coin}`)
        
        values.push({
           
           bestBuy: response.data.data.best_bid,
           bestBuyAmount: response.data.data.best_bid_size,

           bestSell:response.data.data.best_ask,
           bestSellAmount:response.data.data.best_ask_size,

        })
       
        return values
   }
   //done
   if(borsa==="mexc"){

    coin = coin+"_USDT"
    const response = await axios.get(`https://www.mexc.com/open/api/v2/market/depth?symbol=${coin}&depth=2`);
   // console.log(response.data.data)
   
    values.push({
        bestBuy: response.data.data.bids[0].price,
        bestBuyAmount: response.data.data.bids[0].quantity,

        bestSell:response.data.data.asks[0].price,
        bestSellAmount:response.data.data.asks[0].quantity,
 
     })
     
         return values
     }

    
    
     //done
    if(borsa==="binance"){
        coin = coin+"USDT"
        const response = await axios.get(`https://data.binance.com/api/v3/depth?symbol=${coin}&limit=1`)
        
        values.push({
        bestBuy: response.data.bids[0][0],
        bestBuyAmount: response.data.bids[0][1],

        bestSell:response.data.asks[0][0],
        bestSellAmount:response.data.asks[0][1],

        })
      
        return values
    }

    if(borsa==="gate"){
        coin= coin+"_USDT"
        const response = await axios.get(`https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${coin}&limit=1`)
        
        values.push({

        bestBuy: response.data.bids[0][0],
        bestBuyAmount: response.data.bids[0][1],

        bestSell:response.data.asks[0][0],
        bestSellAmount:response.data.asks[0][1]

        })
       
        return values
    }
     
}

const getWithdrawPrice =async(coin,borsa)=>{

    if(borsa==="mexc"){
        const response = await axios.get(`https://www.mexc.com/open/api/v2/market/coin/list?currency=${coin}`)

      
         return response.data.data[0].coins[0].fee
    }

    if(borsa==="kucoin"){
        const response  = await axios.get(`https://api.kucoin.com/api/v1/currencies`)
        data = response.data.data
       
        for(var i= 0; i<data.length;i++){
            if(coin===data[i].currency){
                return data[i].withdrawalMinFee
            }
        }
        
    }
    else{
        return 0
    }

    
}

//getWithdrawPrice("USDT","kucoin")

dataEkle()





/*


kucoin:0
bitmart:1
mexc :2 
binance:3
gate:4

*/



//module.exports={dataEkle:dataEkle}