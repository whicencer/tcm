import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class AutoApproveTimeout extends Button {
    constructor() {
        super({name: "approvetimeout"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        if (channel.autoApprove.switched) {
            const lastTimeout = channel.autoApprove.timeOut

            const inlineKeyboard = new InlineKeyboard()
                .text(lastTimeout === 0 ? "0 с ✅" : "0 с", "approve-timeout-0")
                .text(lastTimeout === 3000 ? "3 с ✅" : "3 с", "approve-timeout-3000")
                .text(lastTimeout === 5000 ? "5 с ✅" : "5 с", "approve-timeout-5000")
                .text(lastTimeout === 10000 ? "10 с ✅" : "10 с", "approve-timeout-10000").row()
                .text(lastTimeout === 15000 ? "15 с ✅" : "15 с", "approve-timeout-15000")
                .text(lastTimeout === 30000 ? "30 с ✅" : "30 с", "approve-timeout-30000")
                .text(lastTimeout === 60000 ? "1 м ✅" : "1 м", "approve-timeout-60000")
                .text(lastTimeout === 120000 ? "2 м ✅" : "2 м", "approve-timeout-120000").row()
                .text(lastTimeout === 180000 ? "3 м ✅" : "3 м", "approve-timeout-180000")
                .text(lastTimeout === 240000 ? "4 м ✅" : "4 м", "approve-timeout-240000")
                .text(lastTimeout === 300000 ? "5 м ✅" : "5 м", "approve-timeout-300000")
                .text(lastTimeout === 600000 ? "10 м ✅" : "10 м", "approve-timeout-600000").row()
                .text(lastTimeout === 900000 ? "15 м ✅" : "15 м", "approve-timeout-900000")
                .text(lastTimeout === 1800000 ? "30 м ✅" : "30 м", "approve-timeout-1800000")
                .text(lastTimeout === 3600000 ? "1 ч ✅" : "1 ч", "approve-timeout-3600000")
                .text(lastTimeout === 7200000 ? "2 ч ✅" : "2 ч", "approve-timeout-7200000").row()
                .text(lastTimeout === 21600000 ? "6 ч ✅" : "6 ч", "approve-timeout-21600000")
                .text(lastTimeout === 43200000 ? "12 ч ✅" : "12 ч", "approve-timeout-43200000")
                .text(lastTimeout === 64800000 ? "18 ч ✅" : "18 ч", "approve-timeout-64800000")
                .text(lastTimeout === 86400000 ? "24 ч ✅" : "24 ч", "approve-timeout-86400000").row()
                .text("🔙 Назад", "back-channel-2").row();

            const buttonRow = inlineKeyboard.row();
            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Выберите задержку`);
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            await ctx.answerCallbackQuery()
        } else {
            const inlineKeyboard = new InlineKeyboard()
                .text("👋 Настроить приветствие", "greeting").row()
                .text("🫂 Настроить прощание", "leaving").row()
                .text(`🤖 ${channel.captcha ? "Выключить" : "Включить"} капчу`, "captcha").row()
                .text("📫 Сделать рассылку", "spam").row()
                .text("💬 Опубликовать пост", "make-post").row()
                .text(`👌 Настроить одобрение заявок`, "approve-settings").row()
                .text("🔙 Назад", "back-channel-1").row()

            const buttonRow = inlineKeyboard.row();

            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `❌ У вас не выставлено автоматическое принятие заявок.\n⚙️Выберите, что настроить`);
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            await ctx.answerCallbackQuery()
        }
    }
}