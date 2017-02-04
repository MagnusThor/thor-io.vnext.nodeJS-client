import { EventEmitter } from 'events';
import * as net from 'net';
export declare namespace ThorIO.Client {
    class Message {
        D: any;
        C: string;
        T: string;
        constructor(topic: string, object: any, controller: string);
        readonly topic: string;
        readonly controller: string;
        readonly data: string;
    }
    interface ITransportMessage {
        toMessage(payload?: any): any;
        toBuffer(): Buffer;
        topic: string;
        data: any;
        controller: string;
    }
    class Subscription {
        topic: string;
        controller: string;
        constructor(topic: string, controller: string);
        toString(): string;
    }
    class BufferMessage implements ITransportMessage {
        controller: string;
        topic: string;
        data: string;
        constructor(controller: string, topic: string, data: string);
        toMessage(buffer: Buffer): Message;
        toBuffer(): Buffer;
        static fromBuffer(buffer: Buffer): Message;
    }
    class PipeMessage implements ITransportMessage {
        private payload;
        readonly topic: string;
        readonly controller: string;
        readonly data: string;
        constructor(controller: string, topic: string, data: any);
        toMessage(): Message;
        toBuffer(): Buffer;
        toString(): string;
        static fromBuffer(buffer: Buffer): PipeMessage;
    }
    class NodeJSClient {
        transportMessage: any;
        onOpen: Function;
        onClose: Function;
        onMessage: Function;
        onError: Function;
        socket: net.Socket;
        events: EventEmitter;
        constructor(transportMessage: any, ...args: any[]);
        off(topic: string): void;
        once(topic: string, fn: Function): void;
        on(topic: string, fn: Function): void;
        invoke(topic: string, data: any, controller: string): void;
        subscribe(topic: string, controller: string, fn: Function): void;
        unsubscribe(topic: string, controller: string): void;
        open(host: string, port: number, controller: string): void;
        close(): void;
    }
}
