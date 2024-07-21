import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class AddCreatedButtonGreeting extends Button {
    constructor() {
        super({name: "add-buttongreeting"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        if(channel.greeting[admin.secondValue].image && typeof channel.greeting[admin.secondValue].image !== "string") {
            const inlineKeyboard = new InlineKeyboard()
                .text("📖 Редактировать текст", "edit-text-greeting").row()
                .text("🖼️ Редактировать изображение", "edit-image-greeting").row()
                .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-greeting").row()
                .text("❌ Редактировать задержку перед удалением", "edit-delete-greeting").row()
                .text("➕ Добавить кнопку", "add-buttongreeting").row()
                .text("❓ Удалить все кнопки", "delete-buttons-greeting").row()
                .text("🔙 Назад", "back-channel-greeting").row();

            const buttonRow = inlineKeyboard.row();

            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "❌ Вы не можете редактировать кнопки");
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            await ctx.answerCallbackQuery()
        } else {
            await Admin.updateOne({_id: ctxUser.user.id}, {
                inputMode: true,
                command: "greetedit 3",
                mainMessage: ctx.update.callback_query.message.message_id,
                cleanMessages: true
            });
            const inlineKeyboard = new InlineKeyboard()
                .text("🔙 Назад", "back-channel-greeting").row()

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
                "(кнопки становятся вертикально)");            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            await ctx.answerCallbackQuery()
        }
    }
}