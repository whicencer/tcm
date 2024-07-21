import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class ApproveAll extends Button {
    constructor() {
        super({ name: "approve-all" });
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        const inlineKeyboard = new InlineKeyboard()
            .text("🔙 Назад", "back-channel-2").row()

        const buttonRow = inlineKeyboard.row();

        if(!channel.autoApprove.switched) {
            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `✅ Успешно! Процесс одобрения заявок начат`);
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            for (const id of channel.requestsList) {
                await ctx.api.approveChatJoinRequest(admin.editingChannel, id);
            }

            channel.requestsList = undefined;
            await channel.save();
        } else {
            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `❌ Нельзя одобрить все заявки, так как у вас режим автоматического одобрения всех заявок!`);
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        }
        await ctx.answerCallbackQuery()
    }
}