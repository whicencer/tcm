import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class MyChannels extends Button {
    constructor() {
        super({name: "created-leaving-delete-reset"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        const currentGreet = channel.leaving[channel.greeting.length - 1]

        channel.leaving = [...channel.leaving.filter((val, index) => index !== channel.leaving.length - 1), {
            ...currentGreet,
            timeOut: undefined
        }]
        await channel.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-created-text-leaving").row()
            .text("🖼️ Редактировать изображение", "edit-created-image-leaving").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-created-timeout-leaving").row()
            .text("❌ Редактировать задержку перед удалением", "edit-created-delete-leaving").row()
            .text("➕ Добавить кнопку", "add-created-buttonleaving").row()
            .text("❓ Удалить все кнопки", "delete-created-buttons-leaving").row()
            .text("🔙 Назад", "back-channel-leaving").row();

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Теперь можете настроить остальное`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}