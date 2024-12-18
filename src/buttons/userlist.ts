import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";

export default class UserList extends Button {
    constructor() {
        super({name: "user-list"});
    }

    async run(ctx, bot) {
        const inlineKeyboard = new InlineKeyboard()
            .text("🔙 Назад", "back-channel-users").row()

        const headAdmins = await Admin.find({isHeadAdmin: true})
        const trueAdmins = await Admin.find({isTrueAdmin: true})
        const users = await Admin.find({
            $and: [
                { isHeadAdmin: false },
                { isTrueAdmin: false }
            ]
        });

        const finalHeadAdmins = headAdmins.length ? headAdmins.map(a => `${a?.username ? `@${a.username}` : `${a.displayName}` }`).join("\n") : "Отстутствуют";
        const finalTrueAdmins = trueAdmins.length ? trueAdmins.map(a => `${a?.username ? `@${a.username}` : `${a.displayName}` }`).join("\n") : "Отстутствуют";
        const finalUsers = users.length ? users.map(a => `${a?.username ? `@${a.username}` : `${a.displayName}` }`).join("\n") : "Отстутствуют";

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `🫂 Headadmin'ы:\n\n${finalHeadAdmins}\n\n👮‍♀️Admin'ы:\n\n${finalTrueAdmins}\n\n👥 User'ы:\n\n${finalUsers}`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}