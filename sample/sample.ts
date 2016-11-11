import * as console from 'console';
import { ThorIO  } from '../thor-io.node-client'

let client = new ThorIO.Client.NodeJSClient(ThorIO.Client.BufferMessage);

client.onOpen = () => {
    console.log("Connected to fooController..")
    
    client.invoke("fooMessage",{a:2},"fooController");
    let a  = 0;
    setInterval(() => {
        client.invoke("fooMessage",{a:3},"fooController");
        a++;
    },1000 * 5);    
}

client.on("fooMessage", (message: any) => {
    console.log("fooMessage ->", message);
});

console.log("Connecting to 127.0.0.1..")

client.open("127.0.0.1", 4503, "fooController");










