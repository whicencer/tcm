import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class DeleteButtonsGreeting extends Button {
    constructor() {
        super({name: "delete-buttons-post"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        if(channel.futurePost.image && typeof channel.futurePost.image !== "string") {
            const inlineKeyboard = new InlineKeyboard()
                .text("📖 Редактировать текст", "edit-text-post").row()
                .text("🖼️ Редактировать изображение", "edit-image-post").row()
                .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-post").row()
                .text("❌ Редактировать задержку перед удалением", "edit-delete-postpost").row()
                .text("➕ Добавить кнопку", "add-buttonpost").row()
                .text("❓ Удалить все кнопки", "delete-buttons-post").row()
                .text("✅ Отправить пост", "send-post").row()
                .text("🔙 Назад", "back-channel-2").row();

            const buttonRow = inlineKeyboard.row();
            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "❌ Вы не можете редактировать кнопки");
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            await ctx.answerCallbackQuery()
        } else {
            channel.futurePost.buttons = [];
            await channel.save();

            const inlineKeyboard = new InlineKeyboard()
                .text("📖 Редактировать текст", "edit-text-post").row()
                .text("🖼️ Редактировать изображение", "edit-image-post").row()
                .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-post").row()
                .text("❌ Редактировать задержку перед удалением", "edit-delete-postpost").row()
                .text("➕ Добавить кнопку", "add-buttonpost").row()
                .text("❓ Удалить все кнопки", "delete-buttons-post").row()
                .text("✅ Отправить пост", "send-post").row()
                .text("🔙 Назад", "back-channel-2").row();

            await ctx.api.deleteMessage(ctx.chat.id, admin.preEdit);

            const postButtonsKeyboard = new InlineKeyboard() || [];
            const entities = channel.futurePost?.entities.length ? channel.futurePost.entities.map((entity) => ({offset: entity.offset, length: entity.length, type: entity.type,})) : [];

            if (channel.futurePost.image) {
                const sendMethod = `send${channel.futurePost.image.split("^")[1][0].toUpperCase()}${channel.futurePost.image.split("^")[1].substring(1)}`;
                const preEditMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.chat.id, channel.futurePost.image.split("^")[0], {caption: channel.futurePost.text, entities, reply_markup: postButtonsKeyboard,});
                if (admin.messagesToDelete.length > 0) {
                    admin.messagesToDelete.forEach(async (message) => {
                        await ctx.api.deleteMessage(ctx.chat.id, message);
                    });
                }
                admin.messagesToDelete = undefined;
                admin.preEdit = preEditMessage.message_id;
                await admin.save();
            } else {
                const preEditMessage = await ctx.api.sendMessage(ctx.chat.id, channel.futurePost.text, {entities, reply_markup: postButtonsKeyboard});
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
}