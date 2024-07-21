import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class LeaveDelete extends Button {
    constructor() {
        super({name: [
                "created-leaving-delete-0",
                "created-leaving-delete-3000",
                "created-leaving-delete-5000",
                "created-leaving-delete-10000",
                "created-leaving-delete-15000",
                "created-leaving-delete-30000",
                "created-leaving-delete-60000",
                "created-leaving-delete-120000",
                "created-leaving-delete-180000",
                "created-leaving-delete-240000",
                "created-leaving-delete-300000",
                "created-leaving-delete-600000",
                "created-leaving-delete-900000",
                "created-leaving-delete-1800000",
                "created-leaving-delete-3600000",
                "created-leaving-delete-7200000",
                "created-leaving-delete-21600000",
                "created-leaving-delete-43200000",
                "created-leaving-delete-64800000",
                "created-leaving-delete-86400000",
                "created-greet-timeout-108000000",
                "created-greet-timeout-129600000",
                "created-greet-timeout-151200000",
                "created-greet-timeout-172800000"
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        const currentLeave = channel.leaving[channel.leaving.length - 1]

        channel.leaving = [...channel.leaving.filter((val, index) => index !== channel.leaving.length - 1), {
            ...currentLeave,
            autoDelete: ctx.update.callback_query.data.split("-")[3]
        }]
        await channel.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-created-text-leaving").row()
            .text("🖼️ Редактировать изображение", "edit-created-image-leaving").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-created-timeout-leaving").row()
            .text("❌ Редактировать задержку перед удалением", "edit-created-delete-leaving").row()
            .text("➕ Добавить кнопку", "add-created-buttonleaving").row()
            .text("❓ Удалить все кнопки", "delete-created-buttons-leaving").row()
            .text("🔙 Назад", "back-channel-leaving").row()

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Теперь можете настроить остальное`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}