import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class MegaChannel extends Button {
    constructor() {
        super({name: "megachannel"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        admin.mainMessage = ctx.update.callback_query.message.message_id;
        if(!admin.futurePost) {
            admin.futurePost = {};
        }

        if(admin.futurePost.channels.includes(ctx.update.callback_query.data.split("_")[1])) {
            admin.futurePost.channels = [...admin.futurePost.channels.filter(id => id != ctx.update.callback_query.data.split("_")[1])]
            await admin.save()
        } else {
            admin.futurePost.channels = admin.futurePost.channels[0] ? [...admin.futurePost.channels, ctx.update.callback_query.data.split("_")[1]] : [ctx.update.callback_query.data.split("_")[1]]
            await admin.save()
        }

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
        channelsPanel.text("⏭️Дальше", "megaspams-next").row()
        channelsPanel.text("🔙 Назад", "back-channel-admin").row()

        const buttonRow = channelsPanel.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "⚙️Выберите каналы для рассылки");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}