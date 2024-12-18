import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class Greetedit extends Button {
    constructor() {
        super({name: "leaveedit"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        admin.secondValue = ctx.update.callback_query.data.split("_")[1];
        await admin.save();
        const channel = await Channel.findOne({_id: admin.editingChannel});
        const currentGreet = channel.leaving[admin.secondValue]

        const inlineKeyboard = new InlineKeyboard()
            .text("📖 Редактировать текст", "edit-text-leaving").row()
            .text("🖼️ Редактировать изображение", "edit-image-leaving").row()
            .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-leaving").row()
            .text("❌ Редактировать задержку перед удалением", "edit-delete-leaving").row()
            .text("➕ Добавить кнопку", "add-buttonleaving").row()
            .text("❓ Удалить все кнопки", "delete-buttons-leaving").row()
            .text("🔙 Назад", "back-channel-leaving").row();

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
            if (typeof currentGreet.image === "string") {
                const sendMethod = `send${currentGreet.image
                    .split("^")[1][0]
                    .toUpperCase()}${currentGreet.image.split("^")[1].substring(1)}`;
                const preEditMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.chat.id, currentGreet.image.split("^")[0], {
                    caption: currentGreet.text,
                    caption_entities: entities,
                    reply_markup: greetButtonsKeyboard,
                    disable_web_page_preview: true
                });

                admin.preEdit = preEditMessage.message_id;
                admin.messagesToDelete = undefined;
                await admin.save();
            } else {
                const mediaGroup = currentGreet.image.map((val) => ({
                    type: (val.split("^")[1] === "gif" ? "animation" : val.split("^")[1]),
                    media: val.split("^")[0]
                }))
                mediaGroup[0].caption = currentGreet.text;
                mediaGroup[0].caption_entities = entities

                const preEditMessage = await ctx.api.sendMediaGroup(ctx.chat.id, mediaGroup, {disable_web_page_preview: true});
                admin.preEdit = preEditMessage[0].message_id
                admin.messagesToDelete = admin.messagesToDelete ? [...admin.messagesToDelete, ...preEditMessage.filter((val, index) => index > 0).map((val) => val.message_id)] : [...preEditMessage.filter((val, index) => index > 0).map((val) => val.message_id)]
                await admin.save();
            }
        } else {
            const preEditMessage = await ctx.api.sendMessage(ctx.chat.id, currentGreet.text, {entities, reply_markup: greetButtonsKeyboard, disable_web_page_preview: true});
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
        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `⚙️Выберите действие`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}