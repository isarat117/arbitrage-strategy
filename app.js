const axios = require('axios')
const postgres = require('./config/db')
const client = postgres.client



const sorgu1 = "SELECT name, MIN(fiyat) AS min_fiyat, MAX(fiyat) AS max_fiyat, ((MAX(fiyat) - MIN(fiyat)) / MIN(fiyat)) * 100 AS fiyat_farki, (SELECT ad FROM borsa WHERE id = (SELECT borsa_id FROM coin c WHERE name = c1.name AND fiyat = MIN(c1.fiyat) LIMIT 1)) AS min_borsa_ad, (SELECT ad FROM borsa WHERE id = (SELECT borsa_id FROM coin c WHERE name = c1.name AND fiyat = MAX(c1.fiyat) LIMIT 1)) AS max_borsa_ad FROM coin c1 GROUP BY name HAVING MIN(fiyat)>0 and ((MAX(fiyat) - MIN(fiyat)) / MIN(fiyat)) * 100 BETWEEN 5 AND 10 ORDER BY name asc;"






const getKucoinPrices =async ()=> 
{
    return new Promise( async(resolve, reject) => {
    const values = [];
    const object =await axios.get(`https://api.kucoin.com/api/v1/prices?base=usd`) 

    for (const prop in object.data.data) {
        values.push({ name: prop, value: object.data.data[prop] });
    }
    
  resolve(values)
})
  
}

const getBitmartPrices =async()=>{
    return new Promise( async(resolve, reject) => {
        try {
            
       
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
            values.push({name:data[i].symbol.slice(0,-5) , value:data[i].close_24h, bid:data[i].best_bid ,ask:data[i].best_ask})

        }
    }
    
    resolve(values)
} catch (error) {
            
}
})
  
}



const getMexcPrices =async()=>{
    return new Promise( async(resolve, reject) => {
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
            values.push({name:data[i].symbol.slice(0,-5) , value:data[i].last, bid:data[i].bid, ask:data[i].ask})

        }

    }
    
    resolve(values)
})

}


const getGatePrices =async()=>{
    return new Promise( async(resolve, reject) => {
    const response = await axios.get(`https://api.gateio.ws/api/v4/spot/tickers`)
    data = response.data
    const values = []
    for(var i=0 ; i<data.length;i++){
        if(data[i].currency_pair.endsWith('_USDT') && !(

            data[i].currency_pair.includes('5S_') || data[i].currency_pair.includes('5L_') ||
            data[i].currency_pair.includes('4S_') || data[i].currency_pair.includes('4L_') ||
            data[i].currency_pair.includes('3S_') || data[i].currency_pair.includes('3L_') ||
            data[i].currency_pair.includes('2S_') || data[i].currency_pair.includes('2L_'))){
            values.push({name:data[i].currency_pair.slice(0,-5), value:data[i].last, bid:data[i].highest_bid, ask:data[i].lowest_ask})
        }
    }
   
    resolve(values)
})
}



// deposit ve withdraw için kontrol fonksiyonu
 const setDepositAndWithdraw =async(borsa)=>{
    
   
    //done
    if(borsa==="kucoin"){
        
        const response  = await axios.get(`https://api.kucoin.com/api/v1/currencies`)
        data = response.data.data
        for(var i= 0; i<data.length;i++){
            client.query(`INSERT INTO public.depositandwithdraw( borsa_name, coin_name, deposit, withdraw) VALUES ('kucoin', '${data[i].currency}', ${data[i].isDepositEnabled}, ${data[i].isWithdrawEnabled});`,(err,res)=>{
                if(err){
                   // console.log(err)
                }else{
                   // console.log("basarılı")
                }
               
            })
           
        }
    }
    //done
   
    if(borsa==="bitmart"){
        try {
            
        
        const response  = await axios.get(`https://api-cloud.bitmart.com/account/v1/currencies`)
        data = response.data.data.currencies
        for(var i= 0; i<data.length;i++){
            client.query(`INSERT INTO public.depositandwithdraw( borsa_name, coin_name, deposit, withdraw) VALUES ('bitmart', '${data[i].currency}', ${data[i].deposit_enabled}, ${data[i].withdraw_enabled});`,(err,res)=>{
                if(err){
                    //console.log(err)
                }else{
                   // console.log("basarılı")
                }
              
            })
           
        }
    } catch (error) {
            
    }
    }

    if(borsa==="mexc"){
        const response  = await axios.get(`https://www.mexc.com/open/api/v2/market/coin/list?currency`)
        data0 = response.data.data

        for(var i= 0; i<data0.length;i++){
            withdraw=false
            deposit=false
            coinName = data0[i].currency
            data1 = response.data.data[i].coins

            for(var j =0; j<data1.length;j++){
                if(data1[j].is_withdraw_enabled && !withdraw){
                    withdraw=true
                 }
     
                 if(data1[j].is_deposit_enabled && !deposit){
                     deposit=true
                 }  

            }
           
            client.query(`INSERT INTO public.depositandwithdraw( borsa_name, coin_name, deposit, withdraw) VALUES ('mexc', '${coinName}', ${deposit}, ${withdraw});`,(err,res)=>{
                if(err){
                    //console.log(err)
                }else{
                   // console.log("basarılı")
                }
                
            })
        }

      
    }
    //done
    if(borsa==="gate"){
        const response  = await axios.get(`https://api.gateio.ws/api/v4/spot/currencies/`)
        data = response.data
        for(var i=0; i<data.length; i++){
            client.query(`INSERT INTO public.depositandwithdraw( borsa_name, coin_name, deposit, withdraw) VALUES ('gate', '${data[i].currency}', ${!data[i].deposit_disabled}, ${!data[i].withdraw_disabled});`,(err,res)=>{
                if(err){
                  //  console.log(err)
                }else{
                   // console.log("basarılı")
                }
               
            })

        }
     
    }
   
    
 }
