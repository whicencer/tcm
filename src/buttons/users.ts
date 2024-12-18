import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";

export default class Users extends Button {
    constructor() {
        super({name: "users"});
    }

    async run(ctx, bot) {
        const inlineKeyboard = new InlineKeyboard()
            .text("➕ Добавить пользователя", "add-user").row()
            .text("➖ Удалить пользователя", "delete-user").row()
            .text("📃 Список пользователей", "user-list").row()
            .text("🔙 Назад", "back-channel-admin").row()

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "⚙️Выберите действие");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}