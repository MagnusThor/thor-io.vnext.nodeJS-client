"use strict";
var console = require('console');
var thor_io_node_client_1 = require('../thor-io.node-client');
var client = new thor_io_node_client_1.ThorIO.Client.NodeJSClient(thor_io_node_client_1.ThorIO.Client.BufferMessage);
client.onOpen = function () {
    console.log("Connected to fooController..");
    client.invoke("fooMessage", { a: 2 }, "fooController");
    var a = 0;
    setInterval(function () {
        client.invoke("fooMessage", { a: 3 }, "fooController");
        a++;
    }, 1000 * 5);
};
client.on("fooMessage", function (message) {
    console.log("fooMessage ->", message);
});
console.log("Connecting to 127.0.0.1..");
client.open("127.0.0.1", 4503, "fooController");
//# sourceMappingURL=sample.js.map