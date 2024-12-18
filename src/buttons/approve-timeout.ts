import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class ApproveTimeout extends Button {
    constructor() {
        super({name: [
                "approve-timeout-0",
                "approve-timeout-3000",
                "approve-timeout-5000",
                "approve-timeout-10000",
                "approve-timeout-15000",
                "approve-timeout-30000",
                "approve-timeout-60000",
                "approve-timeout-120000",
                "approve-timeout-180000",
                "approve-timeout-240000",
                "approve-timeout-300000",
                "approve-timeout-600000",
                "approve-timeout-900000",
                "approve-timeout-1800000",
                "approve-timeout-3600000",
                "approve-timeout-7200000",
                "approve-timeout-21600000",
                "approve-timeout-43200000",
                "approve-timeout-64800000",
                "approve-timeout-86400000"
            ]});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        const currentApprove = channel.autoApprove;

        channel.autoApprove =  {
            switched: currentApprove.switched,
            timeOut: ctx.update.callback_query.data.split("-")[2]
        }
        await channel.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("👋 Настроить приветствие", "greeting").row()
            .text("🫂 Настроить прощание", "leaving").row()
            .text(`🤖 ${channel.captcha ? "Выключить" : "Включить"} капчу`, "captcha").row()
            .text("📫 Сделать рассылку", "spam").row()
            .text("💬 Опубликовать пост", "make-post").row()
            .text(`👌 Настроить одобрение заявок`, "approve-settings").row()
            .text("🔙 Назад", "back-channel-1").row()

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `✅️Успешно! Задержка выставлена\n⚙️Выберите, что настроить`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}