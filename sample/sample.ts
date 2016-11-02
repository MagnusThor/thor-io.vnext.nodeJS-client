import * as console from 'console';
import { ThorIO } from '../thor-io.node-client'

let client = new ThorIO.Client.NodeJSClient();
client.onOpen = () => {
    
    console.log("Connected to controller..")

    client.invoke("getToDos", {}, "TodoController"); // will fire todo's
}

client.on("todo", (todo: any) => {
    console.log("todo", todo);
});

client.on("todos", (todos: any) => {
    console.log("todos", todos);
});

console.log("Connecting to 127.0.0.1..")

client.open("127.0.0.1", 4502, "TodoController");