// trade sayfasına göndermek için link oluşturur
 const setLink =(coin,borsa)=>{
    if(borsa==="bitmart")
    {
        return `https://www.bitmart.com/trade/en-US?symbol=${coin}_USDT&layout=basic`

    }
    if(borsa==="kucoin")
    {
        return `https://www.kucoin.com/trade/${coin}-USDT`
    }
    if(borsa==="gate")
    {
        return `https://www.gate.io/trade/${coin}_USDT`
        
    }
    if(borsa==="mexc")
    {
        return `https://www.mexc.com/exchange/${coin}_USDT?_from=search_spot_trade`
    }
    if(borsa==="binance")
    {
        return `https://www.binance.com/tr/trade/${coin}_USDT?theme=dark&type=spot`
    }

   

 }


 // ya silencek ya da tek seferde veriler alınacak
 const getDepth =async(coin,borsa)=>{
    const values =[]
   //done
   return new Promise( async(resolve, reject) => {
    
    if(borsa=="kucoin"){
        coin = coin+"-USDT"
         const response = await axios.get(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${coin}`)
         try {
         values.push({
            bid: response.data.data.bestBid,
            ask:response.data.data.bestAsk,
         })
         resolve(values)
        } catch (error) {
            resolve(0)
            console.log(error)
        }
       
       
    }


    if(borsa=="bitmart"){
        client.query(`select bid,ask from coin where name='${coin}' and borsa_id =1`,(err,res)=>{
            if(err){
               console.log(err)
            }else{
              
                resolve(res.rows)
            }
           
        })
       
   }

 
   if(borsa=="mexc"){
    client.query(`select bid,ask from coin where name='${coin}' and borsa_id =2`,(err,res)=>{
        if(err){
           console.log(err)
        }else{
           
           
            resolve(res.rows)
        }
      
    })
   
     }
    

    if(borsa=="gate"){
        client.query(`select bid,ask from coin where name='${coin}' and borsa_id =4`,(err,res)=>{
            if(err){
              console.log(err)
            }else{
                
                
                resolve(res.rows)
            }
          
        })
       
    }
   

})
     
}


const isAviableForDeposit =async(coin,borsa)=>{
    
    return new Promise((resolve, reject) => {
    client.query(`select * from depositandwithdraw where borsa_name='${borsa}' and coin_name='${coin}'`,(err,res)=>{
        if(err){
            console.log(err)
        }else{
    
        const result =[]
         const response = res.rows
         try {
            
       
         result.push({
            deposit:response[0].deposit,
            withdraw:response[0].withdraw,
    
         })
        } catch (error) {
            
        }
        
        resolve(result)
    
        }
       
    })
})

}


const dataEkle =async(from,where)=>{
    client.connect()
    console.log('----------------------------------------------------------------------------');
    //console.log('Yeni Coinler yükleniyor');
    client.on('error', e => {
        console.log(e);
    });
    return new Promise(async(resolve, reject) => {
    
    const values=[]
    const result =[]
    const dateFirst = Date.now() 

    // tüm dataları silip tekrar yazmak için
    client.query(`TRUNCATE TABLE coin RESTART IDENTITY;`,(err,res)=>{
        if(err){
            console.log(err)
        }else{
         console.log("Eski Coin Verileri silindi")
        }
      
    })

    //withdraw ve deposit için önceki insert işlemlerini siler
    client.query(`TRUNCATE TABLE depositandwithdraw RESTART IDENTITY;`,(err,res)=>{
        if(err){
            console.log(err)
        }else{
            console.log("Eski Withdraw ve Deposit Verileri silindi")
        }
      
    })
 


    await Promise.all([
     setDepositAndWithdraw("kucoin"),
     setDepositAndWithdraw("gate"),
     setDepositAndWithdraw("bitmart"),
     setDepositAndWithdraw("mexc"),
    ])
    


   await Promise.all([
        getKucoinPrices(),
        getBitmartPrices(),
        getMexcPrices(),
        getGatePrices()
    ])
    .then(([kucoin, bitmart, mexc, gate]) => {

        // Veritabanı Auto increment olacak ve delete yerine trunscate kullanılacak 
        console.log("Veriler çekildi Veritabanına kaydediliyor")
        for(var i=0; i<kucoin.length;i++){
            client.query(`INSERT INTO coin( name, borsa_id, fiyat) VALUES ( '${kucoin[i].name}', 0 , '${kucoin[i].value}')`,(err,res)=>{
                if(err){
                   console.log(err)
                }else{
                  //  console.log("basarılı")
                }
              
            })
        } 
    
    
        
        for(var i=0; i<bitmart.length;i++){
            client.query(`INSERT INTO coin( name, borsa_id, fiyat, bid, ask) VALUES ('${bitmart[i].name}', 1,${bitmart[i].value},${bitmart[i].bid},${bitmart[i].ask})`,(err,res)=>{
                if(err){
                   //console.log(err)
                }else{
                  //  console.log("basarılı")
                }
               
            })
        } 
    
    
        
        for(var i=0; i<mexc.length;i++){
            client.query(`INSERT INTO coin( name, borsa_id, fiyat, bid, ask) VALUES ('${mexc[i].name}', 2, ${mexc[i].value},${mexc[i].bid},${mexc[i].ask})`,(err,res)=>{
                if(err){
                 //  console.log(err)
                }else{
                  //  console.log("basarılı")
                }
              
            })
        }
        
      
        
        for(var i=0; i<gate.length;i++){
            client.query(`INSERT INTO coin( name, borsa_id, fiyat, bid, ask) VALUES ('${gate[i].name}', 4, ${gate[i].value} , ${gate[i].bid} , ${gate[i].ask})`,(err,res)=>{
                if(err){
                   // console.log(err)
                }else{
                   //console.log("basarılı")
                }
                
            })
        }
    })
    
   

    
    client.query(`SELECT name, MIN(fiyat) AS min_fiyat, MAX(fiyat) AS max_fiyat, ((MAX(fiyat) - MIN(fiyat)) / MIN(fiyat)) * 100 AS fiyat_farki, (SELECT ad FROM borsa WHERE id = (SELECT borsa_id FROM coin c WHERE name = c1.name AND fiyat = MIN(c1.fiyat) LIMIT 1)) AS min_borsa_ad, (SELECT ad FROM borsa WHERE id = (SELECT borsa_id FROM coin c WHERE name = c1.name AND fiyat = MAX(c1.fiyat) LIMIT 1)) AS max_borsa_ad FROM coin c1 GROUP BY name HAVING MIN(fiyat)>0 and ((MAX(fiyat) - MIN(fiyat)) / MIN(fiyat)) * 100 BETWEEN ${from} AND ${where} ORDER BY name asc;`,async(err,res)=>{
        if(err){
            //console.log(err)
        }else{
            values.push(res.rows)
            //console.log(values)
            console.log(`Sorgu Başladı ${values[0].length} adet coin sistemde`)
           
        
            for(var i =0; i<values[0].length;i++){
               
                try {
                    // API çağrıları paralel olarak yapılıyor
                    const [situationWithdraw,situationDeposit] = await Promise.all([
                        isAviableForDeposit(values[0][i].name,values[0][i].min_borsa_ad),
                        isAviableForDeposit(values[0][i].name,values[0][i].max_borsa_ad)
                    ])
                    if(situationDeposit[0].deposit && situationWithdraw[0].withdraw){
                      
                        const [minBorsaDepthData,maxBorsaDepthData] = await Promise.all([
                            getDepth(values[0][i].name,values[0][i].min_borsa_ad),
                            getDepth(values[0][i].name,values[0][i].max_borsa_ad)
                        ])
                        
                        if(maxBorsaDepthData[0].bid>minBorsaDepthData[0].ask){
                        
                        
                                
                           
                            result.push({
                                name:values[0][i].name,
                                minPrice: values[0][i].min_fiyat,
                                maxPrice: values[0][i].max_fiyat,
                                fiyatFarki: values[0][i].fiyat_farki.toFixed(3),
                                minborsa: values[0][i].min_borsa_ad,
                                maxborsa: values[0][i].max_borsa_ad,
                                alis:minBorsaDepthData[0].ask,
                                satis:maxBorsaDepthData[0].bid,
                                linkMinBorsa: setLink(values[0][i].name,values[0][i].min_borsa_ad),
                                linkMaxBorsa: setLink(values[0][i].name,values[0][i].max_borsa_ad),

                            })
                           
                        }
                       
                        
                    }
                } catch (error) {
                   console.log(error)
                }
            }
           
            const dateLast = Date.now()
            console.log((dateLast-dateFirst)/1000 , " saniye sürdü")
            console.log(`${result.length} adet veri başarı ile yüklendi`)
            resolve(result);
            
            
            
        }
          })
    
})
}
module.exports={dataEkle:dataEkle}

