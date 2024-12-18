import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";

export default class BackChannelAdmin extends Button {
    constructor() {
        super({name: "back-channel-admin"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id}) || await Admin.findOne({username: ctxUser.user.username});
        admin.futurePost = undefined;
        await admin.save()

        const inlineKeyboard = new InlineKeyboard()
            .text("🫂 Пользователи", "users").row()

        if(admin.isHeadAdmin) {
            inlineKeyboard
                .text("📤 Рассылка", "megaspams").row()
                .text("👁️ Предпросмотр", "preview").row()
        }

        inlineKeyboard.text("🔙 Назад", "back-channel-3").row()

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "⚙️Выберите действие");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}