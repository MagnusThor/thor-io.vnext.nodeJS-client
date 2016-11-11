import { EventEmitter } from 'events';
import * as net from 'net';

export namespace ThorIO.Client {
    export class Message {
        D: any;
        C: string;
        T: string;
        constructor(topic: string, object: any, controller: string) {
            this.T = topic;
            this.D = object;
            this.C = controller;
        }
        get topic() {
            return this.T
        }
        get controller(): string {
            return this.C
        }
        get data(): string {
            return this.D;
        }
    }

    export interface ITransportMessage {
        toMessage(payload?: any): any
        toBuffer(): Buffer
        topic: string;
        data: any;
        controller: string;
    }

    export class Subscription {
        public topic: string;
        public controller: string;
        constructor(topic: string, controller: string) {
            this.topic = topic;
            this.controller = controller;
        }
        toString() {
            return JSON.stringify(this);
        }
    }

    export class BufferMessage implements ITransportMessage {
        constructor(public controller: string, public topic: string, public data: string) {

        }
        toMessage(buffer: Buffer): Message {
            const headerLen = 3;
            const tLen = buffer.readUInt8(0);
            const cLen = buffer.readUInt8(1);
            const dLen = buffer.readUInt8(2);
            let offset = headerLen;
            const topic = buffer.toString("utf-8", offset, tLen + offset);
            offset += tLen;
            const controller = buffer.toString("utf-8", offset, offset + cLen);
            offset += cLen;
            const data = buffer.toString("utf-8", offset, offset + dLen)
            let message = new Message(topic, data, controller);
            return message;
        }
        toBuffer(): Buffer {

            const header = 3;

            let offset = 0;
            const tLen = this.topic.length;
            const dLen = this.data.length;
            const cLen = this.controller.length;
            let bufferSize = header + tLen + dLen + cLen;

            let buffer = new Buffer(bufferSize);

            buffer.writeUInt8(tLen, 0);
            buffer.writeUInt8(cLen, 1)
            buffer.writeInt8(dLen, 2);

            offset = header;
            buffer.write(this.topic, offset);
            offset += tLen;
            buffer.write(this.controller, offset);
            offset += cLen;
            buffer.write(this.data, offset);

            return buffer;

        }
        static fromBuffer(buffer: Buffer): Message {
            const headerLen = 3;
            const tLen = buffer.readUInt8(0);
            const cLen = buffer.readUInt8(1);
            const dLen = buffer.readUInt8(2);
            let offset = headerLen;
            const topic = buffer.toString("utf-8", offset, tLen + offset);
            offset += tLen;
            const controller = buffer.toString("utf-8", offset, offset + cLen);
            offset += cLen;
            const data = buffer.toString("utf-8", offset, offset + dLen)

            let message = new Message(topic, data, controller);
            return message;
        }
    }

    export class PipeMessage implements ITransportMessage {

        private payload: Array<string>;

        get topic() {
            return this.payload[1];
        }
        get controller() {
            return this.payload[0];
        }
        get data() {
            return this.payload[2];
        }

        constructor(controller: string, topic: string, data: any) {
            this.payload = new Array<string>();
            this.payload.push(controller);
            this.payload.push(topic);
            this.payload.push(JSON.stringify(data));
        }
        toMessage(): Message {
            return;
        }
        toBuffer(): Buffer {
            return new Buffer(this.payload.join("|"));
        }
        toString() {
            return this.payload.join("|");
        }
        static fromBuffer(buffer: Buffer): PipeMessage {
            let arr = buffer.toString().split("|");
            return new PipeMessage(arr[0], arr[1], arr[2]);
        }
    }

    export class NodeJSClient {

        onOpen: Function;
        onClose: Function;
        onMessage: Function
        onError: Function

        socket: net.Socket;
        events: EventEmitter;
        constructor(public transportMessage: any, ...args: any[]) {

            this.events = new EventEmitter();
            this.socket = new net.Socket()
            this.socket.addListener("data", (buffer: Buffer) => {
                let message = transportMessage.fromBuffer(buffer);

                this.events.emit(message.topic, message.data);
            });
            this.socket.addListener("error", (err: any) => {
                //  do ops
            });

        }
        off(topic: string) {
            this.events.removeAllListeners(topic);
        }
        once(topic: string, fn: Function) {
            this.events.once(topic, fn);
        }
        on(topic: string, fn: Function) {
            this.events.on(topic, fn);
        }
        invoke(topic: string, data: any, controller: string) {
            let message = new this.transportMessage(controller, topic, JSON.stringify(data || new Object()));
            this.socket.write(message.toBuffer());
        }
        subscribe(topic: string, controller: string, fn: Function) {
            this.on(topic, fn);
            this.invoke("___subscribe", new Subscription(topic, controller).toString(), controller);
        }
        unsubscribe(topic: string, controller: string) {
            this.off(topic);
            this.invoke("___unsubscribe", new Subscription(topic, controller), controller);
        }
        open(host: string, port: number, controller: string) {
            this.events.once("___open", (ci: any) => {
                this.onOpen(ci);
            });
            this.socket.connect(port, host, () => {
                this.invoke("___connect", {}, controller)
            });
        }
        close() {
            this.socket.destroy();
        }
    }
}