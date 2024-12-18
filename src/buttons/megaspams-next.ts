import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";

export default class MegaspamsNext extends Button {
    constructor() {
        super({name: "megaspams-next"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        if(!admin.futurePost.channels[0]) {
            const inlineKeyboard = new InlineKeyboard()
                .text("🔙 Назад", "back-channel-admin").row()

            const buttonRow = inlineKeyboard.row();
            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "❌ Выберите хотя бы один канал");
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            await ctx.answerCallbackQuery()
        } else {
            await Admin.updateOne({_id: ctxUser.user.id}, {
                inputMode: true,
                command: "megaspams 1",
                mainMessage: ctx.update.callback_query.message.message_id,
                cleanMessages: true
            });

            const inlineKeyboard = new InlineKeyboard()
                .text("🔙 Назад", "back-channel-admin").row()

            const buttonRow = inlineKeyboard.row();
            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "❔ Напишите текст рассылки");
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            await ctx.answerCallbackQuery()
        }
    }
}