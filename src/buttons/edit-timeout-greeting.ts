import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class EditTimeOutGreeting extends Button {
    constructor() {
        super({name: "edit-timeout-greeting"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        const lastTimeout = channel.greeting[admin.secondValue].timeOut

        const inlineKeyboard = new InlineKeyboard()
            .text(lastTimeout === 0 ? "0 с ✅" : "0 с", "greetedit-timeout-0")
            .text(lastTimeout === 3000 ? "3 с ✅" : "3 с", "greetedit-timeout-3000")
            .text(lastTimeout === 5000 ? "5 с ✅" : "5 с", "greetedit-timeout-5000")
            .text(lastTimeout === 10000 ? "10 с ✅" : "10 с", "greetedit-timeout-10000").row()
            .text(lastTimeout === 15000 ? "15 с ✅" : "15 с", "greetedit-timeout-15000")
            .text(lastTimeout === 30000 ? "30 с ✅" : "30 с", "greetedit-timeout-30000")
            .text(lastTimeout === 60000 ? "1 м ✅" : "1 м", "greetedit-timeout-60000")
            .text(lastTimeout === 120000 ? "2 м ✅" : "2 м", "greetedit-timeout-120000").row()
            .text(lastTimeout === 180000 ? "3 м ✅" : "3 м", "greetedit-timeout-180000")
            .text(lastTimeout === 240000 ? "4 м ✅" : "4 м", "greetedit-timeout-240000")
            .text(lastTimeout === 300000 ? "5 м ✅" : "5 м", "greetedit-timeout-300000")
            .text(lastTimeout === 600000 ? "10 м ✅" : "10 м", "greetedit-timeout-600000").row()
            .text(lastTimeout === 900000 ? "15 м ✅" : "15 м", "greetedit-timeout-900000")
            .text(lastTimeout === 1800000 ? "30 м ✅" : "30 м", "greetedit-timeout-1800000")
            .text(lastTimeout === 3600000 ? "1 ч ✅" : "1 ч", "greetedit-timeout-3600000")
            .text(lastTimeout === 7200000 ? "2 ч ✅" : "2 ч", "greetedit-timeout-7200000").row()
            .text(lastTimeout === 21600000 ? "6 ч ✅" : "6 ч", "greetedit-timeout-21600000")
            .text(lastTimeout === 43200000 ? "12 ч ✅" : "12 ч", "greetedit-timeout-43200000")
            .text(lastTimeout === 64800000 ? "18 ч ✅" : "18 ч", "greetedit-timeout-64800000")
            .text(lastTimeout === 86400000 ? "24 ч ✅" : "24 ч", "greetedit-timeout-86400000").row()
            .text(lastTimeout === 108000000 ? "30 ч ✅" : "30 ч", "greetedit-timeout-108000000")
            .text(lastTimeout === 129600000 ? "36 ч ✅" : "36 ч", "greetedit-timeout-129600000")
            .text(lastTimeout === 151200000 ? "42 ч ✅" : "42 ч", "greetedit-timeout-151200000")
            .text(lastTimeout === 172800000 ? "48 ч ✅" : "48 ч", "greetedit-timeout-172800000").row()
            .text(`⌚ Время задержки: ${lastTimeout ? (lastTimeout / 1000) > 60 ? (lastTimeout / 1000 / 60 / 60) > 1 ? `${(lastTimeout / 1000 / 60 /60)}ч.` :`${(lastTimeout / 1000 / 60)}м.` : `${lastTimeout / 1000}с.` : "нет"}`, "csdfasd")
            .text(`❔ Ввести своё время`, "greetedit-timeout-change").row()
            .text("🔙 Назад", "back-channel-greeting-2").row();

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "⚙️Выберите задержку");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}