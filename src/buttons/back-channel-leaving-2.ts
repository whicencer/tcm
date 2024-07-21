import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class BackChannel extends Button {
    constructor() {
        super({name: "back-channel-leaving-2"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        admin.inputMode = undefined;
        admin.command = undefined;
        admin.cleanMessages = false;
        await admin.save()

        if(admin.messagesToDelete?.length) {
            admin.messagesToDelete.forEach(async (message) => {
                await ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, message)
            })
        }

        if(admin.preEdit) {
            await ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, admin.preEdit)
        }

        admin.preEdit = undefined;
        admin.messagesToDelete = undefined;
        await admin.save()

        const inlineKeyboard = new InlineKeyboard()

        if (channel.leaving.length) {
            for (const leave of channel.leaving) {
                const timeOut = `⌛ ${(leave.timeOut / 1000) > 60 ? `${(leave.timeOut / 1000 / 60)}м.` : `${leave.timeOut / 1000}с.`}`;
                const autoDelete = leave?.autoDelete ? `❌ ${(leave.autoDelete / 1000) > 60 ? `${(leave.autoDelete / 1000 / 60)}м.` : `${leave.autoDelete / 1000}с.`}` : ""
                inlineKeyboard.text(`${timeOut} ${autoDelete}`, "a")
                inlineKeyboard.text(`${leave.text.slice(0, 10)}...`, `greetedit_${channel.leaving.indexOf(leave)}`).row()
            }
        }

        inlineKeyboard
            .text("➕ Добавить приветствие", "add-leaving")
            .text("➖ Удалить приветствие", "delete-leaving").row()
            .text("🔙 Назад", "back-channel-2").row()

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}