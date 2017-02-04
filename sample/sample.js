"use strict";
var thor_io_node_client_1 = require('../thor-io.node-client');
var client = new thor_io_node_client_1.ThorIO.Client.NodeJSClient(thor_io_node_client_1.ThorIO.Client.BufferMessage);
client.onOpen = function () {
    console.log("Connected to microservice (controller)..");
    //  client.invoke("fooMessage",{a:2},"fooController");
    // emulate a sensor, pass temperature
    setInterval(function () {
        var t = 1 + (Math.random() * 10);
        client.invoke("temperatureUpdate", {
            temp: t
        }, "microservice");
    }, 1000);
};
client.on("temperatureChange", function (message) {
    //console.log("temperatureChange ->", message);
});
console.log("Connecting to 127.0.0.1..");
client.open("127.0.0.1", 4503, "microservice");
//# sourceMappingURL=sample.js.map