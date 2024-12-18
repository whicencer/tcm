import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class MyChannels extends Button {
    constructor() {
        super({name: "created-greet-delete-reset"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        const currentGreet = channel.greeting[channel.greeting.length - 1]

        channel.greeting = [...channel.greeting.filter((val, index) => index !== channel.greeting.length - 1), {
            ...currentGreet,
            autoDelete: undefined
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