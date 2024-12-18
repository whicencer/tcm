import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";

export default class EditTextGreeting extends Button {
    constructor() {
        super({name: "edit-text-leaving"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        await Admin.updateOne({_id: ctxUser.user.id}, {
            inputMode: true,
            command: "leaveedit 2",
            mainMessage: ctx.update.callback_query.message.message_id,
            cleanMessages: true
        });

        const inlineKeyboard = new InlineKeyboard()
            .text("🔙 Назад", "back-channel-leaving").row()

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "❔ Напишите текст прощания");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}