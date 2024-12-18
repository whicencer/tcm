import { HearsContext, Context, Bot } from "grammy";
import { Message } from "grammy/types";

export abstract class Button {
    data: buttonData;

    constructor(data: buttonData) {
        this.data = data;
    }

    abstract run(ctx, client: Bot): Promise<Message.TextMessage | Message.PhotoMessage | any>;
}

interface buttonData {
    name: string | string[]
}