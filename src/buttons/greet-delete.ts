import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class GreetDelete extends Button {
    constructor() {
        super({name: [
                "greet-delete-0",
                "greet-delete-3000",
                "greet-delete-5000",
                "greet-delete-10000",
                "greet-delete-15000",
                "greet-delete-30000",
                "greet-delete-60000",
                "greet-delete-120000",
                "greet-delete-180000",
                "greet-delete-240000",
                "greet-delete-300000",
                "greet-delete-600000",
                "greet-delete-900000",
                "greet-delete-1800000",
                "greet-delete-3600000",
                "greet-delete-7200000",
                "greet-delete-21600000",
                "greet-delete-43200000",
                "greet-delete-64800000",
                "greet-delete-86400000",
                "greet-delete-108000000",
                "greet-delete-129600000",
                "greet-delete-151200000",
                "greet-delete-172800000"
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        const currentGreet = channel.greeting[admin.secondValue]

        channel.greeting = [...channel.greeting.filter((val, index) => index !== admin.secondValue), {
            ...currentGreet,
            autoDelete: ctx.update.callback_query.data.split("-")[2]
        }]
        await channel.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-text-greeting").row()
            .text("🖼️ Редактировать изображение", "edit-image-greeting").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-greeting").row()
            .text("❌ Редактировать задержку перед удалением", "edit-delete-greeting").row()
            .text("➕ Добавить кнопку", "add-button-greeting").row()
            .text("❓ Удалить все кнопки", "delete-buttons-greeting").row()
            .text("🔙 Назад", "back-channel-greeting").row()

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Теперь можете настроить остальное`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}