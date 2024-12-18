import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";

export default class AddButtonGreeting extends Button {
    constructor() {
        super({name: "add-buttonspam"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        await Admin.updateOne({_id: ctxUser.user.id}, {
            inputMode: true,
            command: "spams 4",
            mainMessage: ctx.update.callback_query.message.message_id,
            cleanMessages: true
        });

        const inlineKeyboard = new InlineKeyboard()
            .text("🔙 Назад", "back-channel-spams").row()

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "❔ Создайте кнопку по схеме:\n" +
            "Пример1:\n" +
            "Текст - ссылка\n" +
            "Текст - ссылка\n" +
            "(кнопки становятся горизонтально)\n" +
            "\n" +
            "Пример2:\n" +
            "Текст - ссылка | Текст - ссылка\n" +
            "Так же можете добавить вторую кнопку впяд с помощью символа \"|\"\n" +
            "(кнопки становятся вертикально)");        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}