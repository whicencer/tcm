import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class MyChannels extends Button {
    constructor() {
        super({name: "megaspam-delete-reset"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});

        admin.futurePost.autoDelete = undefined
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