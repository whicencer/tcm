import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class Megaspams extends Button {
    constructor() {
        super({name: "megaspams"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id}) || await Admin.findOne({username: ctxUser.user.username});
        const channels = await Channel.find();
        const channelsPanel = new InlineKeyboard()

        channels.forEach((channel, index) => {
            if(index + 1 === channels.length){
                channelsPanel.text(`${admin?.futurePost ? admin.futurePost.channels.includes(channel._id) ? `✅ ${channel.name}` : channel.name : channel.name}`, "megachannel_" + channel._id).row();
            } else if((index + 1) % 2 === 0) {
                channelsPanel.text(`${admin?.futurePost ? admin.futurePost.channels.includes(channel._id) ? `✅ ${channel.name}` : channel.name : channel.name}`, "megachannel_" + channel._id).row();
            } else {
                channelsPanel.text(`${admin?.futurePost ? admin.futurePost.channels.includes(channel._id) ? `✅ ${channel.name}` : channel.name : channel.name}`, "megachannel_" + channel._id);
            }
        })

        channelsPanel.text("❔ Нюансы настройки канла", "faq").row()
        channelsPanel.text("🔙 Назад", "back-channel-admin").row()

        const buttonRow = channelsPanel.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "⚙️Выберите канал для рассылки");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}