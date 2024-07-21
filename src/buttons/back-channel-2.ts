import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class BackChannel extends Button {
    constructor() {
        super({name: "back-channel-2"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        admin.inputMode = undefined;
        admin.command = undefined
        admin.cleanMessages = false;
        await admin.save()
        const channel = await Channel.findOne({_id: admin.editingChannel});

        if(admin.messagesToDelete) {
            admin.messagesToDelete.forEach(async (message) => {
                await ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, message)
            })
        }

        if(channel.futurePost) {
            channel.futurePost = undefined;
            await channel.save()
        }

        if(admin.preEdit) {
            await ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, admin.preEdit)
        }

        admin.messagesToDelete = undefined;
        admin.preEdit = undefined;
        await admin.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("👋 Настроить приветствие", "greeting").row()
            .text("🫂 Настроить прощание", "leaving").row()
            .text(`🤖 ${channel.captcha ? "Выключить" : "Включить"} капчу`, "captcha").row()
            .text("📫 Сделать рассылку", "spam").row()
            .text("💬 Опубликовать пост", "make-post").row()
            .text(`👌 Настроить одобрение заявок`, "approve-settings").row()
            .text("🔙 Назад", "back-channel-1").row()

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "⚙️Выберите, что настроить");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}