import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class GreetDelete extends Button {
    constructor() {
        super({name: [
                "post-delete-0",
                "post-delete-3000",
                "post-delete-5000",
                "post-delete-10000",
                "post-delete-15000",
                "post-delete-30000",
                "post-delete-60000",
                "post-delete-120000",
                "post-delete-180000",
                "post-delete-240000",
                "post-delete-300000",
                "post-delete-600000",
                "post-delete-900000",
                "post-delete-1800000",
                "post-delete-3600000",
                "post-delete-7200000",
                "post-delete-21600000",
                "post-delete-43200000",
                "post-delete-64800000",
                "post-delete-86400000",
                "post-delete-108000000",
                "post-delete-129600000",
                "post-delete-151200000",
                "post-delete-172800000"
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        channel.futurePost.autoDelete = ctx.update.callback_query.data.split("-")[2]
        await channel.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-text-post").row()
            .text("🖼️ Редактировать изображение", "edit-image-post").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-post").row()
            .text("❌ Редактировать задержку перед удалением", "edit-delete-postpost").row()
            .text("➕ Добавить кнопку", "add-buttonpost").row()
            .text("❓ Удалить все кнопки", "delete-buttons-post").row()
            .text("✅ Отправить пост", "send-post").row()
            .text("🔙 Назад", "back-channel-2").row();

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Теперь можете настроить остальное`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}