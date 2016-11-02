"use strict";
var console = require('console');
var thor_io_node_client_1 = require('../thor-io.node-client');
var client = new thor_io_node_client_1.ThorIO.Client.NodeJSClient();
client.onOpen = function () {
    console.log("Connected to controller..");
    client.invoke("getToDos", {}, "TodoController"); // will fire todo's
};
client.on("todo", function (todo) {
    console.log("todo", todo);
});
client.on("todos", function (todos) {
    console.log("todos", todos);
});
console.log("Connecting to 127.0.0.1..");
client.open("127.0.0.1", 4502, "TodoController");
//# sourceMappingURL=sample.js.map