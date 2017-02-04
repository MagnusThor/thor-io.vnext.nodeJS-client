import { ThorIO  } from '../thor-io.node-client'


let client = new ThorIO.Client.NodeJSClient(ThorIO.Client.BufferMessage);

client.onOpen = () => {

    console.log("Connected to microservice (controller)..")
    
     //  client.invoke("fooMessage",{a:2},"fooController");
    
    // emulate a sensor, pass temperature
   
    
    setInterval(() => {
         let t  = 1 + (Math.random() * 10);
        client.invoke("temperatureUpdate",{
            temp:t
        },"microservice");
       
    },1000);    
}

client.on("temperatureChange", (message: any) => {
    //console.log("temperatureChange ->", message);
});

console.log("Connecting to 127.0.0.1..")

client.open("127.0.0.1", 4503, "microservice");










