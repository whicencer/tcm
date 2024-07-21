import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class GreeteditTimeout extends Button {
    constructor() {
        super({name: [
                "leaveedit-timeout-0",
                "leaveedit-timeout-3000",
                "leaveedit-timeout-5000",
                "leaveedit-timeout-10000",
                "leaveedit-timeout-15000",
                "leaveedit-timeout-30000",
                "leaveedit-timeout-60000",
                "leaveedit-timeout-120000",
                "leaveedit-timeout-180000",
                "leaveedit-timeout-240000",
                "leaveedit-timeout-300000",
                "leaveedit-timeout-600000",
                "leaveedit-timeout-900000",
                "leaveedit-timeout-1800000",
                "leaveedit-timeout-3600000",
                "leaveedit-timeout-7200000",
                "leaveedit-timeout-21600000",
                "leaveedit-timeout-43200000",
                "leaveedit-timeout-64800000",
                "leaveedit-timeout-86400000",
                "leaveedit-timeout-108000000",
                "leaveedit-timeout-129600000",
                "leaveedit-timeout-151200000",
                "leaveedit-timeout-172800000",
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        const currentGreet = channel.leaving[admin.secondValue]

        channel.leaving = [...channel.leaving.filter((val, index) => index !== admin.secondValue), {
            ...currentGreet,
            timeOut: ctx.update.callback_query.data.split("-")[2]
        }]
        await channel.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-text-leaving").row()
            .text("🖼️ Редактировать изображение", "edit-image-leaving").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-leaving").row()
            .text("❌ Редактировать задержку перед удалением", "edit-delete-leaving").row()
            .text("➕ Добавить кнопку", "add-buttonleaving").row()
            .text("❓ Удалить все кнопки", "delete-buttons-leaving").row()
            .text("🔙 Назад", "back-channel-leaving").row();

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Теперь можете настроить остальное`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}