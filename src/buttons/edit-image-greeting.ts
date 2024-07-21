import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";

export default class EditImageGreeting extends Button {
    constructor() {
        super({name: "edit-image-greeting"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        await Admin.updateOne({_id: ctxUser.user.id}, {
            inputMode: true,
            command: "greetedit 1",
            mainMessage: ctx.update.callback_query.message.message_id,
            cleanMessages: true
        });

        const inlineKeyboard = new InlineKeyboard()
            .text("🔙 Назад", "back-channel-greeting-2").row()

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "⚙️Вышлите изображение");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}