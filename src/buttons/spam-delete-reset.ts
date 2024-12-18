import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class MyChannels extends Button {
    constructor() {
        super({name: "spam-delete-reset"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        channel.futurePost.autoDelete = undefined
        await channel.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-text-spam").row()
            .text("🖼️ Редактировать изображение", "edit-image-spam").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-spam").row()
            .text("❌ Редактировать задержку перед удалением", "edit-delete-spam").row()
            .text("➕ Добавить кнопку", "add-buttonspam").row()
            .text("❓ Удалить все кнопки", "delete-buttons-spam").row()
            .text("✅ Отправить рассылку", "send-spam").row()
            .text("🔙 Назад", "back-channel-2").row();

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Теперь можете настроить остальное`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}