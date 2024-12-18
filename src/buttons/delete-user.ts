import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";

export default class DeleteUserUser extends Button {
    constructor() {
        super({name: "delete-user"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        await Admin.updateOne({_id: ctxUser.user.id}, {
            inputMode: true,
            command: "users 2",
            mainMessage: ctx.update.callback_query.message.message_id,
            cleanMessages: true
        });

        const inlineKeyboard = new InlineKeyboard()
            .text("🔙 Назад", "back-channel-users").row()

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "❔ Выберите пользователя по такой схеме:\n\n @имя_пользователя");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}