import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class GreeteditTimeout extends Button {
    constructor() {
        super({name: [
                "greetedit-timeout-0",
                "greetedit-timeout-3000",
                "greetedit-timeout-5000",
                "greetedit-timeout-10000",
                "greetedit-timeout-15000",
                "greetedit-timeout-30000",
                "greetedit-timeout-60000",
                "greetedit-timeout-120000",
                "greetedit-timeout-180000",
                "greetedit-timeout-240000",
                "greetedit-timeout-300000",
                "greetedit-timeout-600000",
                "greetedit-timeout-900000",
                "greetedit-timeout-1800000",
                "greetedit-timeout-3600000",
                "greetedit-timeout-7200000",
                "greetedit-timeout-21600000",
                "greetedit-timeout-43200000",
                "greetedit-timeout-64800000",
                "greetedit-timeout-86400000",
                "greetedit-timeout-108000000",
                "greetedit-timeout-129600000",
                "greetedit-timeout-151200000",
                "greetedit-timeout-172800000"
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        const currentGreet = channel.greeting[admin.secondValue]

        channel.greeting = [...channel.greeting.filter((val, index) => index !== admin.secondValue), {
            ...currentGreet,
            timeOut: ctx.update.callback_query.data.split("-")[2]
        }]
        await channel.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-text-greeting").row()
            .text("🖼️ Редактировать изображение", "edit-image-greeting").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-greeting").row()
            .text("❌ Редактировать задержку перед удалением", "edit-delete-greeting").row()
            .text("➕ Добавить кнопку", "add-buttongreeting").row()
            .text("❓ Удалить все кнопки", "delete-buttons-greeting").row()
            .text("🔙 Назад", "back-channel-greeting").row();

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Теперь можете настроить остальное`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}