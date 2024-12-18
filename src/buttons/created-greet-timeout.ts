import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class GreetTimeOut extends Button {
    constructor() {
        super({name: [
                "created-greet-timeout-0",
                "created-greet-timeout-3000",
                "created-greet-timeout-5000",
                "created-greet-timeout-10000",
                "created-greet-timeout-15000",
                "created-greet-timeout-30000",
                "created-greet-timeout-60000",
                "created-greet-timeout-120000",
                "created-greet-timeout-180000",
                "created-greet-timeout-240000",
                "created-greet-timeout-300000",
                "created-greet-timeout-600000",
                "created-greet-timeout-900000",
                "created-greet-timeout-1800000",
                "created-greet-timeout-3600000",
                "created-greet-timeout-7200000",
                "created-greet-timeout-21600000",
                "created-greet-timeout-43200000",
                "created-greet-timeout-64800000",
                "created-greet-timeout-86400000",
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
        const currentGreet = channel.greeting[channel.greeting.length - 1]

        channel.greeting = [...channel.greeting.filter((val, index) => index !== channel.greeting.length - 1), {
            ...currentGreet,
            timeOut: ctx.update.callback_query.data.split("-")[3]
        }]
        await channel.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-created-text-greeting").row()
            .text("🖼️ Редактировать изображение", "edit-created-image-greeting").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-created-timeout-greeting").row()
            .text("❌ Редактировать задержку перед удалением", "edit-created-delete-greeting").row()
            .text("➕ Добавить кнопку", "add-created-buttongreeting").row()
            .text("❓ Удалить все кнопки", "delete-created-buttons-greeting").row()
            .text("🔙 Назад", "back-channel-greeting").row()

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Теперь можете настроить остальное`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}