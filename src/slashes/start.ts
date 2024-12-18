import {HearsContext, Context} from "grammy";
import {Command} from "../structures/Command";

export default class Start extends Command {
    constructor() {
        super({name: "start"});
    }

    async run(ctx: HearsContext<Context>, bot) {
        await ctx.reply("😀 Доброго времени стуок! Ты попал в бота для управления каналами доступного только тебе. \nЧтобы начать работу используй команду: /mychannels\n")
    }
}
