/*
IMPORTANT!!!: KAR ZARAR A GÖRE FİTRE YAPAN BİR SİSTEM 
3/4 TESTİ EN KISA SÜREDE


 */






const axios = require('axios')
const postgres = require('../config/db')
const client = postgres.client

const getDepth =async(coin)=>{
    const borsalar =[]
    const depths =[]
    client.connect()

    return new Promise( async(resolve, reject) => {
    client.query(`SELECT * from coin where name = '${coin}'`,async (err,res)=>{
        if(err){
            console.log(err)
        }else{
        
           

          for(var i= 0; i< res.rows.length;i++){
            borsalar.push(res.rows[i].borsa_id)
          }
        
          for(var i=0; i<borsalar.length;i++){
           
            if(borsalar[i]==0){
                const response = await axios.get(`https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=${coin}-USDT`)
                const bids = response.data.data.bids
                const asks = response.data.data.asks


             
                depths.push({
                    borsa:'kucoin',
                    bids:bids.slice(0, 5),
                    asks:asks.slice(0, 5),
                })

            }
            //bitmart
            if(borsalar[i]==1){
               
             const response = await axios.get(`https://api-cloud.bitmart.com/spot/v1/symbols/book?symbol=${coin}_USDT&size=5`)
             const bids =  []
             const asks =  []

            for(var j =0; j<5 ; j++){
                bids.push([response.data.data.buys[j].price,response.data.data.buys[j].amount])
                asks.push([response.data.data.sells[j].price,response.data.data.sells[j].amount])  
            }


            depths.push({
                borsa:'bitmart',
                bids:bids,
                asks:asks,
                
            })
            
            }





            //mexc
            if(borsalar[i]==2){
             const response = await axios.get(`https://www.mexc.com/open/api/v2/market/depth?symbol=${coin}_USDT&depth=5`)
             const bids =  []
             const asks =  []


            for(var j =0; j<5 ; j++){
                bids.push([response.data.data.bids[j].price,response.data.data.bids[j].quantity])
                asks.push([response.data.data.asks[j].price,response.data.data.asks[j].quantity])  
            }
            
            depths.push({
                borsa:'mexc',
                bids:bids,
                asks:asks,
            })
                
            }
            //binance
            if(borsalar[i]==3){
                const response = await axios.get(`https://data.binance.com/api/v3/depth?symbol=${coin}USDT&limit=5`)
                const bids = response.data.bids
                const asks = response.data.asks


             
                depths.push({
                    borsa:'binance',
                    bids:bids,
                    asks:asks,
                })
            }
            //gate
            if(borsalar[i]==4){
                const response = await axios.get(`https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${coin}_USDT&limit=5`)
        
                const bids = response.data.bids
                const asks = response.data.asks


             
                depths.push({
                    borsa:'gate',
                    bids:bids,
                    asks:asks,
                })
                
            }

          }


 
        
          resolve(depths)
       
        }
        
    })
   
})
   
}



const getAverage =(data)=>{

   let amount = 0
   let balance=0

    for(var i=0; i<data.length;i++){

        amount += data[i][1]/data[i][0];
        balance += data[i][1]

    }

    return balance/amount;
}

module.exports={getDepth:getDepth,getAverage:getAverage}
