import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class GreetTimeOut extends Button {
    constructor() {
        super({name: [
                "spam-timeout-0",
                "spam-timeout-3000",
                "spam-timeout-5000",
                "spam-timeout-10000",
                "spam-timeout-15000",
                "spam-timeout-30000",
                "spam-timeout-60000",
                "spam-timeout-120000",
                "spam-timeout-180000",
                "spam-timeout-240000",
                "spam-timeout-300000",
                "spam-timeout-600000",
                "spam-timeout-900000",
                "spam-timeout-1800000",
                "spam-timeout-3600000",
                "spam-timeout-7200000",
                "spam-timeout-21600000",
                "spam-timeout-43200000",
                "spam-timeout-64800000",
                "spam-timeout-86400000",
                "spam-timeout-108000000",
                "spam-timeout-129600000",
                "spam-timeout-151200000",
                "spam-timeout-172800000"
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        channel.futurePost.timeOut = ctx.update.callback_query.data.split("-")[2];
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