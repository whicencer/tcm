import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class GreetDelete extends Button {
    constructor() {
        super({name: [
                "spam-delete-0",
                "spam-delete-3000",
                "spam-delete-5000",
                "spam-delete-10000",
                "spam-delete-15000",
                "spam-delete-30000",
                "spam-delete-60000",
                "spam-delete-120000",
                "spam-delete-180000",
                "spam-delete-240000",
                "spam-delete-300000",
                "spam-delete-600000",
                "spam-delete-900000",
                "spam-delete-1800000",
                "spam-delete-3600000",
                "spam-delete-7200000",
                "spam-delete-21600000",
                "spam-delete-43200000",
                "spam-delete-64800000",
                "spam-delete-86400000",
                "spam-delete-108000000",
                "spam-delete-129600000",
                "spam-delete-151200000",
                "spam-delete-172800000"
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        channel.futurePost.autoDelete = ctx.update.callback_query.data.split("-")[2]
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