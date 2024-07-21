import {HearsContext, Context, InlineKeyboard} from "grammy";
import {Command} from "../structures/Command";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";
import {User} from "../schemas/User.schema";

export default class MyChannels extends Command {
    constructor() {
        super({name: "mychannels"});
    }

    async run(ctx: HearsContext<Context>, bot) {
        const ctxUser = await ctx.getAuthor();
        const channels = await Channel.find({admin: ctxUser.user.id});

        const channelsPanel = new InlineKeyboard()

        channels.forEach((channel, index) => {
            channelsPanel.text(channel.name, "channel_" + channel._id).row()
        })

        channelsPanel.text("❔ Нюансы настройки канла", "faq").row()

        const mainMessage = await ctx.reply(`${channels.length ? "✅ Выберите канал для его настройки" : "❌ Нет каналов для настройки.\nДобавьте бота в канал на правах администратора, если вы всё сделаете правильно - вам придёт уведомление"}`, {
            reply_markup: channelsPanel,
        });

        await Admin.updateOne({_id: ctxUser.user.id}, {
            mainMessage: mainMessage.message_id,
        });
    }
}