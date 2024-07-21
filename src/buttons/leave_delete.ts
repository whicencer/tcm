import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class LeaveDelete extends Button {
    constructor() {
        super({name: "leave_delete"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        channel.leaving = [...channel.leaving.filter((val, index) => index !== parseInt(ctx.update.callback_query.data.split("_")[2]))]
        await channel.save()

        const inlineKeyboard = new InlineKeyboard()

        if (channel.leaving.length) {
            for (const leave of channel.leaving) {
                const timeOut = `⌛ ${(leave.timeOut / 1000) > 60 ? `${(leave.timeOut / 1000 / 60)}м.` : `${leave.timeOut / 1000}с.`}`;
                const autoDelete = leave?.autoDelete ? `❌ ${(leave.autoDelete / 1000) > 60 ? `${(leave.autoDelete / 1000 / 60)}м.` : `${leave.autoDelete / 1000}с.`}` : ""
                inlineKeyboard.text(`${timeOut} ${autoDelete}`, "a")
                inlineKeyboard.text(`${leave.text.slice(0, 10)}...`, `leaveedit_${channel.leaving.indexOf(leave)}`).row()
            }
        }

        inlineKeyboard
            .text("➕ Добавить прощание", "add-leaving")
            .text("➖ Удалить прощание", "delete-leaving").row()
            .text("🔙 Назад", "back-channel-2").row()

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "✅ Успешно! Прощание удалено!");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}