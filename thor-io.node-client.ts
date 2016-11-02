
import * as buffer from 'buffer';
import * as console from 'console';
import { EventEmitter } from 'events';
import { ENGINE_METHOD_PKEY_ASN1_METHS } from 'constants';

import * as net from 'net';

export namespace ThorIO.Client
{
    export class PipeMessage{
        private arr: Array<string>;
        constructor(controller:string,topic:string,data:any){
            this.arr = new Array<string>();
            this.arr.push(controller);
            this.arr.push(topic);
            this.arr.push(JSON.stringify(data));    
        }
        
        get topic(){
            return this.arr[1];
        }

        get controller(){
            return this.arr[0];
        }

        get data(){
            return this.arr[2];
        }
     
        toString(){
            return this.arr.join("|");
        }

        static fromBuffer(buffer:Buffer): PipeMessage
        {
               let arr = buffer.toString().split("|");
               return new PipeMessage(arr[0],arr[1],arr[2]);
        }

    }

     export class Subscription {
        public topic: string;
        public controller: string;
        constructor(topic: string, controller: string) {
            this.topic = topic;
            this.controller = controller;
        }
        toString(){
            return JSON.stringify(this);
        }
    }

    export class NodeJSClient 
    {   
        
            onOpen: Function;
            onClose: Function;
            onMessage:Function
            onError: Function
            socket:net.Socket;
            events: EventEmitter;
            constructor(){
                   this.events = new EventEmitter();
                   
                   this.socket = new net.Socket()
                   this.socket.addListener("data", (buffer:Buffer) => {
                    let pipeMessage = PipeMessage.fromBuffer(buffer);
                 
                    this.events.emit(pipeMessage.topic,pipeMessage.data);
                   });

                   this.socket.addListener("error", (err:any) => {
                      //  console.log(err);
                   });


                   this.on("___open", (data:any) => {
                        this.onOpen(data);
                   });
            }

         

            off(topic:string){

                this.events.removeAllListeners(topic);
            }

            on(topic:string,fn:Function){
              
                    this.events.on(topic,fn);
                  
            }

            invoke(topic:string,data:any,controller:string){
                let pipeMessage = new PipeMessage(controller,topic,data || new Object())
            
                this.socket.write(pipeMessage.toString());
            }
            subscribe(topic:string,controller:string,fn:Function){
                this.on(topic,fn);
                this.invoke("___subscribe",new Subscription(topic,controller).toString(),controller);
            }
            unsubscribe(){

            }
            open(host:string,port:number,controller:string){
                this.socket.connect(port,host,() => {;
                    this.invoke("___connect",{},controller)
                });
            }

            close(){
                this.socket.destroy();
            }
    }

}