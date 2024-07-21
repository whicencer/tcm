import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class DeleteCreatedButtonsGreeting extends Button {
    constructor() {
        super({name: "delete-buttons-greeting"});
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
            channel.greeting[admin.secondValue].buttons = [];
            await channel.save();

            const inlineKeyboard = new InlineKeyboard()
                .text("📖 Редактировать текст", "edit-text-greeting").row()
                .text("🖼️ Редактировать изображение", "edit-image-greeting").row()
                .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-greeting").row()
                .text("❌ Редактировать задержку перед удалением", "edit-delete-greeting").row()
                .text("➕ Добавить кнопку", "add-buttongreeting").row()
                .text("❓ Удалить все кнопки", "delete-buttons-greeting").row()
                .text("🔙 Назад", "back-channel-greeting").row();

            const buttonRow = inlineKeyboard.row();
            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "✅ Успешно! Все кнопки удалены\n⚙️ Теперь можете выбрать, что настроить");
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            await ctx.answerCallbackQuery()
        }
    }
}