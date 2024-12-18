import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class DeleteButtonsGreeting extends Button {
    constructor() {
        super({name: "delete-buttons-leaving"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});

        if(channel.leaving[admin.secondValue].image && typeof channel.leaving[admin.secondValue].image !== "string") {
            const inlineKeyboard = new InlineKeyboard()
                .text("📖 Редактировать текст", "edit-text-leaving").row()
                .text("🖼️ Редактировать изображение", "edit-image-leaving").row()
                .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-leaving").row()
                .text("❌ Редактировать задержку перед удалением", "edit-delete-leaving").row()
                .text("➕ Добавить кнопку", "add-buttonleaving").row()
                .text("❓ Удалить все кнопки", "delete-buttons-leaving").row()
                .text("🔙 Назад", "back-channel-leaving").row();

            const buttonRow = inlineKeyboard.row();
            await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "❌ Вы не можете редактировать кнопки");
            await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
            await ctx.answerCallbackQuery()
        } else {
            channel.leaving[admin.secondValue].buttons = [];
            await channel.save();

            const currentGreet = channel.leaving[admin.secondValue]

            const inlineKeyboard = new InlineKeyboard()
                .text("📖 Редактировать текст", "edit-text-leaving").row()
                .text("🖼️ Редактировать изображение", "edit-image-leaving").row()
                .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-leaving").row()
                .text("❌ Редактировать задержку перед удалением", "edit-delete-leaving").row()
                .text("➕ Добавить кнопку", "add-buttonleaving").row()
                .text("❓ Удалить все кнопки", "delete-buttons-leaving").row()
                .text("🔙 Назад", "back-channel-leaving").row();

            await ctx.api.deleteMessage(ctx.chat.id, admin.preEdit);

            const greetButtonsKeyboard = new InlineKeyboard() || [];
            const entities = currentGreet?.entities?.length ? currentGreet.entities.map((entity) => ((entity?.url ? {
                    offset: entity.offset,
                    length: entity.length,
                    type: entity.etype,
                    url: entity.url,
                } : {
                    offset: entity.offset,
                    length: entity.length,
                    type: entity.etype,
                }
            ))) : [];

            if(channel.leaving[admin.secondValue].buttons.length) {
                channel.leaving[admin.secondValue].buttons.forEach((item) => {
                    if (typeof item !== "string") {
                        greetButtonsKeyboard.url(item.text, item.url);
                        if (item.row) {
                            greetButtonsKeyboard.row();
                        }
                    }
                });
            }
            if (currentGreet.image) {
                const sendMethod = `send${currentGreet.image.split("^")[1][0].toUpperCase()}${currentGreet.image.split("^")[1].substring(1)}`;
                const preEditMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.chat.id, currentGreet.image.split("^")[0], {caption: currentGreet.text, caption_entities: entities, reply_markup: greetButtonsKeyboard,});
                if (admin.messagesToDelete.length > 0) {
                    admin.messagesToDelete.forEach(async (message) => {
                        await ctx.api.deleteMessage(ctx.chat.id, message);
                    });
                }
                admin.messagesToDelete = undefined;
                admin.preEdit = preEditMessage.message_id;
                await admin.save();
            } else {
                const preEditMessage = await ctx.api.sendMessage(ctx.chat.id, currentGreet.text, {entities, reply_markup: greetButtonsKeyboard});
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