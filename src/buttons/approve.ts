import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class AutoApprove extends Button {
    constructor() {
        super({name: "auto-approve"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        await Channel.updateOne({_id: admin.editingChannel}, {
            autoApprove: {
                switched: channel.autoApprove.switched ? false : true
            }
        });


        const inlineKeyboard = new InlineKeyboard()
            .text("🔙 Назад", "back-channel-2").row()

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `✅ Успешно! Автоматическое одобрение заявок ${channel.autoApprove.switched ? "выключено" : "включено"}`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}