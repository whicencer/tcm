import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class GreetTimeOut extends Button {
    constructor() {
        super({name: [
                "post-timeout-0",
                "post-timeout-3000",
                "post-timeout-5000",
                "post-timeout-10000",
                "post-timeout-15000",
                "post-timeout-30000",
                "post-timeout-60000",
                "post-timeout-120000",
                "post-timeout-180000",
                "post-timeout-240000",
                "post-timeout-300000",
                "post-timeout-600000",
                "post-timeout-900000",
                "post-timeout-1800000",
                "post-timeout-3600000",
                "post-timeout-7200000",
                "post-timeout-21600000",
                "post-timeout-43200000",
                "post-timeout-64800000",
                "post-timeout-86400000",
                "post-timeout-108000000",
                "post-timeout-129600000",
                "post-timeout-151200000",
                "post-timeout-172800000"
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        channel.futurePost.timeOut = ctx.update.callback_query.data.split("-")[2];
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