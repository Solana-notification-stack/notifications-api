const  { Connection }  = require("@solana/web3.js");


const WSS_ENDPOINT = 'wss://tame-quick-tab.solana-devnet.quiknode.pro/462e0341c8cc54e3f5838fa01fdf77ab2f451764/'; // replace with your URL
const HTTP_ENDPOINT = 'https://tame-quick-tab.solana-devnet.quiknode.pro/462e0341c8cc54e3f5838fa01fdf77ab2f451764/'; // replace with your URL
 const solanaConnection= new Connection(HTTP_ENDPOINT,{wsEndpoint:WSS_ENDPOINT});
 module.exports ={solanaConnection}