import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class Captcha extends Button {
    constructor() {
        super({name: "captcha"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        const inlineKeyboard = new InlineKeyboard()
            .text("🔙 Назад", "back-channel-2").row()

        const buttonRow = inlineKeyboard.row();
        await Channel.updateOne({_id: admin.editingChannel}, {
            captcha: channel.captcha ? false : true
        });

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `✅ Успешно! Капча ${channel.captcha ? "выключена" : "включена"}`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}