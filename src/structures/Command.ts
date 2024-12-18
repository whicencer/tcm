import { HearsContext, Context, Bot } from "grammy";
import { Message } from "grammy/types";

export abstract class Command {
    data: CommandData;

    constructor(data: CommandData) {
        this.data = data;
    }

    abstract run(ctx: HearsContext<Context>, client: Bot): Promise<Message.TextMessage | Message.PhotoMessage | any>;
}

interface CommandData {
    name: string | string[]
} 