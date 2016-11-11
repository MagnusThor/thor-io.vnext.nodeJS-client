"use strict";
var events_1 = require('events');
var net = require('net');
var ThorIO;
(function (ThorIO) {
    var Client;
    (function (Client) {
        var Message = (function () {
            function Message(topic, object, controller) {
                this.T = topic;
                this.D = object;
                this.C = controller;
            }
            Object.defineProperty(Message.prototype, "topic", {
                get: function () {
                    return this.T;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Message.prototype, "controller", {
                get: function () {
                    return this.C;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Message.prototype, "data", {
                get: function () {
                    return this.D;
                },
                enumerable: true,
                configurable: true
            });
            return Message;
        }());
        Client.Message = Message;
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
        var BufferMessage = (function () {
            function BufferMessage(controller, topic, data) {
                this.controller = controller;
                this.topic = topic;
                this.data = data;
            }
            BufferMessage.prototype.toMessage = function (buffer) {
                var headerLen = 3;
                var tLen = buffer.readUInt8(0);
                var cLen = buffer.readUInt8(1);
                var dLen = buffer.readUInt8(2);
                var offset = headerLen;
                var topic = buffer.toString("utf-8", offset, tLen + offset);
                offset += tLen;
                var controller = buffer.toString("utf-8", offset, offset + cLen);
                offset += cLen;
                var data = buffer.toString("utf-8", offset, offset + dLen);
                var message = new Message(topic, data, controller);
                return message;
            };
            BufferMessage.prototype.toBuffer = function () {
                var header = 3;
                var offset = 0;
                var tLen = this.topic.length;
                var dLen = this.data.length;
                var cLen = this.controller.length;
                var bufferSize = header + tLen + dLen + cLen;
                var buffer = new Buffer(bufferSize);
                buffer.writeUInt8(tLen, 0);
                buffer.writeUInt8(cLen, 1);
                buffer.writeInt8(dLen, 2);
                offset = header;
                buffer.write(this.topic, offset);
                offset += tLen;
                buffer.write(this.controller, offset);
                offset += cLen;
                buffer.write(this.data, offset);
                return buffer;
            };
            BufferMessage.fromBuffer = function (buffer) {
                var headerLen = 3;
                var tLen = buffer.readUInt8(0);
                var cLen = buffer.readUInt8(1);
                var dLen = buffer.readUInt8(2);
                var offset = headerLen;
                var topic = buffer.toString("utf-8", offset, tLen + offset);
                offset += tLen;
                var controller = buffer.toString("utf-8", offset, offset + cLen);
                offset += cLen;
                var data = buffer.toString("utf-8", offset, offset + dLen);
                var message = new Message(topic, data, controller);
                return message;
            };
            return BufferMessage;
        }());
        Client.BufferMessage = BufferMessage;
        var PipeMessage = (function () {
            function PipeMessage(controller, topic, data) {
                this.payload = new Array();
                this.payload.push(controller);
                this.payload.push(topic);
                this.payload.push(JSON.stringify(data));
            }
            Object.defineProperty(PipeMessage.prototype, "topic", {
                get: function () {
                    return this.payload[1];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PipeMessage.prototype, "controller", {
                get: function () {
                    return this.payload[0];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PipeMessage.prototype, "data", {
                get: function () {
                    return this.payload[2];
                },
                enumerable: true,
                configurable: true
            });
            PipeMessage.prototype.toMessage = function () {
                return;
            };
            PipeMessage.prototype.toBuffer = function () {
                return new Buffer(this.payload.join("|"));
            };
            PipeMessage.prototype.toString = function () {
                return this.payload.join("|");
            };
            PipeMessage.fromBuffer = function (buffer) {
                var arr = buffer.toString().split("|");
                return new PipeMessage(arr[0], arr[1], arr[2]);
            };
            return PipeMessage;
        }());
        Client.PipeMessage = PipeMessage;
        var NodeJSClient = (function () {
            function NodeJSClient(transportMessage) {
                var _this = this;
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                this.transportMessage = transportMessage;
                this.events = new events_1.EventEmitter();
                this.socket = new net.Socket();
                this.socket.addListener("data", function (buffer) {
                    var message = transportMessage.fromBuffer(buffer);
                    _this.events.emit(message.topic, message.data);
                });
                this.socket.addListener("error", function (err) {
                    //  do ops
                });
            }
            NodeJSClient.prototype.off = function (topic) {
                this.events.removeAllListeners(topic);
            };
            NodeJSClient.prototype.once = function (topic, fn) {
                this.events.once(topic, fn);
            };
            NodeJSClient.prototype.on = function (topic, fn) {
                this.events.on(topic, fn);
            };
            NodeJSClient.prototype.invoke = function (topic, data, controller) {
                var message = new this.transportMessage(controller, topic, JSON.stringify(data || new Object()));
                this.socket.write(message.toBuffer());
            };
            NodeJSClient.prototype.subscribe = function (topic, controller, fn) {
                this.on(topic, fn);
                this.invoke("___subscribe", new Subscription(topic, controller).toString(), controller);
            };
            NodeJSClient.prototype.unsubscribe = function (topic, controller) {
                this.off(topic);
                this.invoke("___unsubscribe", new Subscription(topic, controller), controller);
            };
            NodeJSClient.prototype.open = function (host, port, controller) {
                var _this = this;
                this.events.once("___open", function (ci) {
                    _this.onOpen(ci);
                });
                this.socket.connect(port, host, function () {
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