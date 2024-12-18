import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class GreetDelete extends Button {
    constructor() {
        super({name: [
                "leave-delete-0",
                "leave-delete-3000",
                "leave-delete-5000",
                "leave-delete-10000",
                "leave-delete-15000",
                "leave-delete-30000",
                "leave-delete-60000",
                "leave-delete-120000",
                "leave-delete-180000",
                "leave-delete-240000",
                "leave-delete-300000",
                "leave-delete-600000",
                "leave-delete-900000",
                "leave-delete-1800000",
                "leave-delete-3600000",
                "leave-delete-7200000",
                "leave-delete-21600000",
                "leave-delete-43200000",
                "leave-delete-64800000",
                "leave-delete-86400000"
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        const currentGreet = channel.leaving[admin.secondValue]

        channel.leaving = [...channel.leaving.filter((val, index) => index !== admin.secondValue), {
            ...currentGreet,
            autoDelete: ctx.update.callback_query.data.split("-")[2]
        }]
        await channel.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-text-leaving").row()
            .text("🖼️ Редактировать изображение", "edit-image-leaving").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-leaving").row()
            .text("❌ Редактировать задержку перед удалением", "edit-delete-leaving").row()
            .text("➕ Добавить кнопку", "add-button-leaving").row()
            .text("❓ Удалить все кнопки", "delete-buttons-leaving").row()
            .text("🔙 Назад", "back-channel-leaving").row()

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Теперь можете настроить остальное`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}