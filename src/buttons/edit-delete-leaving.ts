import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class EditDeleteGreeting extends Button {
    constructor() {
        super({name: "edit-delete-leaving"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        const lastDelete = channel.leaving[admin.secondValue].autoDelete
        const inlineKeyboard = new InlineKeyboard()
            .text(lastDelete === 0 ? "0 с ✅" : "0 с", "leave-delete-0")
            .text(lastDelete === 3000 ? "3 с ✅" : "3 с", "leave-delete-3000")
            .text(lastDelete === 5000 ? "5 с ✅" : "5 с", "leave-delete-5000")
            .text(lastDelete === 10000 ? "10 с ✅" : "10 с", "leave-delete-10000").row()
            .text(lastDelete === 15000 ? "15 с ✅" : "15 с", "leave-delete-15000")
            .text(lastDelete === 30000 ? "30 с ✅" : "30 с", "leave-delete-30000")
            .text(lastDelete === 60000 ? "1 м ✅" : "1 м", "leave-delete-60000")
            .text(lastDelete === 120000 ? "2 м ✅" : "2 м", "leave-delete-120000").row()
            .text(lastDelete === 180000 ? "3 м ✅" : "3 м", "leave-delete-180000")
            .text(lastDelete === 240000 ? "4 м ✅" : "4 м", "leave-delete-240000")
            .text(lastDelete === 300000 ? "5 м ✅" : "5 м", "leave-delete-300000")
            .text(lastDelete === 600000 ? "10 м ✅" : "10 м", "leave-delete-600000").row()
            .text(lastDelete === 900000 ? "15 м ✅" : "15 м", "leave-delete-900000")
            .text(lastDelete === 1800000 ? "30 м ✅" : "30 м", "leave-delete-1800000")
            .text(lastDelete === 3600000 ? "1 ч ✅" : "1 ч", "leave-delete-3600000")
            .text(lastDelete === 7200000 ? "2 ч ✅" : "2 ч", "leave-delete-7200000").row()
            .text(lastDelete === 21600000 ? "6 ч ✅" : "6 ч", "leave-delete-21600000")
            .text(lastDelete === 43200000 ? "12 ч ✅" : "12 ч", "leave-delete-43200000")
            .text(lastDelete === 64800000 ? "18 ч ✅" : "18 ч", "leave-delete-64800000")
            .text(lastDelete === 86400000 ? "24 ч ✅" : "24 ч", "leave-delete-86400000").row()
            .text(lastDelete === 108000000 ? "30 ч ✅" : "30 ч", "leave-delete-108000000")
            .text(lastDelete === 129600000 ? "36 ч ✅" : "36 ч", "leave-delete-129600000")
            .text(lastDelete === 151200000 ? "42 ч ✅" : "42 ч", "leave-delete-151200000")
            .text(lastDelete === 172800000 ? "48 ч ✅" : "48 ч", "leave-delete-172800000").row()
            .text(`❓ Не удалять${!lastDelete ? " ✅" : ""}`, "leave-delete-reset").row()
            .text(`⌚ Время задержки: ${lastDelete ? (lastDelete / 1000) > 60 ? (lastDelete / 1000 / 60 / 60) > 1 ? `${(lastDelete / 1000 / 60 /60)}ч.` :`${(lastDelete / 1000 / 60)}м.` : `${lastDelete / 1000}с.` : "нет"}`, "csdfasd")
            .text(`❔ Ввести своё время`, "leave-delete-change").row()
            .text("🔙 Назад", "back-channel-greeting-2").row();

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "⚙️Выберите задержку перед удалением");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}