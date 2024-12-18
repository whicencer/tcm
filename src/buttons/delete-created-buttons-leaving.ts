import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class DeleteCreatedButtonsLeaving extends Button {
    constructor() {
        super({name: "delete-created-buttons-leaving"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        if(channel.leaving[channel.leaving.length - 1].image && typeof channel.leaving[channel.leaving.length - 1].image !== "string") {
            const inlineKeyboard = new InlineKeyboard()
                .text("📖 Редактировать текст", "edit-created-text-leaving").row()
                .text("🖼️ Редактировать изображение", "edit-created-image-leaving").row()
                .text("⌚ Редактировать задержку перед отправкой", "edit-created-timeout-leaving").row()
                .text("❌ Редактировать задержку перед удалением", "edit-created-delete-leaving").row()
                .text("➕ Добавить кнопку", "add-created-buttonleaving").row()
                .text("❓ Удалить все кнопки", "delete-created-buttons-leaving").row()
                .text("🔙 Назад", "back-channel-leaving").row();

            const buttonRow = inlineKeyboard.row();
            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "❌ Вы не можете редактировать кнопки");
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            await ctx.answerCallbackQuery()
        } else {
            channel.leaving[channel.leaving.length - 1].buttons = [];
            await channel.save();

            const inlineKeyboard = new InlineKeyboard()
                .text("📖 Редактировать текст", "edit-created-text-leaving").row()
                .text("🖼️ Редактировать изображение", "edit-created-image-leaving").row()
                .text("⌚ Редактировать задержку перед отправкой", "edit-created-timeout-leaving").row()
                .text("❌ Редактировать задержку перед удалением", "edit-created-delete-leaving").row()
                .text("➕ Добавить кнопку", "add-created-buttonleaving").row()
                .text("❓ Удалить все кнопки", "delete-created-buttons-leaving").row()
                .text("🔙 Назад", "back-channel-leaving").row();

            const buttonRow = inlineKeyboard.row();
            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "✅ Успешно! Все кнопки удалены\n⚙️ Теперь можете выбрать, что настроить");
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            await ctx.answerCallbackQuery()
        }
    }
}