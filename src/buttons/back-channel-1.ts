import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class BackChannel1 extends Button {
    constructor() {
        super({name: "back-channel-1"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        admin.editingChannel = undefined;
        await  admin.save();
        const channels = await Channel.find({admin: ctxUser.user.id});

        const channelsPanel = new InlineKeyboard()

        channels.forEach((channel, index) => {
            channelsPanel.text(channel.name, "channel_" + channel._id).row()
        })

        channelsPanel.text("❔ Нюансы настройки канла", "faq").row()

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `${channels.length ? "✅ Выберите канал для его настройки" : "❌ Нет каналов для настройки.\nДобавьте бота в канал на правах администратора, если вы всё сделаете правильно - вам придёт увидомление"}`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: channelsPanel});
        await ctx.answerCallbackQuery()
    }
}