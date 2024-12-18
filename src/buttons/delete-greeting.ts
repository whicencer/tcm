import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class DeleteGreeting extends Button {
    constructor() {
        super({name: "delete-greeting"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        const inlineKeyboard = new InlineKeyboard()

        channel.greeting.forEach((greeting, index) => {
            inlineKeyboard.text(`${index + 1}: ${greeting.text.slice(0, 20)}...`, `greet_delete_${index}`).row()
        })

        inlineKeyboard.text("🔙 Назад", "back-channel-greeting").row()

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "🗑️ Выберите приветствие для удаления:");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}