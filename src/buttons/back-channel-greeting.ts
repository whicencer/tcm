import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class BackChannel extends Button {
    constructor() {
        super({name: "back-channel-greeting"});
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

        if (channel.greeting.length) {
            for (const greet of channel.greeting) {
   const timeOut = `⌛ ${(greet.timeOut / 1000) > 60 ? (greet.timeOut / 1000 / 60 / 60) > 1 ? `${(greet.timeOut / 1000 / 60 /60)}ч.` :`${(greet.timeOut / 1000 / 60)}м.` : `${greet.timeOut / 1000}с.`}`;
                const autoDelete = greet?.autoDelete ? `❌ ${(greet.autoDelete / 1000) > 60 ? (greet.autoDelete / 1000 / 60 / 60) > 1 ? `${(greet.autoDelete / 1000 / 60 /60)}ч.` :`${(greet.autoDelete / 1000 / 60)}м.` : `${greet.autoDelete / 1000}с.`}` : ""
                inlineKeyboard.text(`${timeOut} ${autoDelete}`, "a")
                inlineKeyboard.text(`${greet.text.slice(0, 10)}...`, `greetedit_${channel.greeting.indexOf(greet)}`).row()
            }
        }

        inlineKeyboard
            .text("➕ Добавить приветствие", "add-greeting")
            .text("➖ Удалить приветствие", "delete-greeting").row()
            .text("🔙 Назад", "back-channel-2").row()

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Выберите действие`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}