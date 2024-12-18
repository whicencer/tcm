import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class GreetDelete extends Button {
    constructor() {
        super({name: [
                "megaspam-delete-0",
                "megaspam-delete-3000",
                "megaspam-delete-5000",
                "megaspam-delete-10000",
                "megaspam-delete-15000",
                "megaspam-delete-30000",
                "megaspam-delete-60000",
                "megaspam-delete-120000",
                "megaspam-delete-180000",
                "megaspam-delete-240000",
                "megaspam-delete-300000",
                "megaspam-delete-600000",
                "megaspam-delete-900000",
                "megaspam-delete-1800000",
                "megaspam-delete-3600000",
                "megaspam-delete-7200000",
                "megaspam-delete-21600000",
                "megaspam-delete-43200000",
                "megaspam-delete-64800000",
                "megaspam-delete-86400000",
                "megaspam-delete-108000000",
                "megaspam-delete-129600000",
                "megaspam-delete-151200000",
                "megaspam-delete-172800000"
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});

        admin.futurePost.autoDelete = ctx.update.callback_query.data.split("-")[2]
        await admin.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-text-megaspam").row()
            .text("🖼️ Редактировать изображение", "edit-image-megaspam").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-megaspam").row()
            .text("❌ Редактировать задержку перед удалением", "edit-delete-megaspam").row()
            .text("➕ Добавить кнопку", "add-buttonmegaspam").row()
            .text("❓ Удалить все кнопки", "delete-buttons-megaspam").row()
            .text("✅ Отправить рассылку", "send-megaspam").row()
            .text("🔙 Назад", "back-channel-admin").row();

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Теперь можете настроить остальное`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}