import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class GreetTimeOut extends Button {
    constructor() {
        super({name: [
                "megaspam-timeout-0",
                "megaspam-timeout-3000",
                "megaspam-timeout-5000",
                "megaspam-timeout-10000",
                "megaspam-timeout-15000",
                "megaspam-timeout-30000",
                "megaspam-timeout-60000",
                "megaspam-timeout-120000",
                "megaspam-timeout-180000",
                "megaspam-timeout-240000",
                "megaspam-timeout-300000",
                "megaspam-timeout-600000",
                "megaspam-timeout-900000",
                "megaspam-timeout-1800000",
                "megaspam-timeout-3600000",
                "megaspam-timeout-7200000",
                "megaspam-timeout-21600000",
                "megaspam-timeout-43200000",
                "megaspam-timeout-64800000",
                "megaspam-timeout-86400000",
                "megaspam-timeout-108000000",
                "megaspam-timeout-129600000",
                "megaspam-timeout-151200000",
                "megaspam-timeout-172800000"
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});

        admin.futurePost.timeOut = ctx.update.callback_query.data.split("-")[2];
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