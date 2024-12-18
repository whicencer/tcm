import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class Preview extends Button {
    constructor() {
        super({name: "preview"});
    }

    async run(ctx, bot) {
        const channels = await Channel.find();
        const channelsPanel = new InlineKeyboard()

        channels.forEach((channel, index) => {
            if(index + 1 === channels.length){
                channelsPanel.text(channel.name, "channel_" + channel._id).row();
            } else if((index + 1) % 2 === 0) {
                channelsPanel.text(channel.name, "channel_" + channel._id).row();
            } else {
                channelsPanel.text(channel.name, "channel_" + channel._id);
            }
        })

        channelsPanel.text("❔ Нюансы настройки канла", "faq").row()
        channelsPanel.text("🔙 Назад", "back-channel-admin").row()

        const buttonRow = channelsPanel.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "⚙️Выберите канал для настройки");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}