"use strict";
var events_1 = require('events');
var net = require('net');
var ThorIO;
(function (ThorIO) {
    var Client;
    (function (Client) {
        var PipeMessage = (function () {
            function PipeMessage(controller, topic, data) {
                this.arr = new Array();
                this.arr.push(controller);
                this.arr.push(topic);
                this.arr.push(JSON.stringify(data));
            }
            Object.defineProperty(PipeMessage.prototype, "topic", {
                get: function () {
                    return this.arr[1];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PipeMessage.prototype, "controller", {
                get: function () {
                    return this.arr[0];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PipeMessage.prototype, "data", {
                get: function () {
                    return this.arr[2];
                },
                enumerable: true,
                configurable: true
            });
            PipeMessage.prototype.toString = function () {
                return this.arr.join("|");
            };
            PipeMessage.fromBuffer = function (buffer) {
                var arr = buffer.toString().split("|");
                return new PipeMessage(arr[0], arr[1], arr[2]);
            };
            return PipeMessage;
        }());
        Client.PipeMessage = PipeMessage;
        var Subscription = (function () {
            function Subscription(topic, controller) {
                this.topic = topic;
                this.controller = controller;
            }
            Subscription.prototype.toString = function () {
                return JSON.stringify(this);
            };
            return Subscription;
        }());
        Client.Subscription = Subscription;
        var NodeJSClient = (function () {
            function NodeJSClient() {
                var _this = this;
                this.events = new events_1.EventEmitter();
                this.socket = new net.Socket();
                this.socket.addListener("data", function (buffer) {
                    var pipeMessage = PipeMessage.fromBuffer(buffer);
                    _this.events.emit(pipeMessage.topic, pipeMessage.data);
                });
                this.socket.addListener("error", function (err) {
                    //  console.log(err);
                });
                this.on("___open", function (data) {
                    _this.onOpen(data);
                });
            }
            NodeJSClient.prototype.off = function (topic) {
                this.events.removeAllListeners(topic);
            };
            NodeJSClient.prototype.on = function (topic, fn) {
                this.events.on(topic, fn);
            };
            NodeJSClient.prototype.invoke = function (topic, data, controller) {
                var pipeMessage = new PipeMessage(controller, topic, data || new Object());
                this.socket.write(pipeMessage.toString());
            };
            NodeJSClient.prototype.subscribe = function (topic, controller, fn) {
                this.on(topic, fn);
                this.invoke("___subscribe", new Subscription(topic, controller).toString(), controller);
            };
            NodeJSClient.prototype.unsubscribe = function () {
            };
            NodeJSClient.prototype.open = function (host, port, controller) {
                var _this = this;
                this.socket.connect(port, host, function () {
                    ;
                    _this.invoke("___connect", {}, controller);
                });
            };
            NodeJSClient.prototype.close = function () {
                this.socket.destroy();
            };
            return NodeJSClient;
        }());
        Client.NodeJSClient = NodeJSClient;
    })(Client = ThorIO.Client || (ThorIO.Client = {}));
})(ThorIO = exports.ThorIO || (exports.ThorIO = {}));
//# sourceMappingURL=thor-io.node-client.js.map