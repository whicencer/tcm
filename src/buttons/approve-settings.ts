import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class ApproveSettings extends Button {
    constructor() {
        super({name: "approve-settings"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        const inlineKeyboard = new InlineKeyboard()
            .text(`👋 Автоматическое принятие заявок${channel.autoApprove.switched ? " (✅)" : ""}`, "auto-approve").row()
            .text("👥 Одобрить все заявки", "approve-all").row()
            .text("⌚ Настроить задержку перед автоматическим принятием", "approvetimeout").row()
            .text("🔙 Назад", "back-channel-2").row()

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Выберите, что настроить`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}