import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class MyChannels extends Button {
    constructor() {
        super({name: "channel"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const channel = await Channel.findOne({_id: ctx.update.callback_query.data.split("_")[1]});
        await Admin.updateOne({_id: ctxUser.user.id}, {
            editingChannel: ctx.update.callback_query.data.split("_")[1],
            mainMessage: ctx.update.callback_query.message.message_id
        })

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