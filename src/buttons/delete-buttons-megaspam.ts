import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";

export default class DeleteButtonsGreeting extends Button {
    constructor() {
        super({name: "delete-buttons-megaspam"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});

        admin.futurePost.buttons = [];
        await admin.save();

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-text-megaspam").row()
            .text("🖼️ Редактировать изображение", "edit-image-megaspam").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-megaspam").row()
            .text("❌ Редактировать задержку перед удалением", "edit-delete-megaspam").row()
            .text("➕ Добавить кнопку", "add-buttonmegaspam").row()
            .text("❓ Удалить все кнопки", "delete-buttons-megaspam").row()
            .text("✅ Отправить рассылку", "send-megaspam").row()
            .text("🔙 Назад", "back-channel-admin").row();

        await ctx.api.deleteMessage(ctx.chat.id, admin.preEdit);

        const postButtonsKeyboard = new InlineKeyboard() || [];
        const entities = admin.futurePost?.entities.length ? admin.futurePost.entities.map((entity) => ({offset: entity.offset, length: entity.length, type: entity.type,})) : [];

        if (admin.futurePost.image) {
            const sendMethod = `send${admin.futurePost.image.split("^")[1][0].toUpperCase()}${admin.futurePost.image.split("^")[1].substring(1)}`;
            const preEditMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.chat.id, admin.futurePost.image.split("^")[0], {caption: admin.futurePost.text, entities, reply_markup: postButtonsKeyboard,});
            if (admin.messagesToDelete.length > 0) {
                admin.messagesToDelete.forEach(async (message) => {
                    await ctx.api.deleteMessage(ctx.chat.id, message);
                });
            }
            admin.messagesToDelete = undefined;
            admin.preEdit = preEditMessage.message_id;
            await admin.save();
        } else {
            const preEditMessage = await ctx.api.sendMessage(ctx.chat.id, admin.futurePost.text, {entities, reply_markup: postButtonsKeyboard});
            if (admin.messagesToDelete.length > 0) {
                admin.messagesToDelete.forEach(async (message) => {
                    await ctx.api.deleteMessage(ctx.chat.id, message);
                });
            }
            admin.messagesToDelete = undefined;
            admin.preEdit = preEditMessage.message_id;
            await admin.save();
        }

        const buttonRow = inlineKeyboard.row();
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "✅ Успешно! Все кнопки удалены\n⚙️ Теперь можете выбрать, что настроить");
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}