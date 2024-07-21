import {HearsContext, Context, InlineKeyboard} from "grammy";
import {Command} from "../structures/Command";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";
import * as validator from "validator";

export default class Spams extends Command {
    constructor() {
        super({
            name: ["spams 1", "spams 2", "spams 3", "spams 4", "spams 5", "spams 6"],
        });
    }

    async run(ctx: HearsContext<Context>, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});

        if (admin.command === "spams 1") {
            if (typeof admin.value === "string" && admin.value.length >= 1) {
                const channel = await Channel.findOne({_id: admin.editingChannel});
                if (!channel.futurePost) {
                    channel.futurePost = {};
                }

                if (ctx.message.entities || ctx.message.caption_entities) {
                    const entities = ctx.message?.entities ? ctx.message.entities.map((entity) => (entity?.url ? {
                            offset: entity.offset,
                            length: entity.length,
                            etype: entity.type,
                            url: entity.url,
                        } : {
                            offset: entity.offset,
                            length: entity.length,
                            etype: entity.type,
                        }
                    )) : ctx.message.caption_entities.map((entity) => (entity?.url ? {
                            offset: entity.offset,
                            length: entity.length,
                            etype: entity.type,
                            url: entity.url,
                        } : {
                            offset: entity.offset,
                            length: entity.length,
                            etype: entity.type,
                        }
                    ));

                    channel.futurePost = {text: admin.value, entities};
                    await channel.save();
                } else {
                    channel.futurePost = {text: admin.value};
                    await channel.save();
                }

                if (ctx.message?.photo || ctx.message?.video || ctx.message?.animation) {
                    const updates = await ctx.api.getUpdates();
                    if (updates.length > 1) {
                        const images = [];
                        for (const update of updates) {
                            images.push(update.message?.photo ? `${update.message.photo[0].file_id}^photo` : update.message?.video ? `${update.message.video.file_id}^video` : `${update.message.animation.file_id}^gif`)
                            if (updates.indexOf(update) > 0) {
                                admin.messagesToDelete = [...admin.messagesToDelete, update.message.message_id];
                                await admin.save()
                            }
                        }
                        channel.futurePost.image = images
                        await channel.save();
                    } else {
                        channel.futurePost.image = ctx.message?.photo ? `${ctx.message.photo[0].file_id}^photo` : ctx.message?.video ? `${ctx.message.video.file_id}^video` : `${ctx.message.animation.file_id}^gif`
                        await channel.save();
                    }
                }

                admin.inputMode = undefined;
                admin.command = undefined;
                await admin.save();

                const inlineKeyboard = new InlineKeyboard()
                    .text("📖 Редактировать текст", "edit-text-spam").row()
                    .text("🖼️ Редактировать изображение", "edit-image-spam").row()
                    .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-spam").row()
                    .text("❌ Редактировать задержку перед удалением", "edit-delete-spam").row()
                    .text("➕ Добавить кнопку", "add-buttonspam").row()
                    .text("❓ Удалить все кнопки", "delete-buttons-spam").row()
                    .text("✅ Отправить рассылку", "send-spam").row()
                    .text("🔙 Назад", "back-channel-2").row();

                const buttonRow = inlineKeyboard.row();

                admin.messagesToDelete.forEach(async (message) => {
                    await ctx.api.deleteMessage(ctx.chat.id, message);
                });
                admin.messagesToDelete = undefined;
                await admin.save();

                const currentPost = channel.futurePost;

                const postButtonsKeyboard = new InlineKeyboard() || [];

                if (channel?.futurePost?.buttons.length) {
                    channel?.futurePost?.buttons.forEach((item) => {
                        if (typeof item !== "string") {
                            postButtonsKeyboard.url(item.text, item.url);
                            if (item.row) {
                                postButtonsKeyboard.row();
                            }
                        }
                    });
                }

                if(currentPost?.image) {
                    if (typeof currentPost.image === "string") {
                        const sendMethod = `send${currentPost.image
                            .split("^")[1][0]
                            .toUpperCase()}${currentPost.image.split("^")[1].substring(1)}`;
                        const preEditMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.chat.id, currentPost.image.split("^")[0], {
                            caption: ctx.message.caption,
                            caption_entities: ctx.message.caption_entities,
                            reply_markup: postButtonsKeyboard,
                            disable_web_page_preview: true
                        });

                        admin.preEdit = preEditMessage.message_id;
                        admin.messagesToDelete = undefined;
                        await admin.save();
                    } else {
                        const mediaGroup = currentPost.image.map((val) => ({
                            type: (val.split("^")[1] === "gif" ? "animation" : val.split("^")[1]),
                            media: val.split("^")[0]
                        }))
                        mediaGroup[0].caption = ctx.message.caption;
                        mediaGroup[0].caption_entities = ctx.message.caption_entities;

                        const preEditMessage = await ctx.api.sendMediaGroup(ctx.chat.id, mediaGroup, {disable_web_page_preview: true});
                        admin.preEdit = preEditMessage[0].message_id
                        admin.messagesToDelete = admin.messagesToDelete ? [...admin.messagesToDelete, ...preEditMessage.filter((val, index) => index > 0).map((val) => val.message_id)] : [...preEditMessage.filter((val, index) => index > 0).map((val) => val.message_id)]
                        await admin.save();
                    }
                } else {
                    const preEditMessage = await ctx.api.sendMessage(ctx.chat.id, admin.value, {
                        entities: ctx.message.entities,
                        reply_markup: postButtonsKeyboard,
                        disable_web_page_preview: true
                    });

                    admin.preEdit = preEditMessage.message_id;
                    await admin.save();
                }

                await ctx.api.editMessageText(ctx.chat.id, admin.mainMessage, "⚙️Теперь можете настроить остальное");
                await ctx.api.editMessageReplyMarkup(ctx.chat.id, admin.mainMessage, {reply_markup: buttonRow,});
            } else {
                const message = await ctx.reply("❌ Слишком маленький текст, попробуйте ещё раз");
                admin.messagesToDelete = [...admin.messagesToDelete.filter((val) => admin.preEdit !== val), message.message_id,];
                await admin.save();
            }
        }

        if (admin.command === "spams 2") {
            if (ctx.message?.photo || ctx.message?.video || ctx.message?.animation) {
                const channel = await Channel.findOne({_id: admin.editingChannel});
                const updates = await ctx.api.getUpdates();
                if (updates.length > 1) {
                    const images = [];
                    for (const update of updates) {
                        images.push(update.message?.photo ? `${update.message.photo[0].file_id}^photo` : update.message?.video ? `${update.message.video.file_id}^video` : `${update.message.animation.file_id}^gif`)
                        if (updates.indexOf(update) > 0) {
                            admin.messagesToDelete = [...admin.messagesToDelete, update.message.message_id];
                            await admin.save()
                        }
                    }
                    channel.futurePost.image = images
                    await channel.save();
                } else {
                    channel.futurePost.image = ctx.message?.photo ? `${ctx.message.photo[0].file_id}^photo` : ctx.message?.video ? `${ctx.message.video.file_id}^video` : `${ctx.message.animation.file_id}^gif`
                    await channel.save();
                }

                admin.inputMode = undefined;
                admin.command = undefined;
                admin.value = undefined;
                await admin.save();

                const inlineKeyboard = new InlineKeyboard()
                    .text("📖 Редактировать текст", "edit-text-spam").row()
                    .text("🖼️ Редактировать изображение", "edit-image-spam").row()
                    .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-spam").row()
                    .text("❌ Редактировать задержку перед удалением", "edit-delete-spam").row()
                    .text("➕ Добавить кнопку", "add-buttonspam").row()
                    .text("❓ Удалить все кнопки", "delete-buttons-spam").row()
                    .text("✅ Отправить рассылку", "send-spam").row()
                    .text("🔙 Назад", "back-channel-2").row();

                const buttonRow = inlineKeyboard.row();

                await ctx.api.deleteMessage(ctx.chat.id, admin.preEdit);
                admin.messagesToDelete.forEach(async (message) => {
                    await ctx.api.deleteMessage(ctx.chat.id, message);
                });
                admin.preEdit = undefined;
                admin.messagesToDelete = undefined;
                await admin.save();

                const currentPost = channel.futurePost;
                const entities = currentPost?.entities?.length ? currentPost.entities.map((entity) => ((entity?.url ? {
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

                const postButtonsKeyboard = new InlineKeyboard() || [];

                if (channel.futurePost.buttons.length) {
                    channel.futurePost.buttons.forEach((item) => {
                        if (typeof item !== "string") {
                            postButtonsKeyboard.url(item.text, item.url);
                            if (item.row) {
                                postButtonsKeyboard.row();
                            }
                        }
                    });
                }

                if (typeof currentPost.image === "string") {
                    const sendMethod = `send${currentPost.image
                        .split("^")[1][0]
                        .toUpperCase()}${currentPost.image.split("^")[1].substring(1)}`;
                    const preEditMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.chat.id, currentPost.image.split("^")[0], {
                        caption: currentPost.text,
                        caption_entities: entities,
                        reply_markup: postButtonsKeyboard,
                        disable_web_page_preview: true
                    });

                    admin.preEdit = preEditMessage.message_id;
                    admin.messagesToDelete = undefined;
                    await admin.save();
                } else {
                    const mediaGroup = currentPost.image.map((val) => ({
                        type: (val.split("^")[1] === "gif" ? "animation" : val.split("^")[1]),
                        media: val.split("^")[0]
                    }))
                    mediaGroup[0].caption = currentPost.text;
                    mediaGroup[0].caption_entities = entities;

                    const preEditMessage = await ctx.api.sendMediaGroup(ctx.chat.id, mediaGroup, {disable_web_page_preview: true});
                    admin.preEdit = preEditMessage[0].message_id
                    admin.messagesToDelete = admin.messagesToDelete ? [...admin.messagesToDelete, ...preEditMessage.filter((val, index) => index > 0).map((val) => val.message_id)] : [...preEditMessage.filter((val, index) => index > 0).map((val) => val.message_id)]
                    await admin.save();
                }

                await ctx.api.editMessageText(ctx.chat.id, admin.mainMessage, "✅ Изображение выбрано!\n⚙️Теперь можете настроить остальное");
                await ctx.api.editMessageReplyMarkup(ctx.chat.id, admin.mainMessage, {
                    reply_markup: buttonRow,
                });
            } else {
                const message = await ctx.reply("❌ Вы не выбрали изображение, попробуйте ещё раз");
                admin.messagesToDelete = [...admin.messagesToDelete.filter((val) => admin.preEdit !== val), message.message_id,];
                await admin.save();
            }
        }

        if (admin.command === "spams 3") {
            if (typeof admin.value === "string" && admin.value.length >= 1) {
                const channel = await Channel.findOne({_id: admin.editingChannel});
                if (ctx.message.entities || ctx.message.caption_entities) {
                    const entities = ctx.message?.entities ? ctx.message.entities.map((entity) => (entity?.url ? {
                            offset: entity.offset,
                            length: entity.length,
                            etype: entity.type,
                            url: entity.url,
                        } : {
                            offset: entity.offset,
                            length: entity.length,
                            etype: entity.type,
                        }
                    )) : ctx.message.caption_entities.map((entity) => (entity?.url ? {
                            offset: entity.offset,
                            length: entity.length,
                            etype: entity.type,
                            url: entity.url,
                        } : {
                            offset: entity.offset,
                            length: entity.length,
                            etype: entity.type,
                        }
                    ));

                    channel.futurePost.text = admin.value;
                    channel.futurePost.entities = entities;
                    await channel.save();
                } else {
                    channel.futurePost.text = admin.value;
                    await channel.save();
                }

                admin.inputMode = undefined;
                admin.command = undefined;
                admin.value = undefined;
                admin.cleanMessages = false;
                await admin.save();

                const inlineKeyboard = new InlineKeyboard()
                    .text("📖 Редактировать текст", "edit-text-spam").row()
                    .text("🖼️ Редактировать изображение", "edit-image-spam").row()
                    .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-spam").row()
                    .text("❌ Редактировать задержку перед удалением", "edit-delete-spam").row()
                    .text("➕ Добавить кнопку", "add-buttonspam").row()
                    .text("❓ Удалить все кнопки", "delete-buttons-spam").row()
                    .text("✅ Отправить рассылку", "send-spam").row()
                    .text("🔙 Назад", "back-channel-2").row();

                const buttonRow = inlineKeyboard.row();

                await ctx.api.deleteMessage(ctx.chat.id, admin.preEdit);
                if (admin?.messagesToDelete?.length > 0) {
                    admin.messagesToDelete.forEach(async (message) => {
                        await ctx.api.deleteMessage(ctx.chat.id, message);
                    });
                }
                admin.preEdit = undefined;
                admin.messagesToDelete = undefined;
                await admin.save();

                const currentPost = channel.futurePost;
                const postButtonsKeyboard = new InlineKeyboard() || [];

                if (channel.futurePost.buttons.length) {
                    channel.futurePost.buttons.forEach((item) => {
                        if (typeof item !== "string") {
                            postButtonsKeyboard.url(item.text, item.url);
                            if (item.row) {
                                postButtonsKeyboard.row();
                            }
                        }
                    });
                }

                if (currentPost.image) {
                    if (typeof currentPost.image === "string") {
                        const sendMethod = `send${currentPost.image
                            .split("^")[1][0]
                            .toUpperCase()}${currentPost.image.split("^")[1].substring(1)}`;
                        const preEditMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.chat.id, currentPost.image.split("^")[0], {
                            caption: currentPost.text,
                            caption_entities: ctx.message.entities,
                            reply_markup: postButtonsKeyboard,
                            disable_web_page_preview: true
                        });

                        admin.preEdit = preEditMessage.message_id;
                        admin.messagesToDelete = undefined;
                        await admin.save();
                    } else {
                        const mediaGroup = currentPost.image.map((val) => ({
                            type: (val.split("^")[1] === "gif" ? "animation" : val.split("^")[1]),
                            media: val.split("^")[0]
                        }))
                        mediaGroup[0].caption = currentPost.text;
                        mediaGroup[0].caption_entities = ctx.message.entities;

                        const preEditMessage = await ctx.api.sendMediaGroup(ctx.chat.id, mediaGroup, {disable_web_page_preview: true});
                        admin.preEdit = preEditMessage[0].message_id
                        admin.messagesToDelete = admin.messagesToDelete ? [...admin.messagesToDelete, ...preEditMessage.filter((val, index) => index > 0).map((val) => val.message_id)] : [...preEditMessage.filter((val, index) => index > 0).map((val) => val.message_id)]
                        await admin.save();
                    }
                } else {
                    const preEditMessage = await ctx.api.sendMessage(ctx.chat.id, ctx.message.text, {
                        entities: ctx.message.entities,
                        reply_markup: postButtonsKeyboard,
                        disable_web_page_preview: true
                    });

                    admin.preEdit = preEditMessage.message_id;
                    await admin.save();
                }

                await ctx.api.editMessageText(ctx.chat.id, admin.mainMessage, "✅ Новый текст выбран!\n⚙️Теперь можете настроить остальное");
                await ctx.api.editMessageReplyMarkup(ctx.chat.id, admin.mainMessage, {
                    reply_markup: buttonRow,
                });
            } else {
                const message = await ctx.reply("❌ Слишком маленький текст, попробуйте ещё раз");
                admin.messagesToDelete = [...admin.messagesToDelete.filter((val) => admin.preEdit !== val), message.message_id,];
                await admin.save();
            }
        }

        if (admin.command === "spams 4") {
            const channel = await Channel.findOne({_id: admin.editingChannel});
            const currentPost = channel.futurePost;

            if ((currentPost.image && typeof currentPost.image === "string") || (!currentPost.image)) {
                const buttons = await this.parseButtons(admin.value);
                if (!buttons.includes("error")) {
                    channel.futurePost.buttons = [...channel.futurePost.buttons, ...buttons,];
                    await channel.save();

                    const inlineKeyboard = new InlineKeyboard()
                        .text("📖 Редактировать текст", "edit-text-spam").row()
                        .text("🖼️ Редактировать изображение", "edit-image-spam").row()
                        .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-spam").row()
                        .text("❌ Редактировать задержку перед удалением", "edit-delete-spam").row()
                        .text("➕ Добавить кнопку", "add-buttonspam").row()
                        .text("❓ Удалить все кнопки", "delete-buttons-spam").row()
                        .text("✅ Отправить рассылку", "send-spam").row()
                        .text("🔙 Назад", "back-channel-2").row();

                    const buttonRow = inlineKeyboard.row();

                    const entities = currentPost?.entities?.length ? currentPost?.entities.map((entity) => ((entity?.url ? {
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

                    await ctx.api.deleteMessage(ctx.chat.id, admin.preEdit);

                    if (admin?.messagesToDelete?.length > 0) {
                        admin.messagesToDelete.forEach(async (message) => {
                            await ctx.api.deleteMessage(ctx.chat.id, message);
                        });
                    }
                    admin.preEdit = undefined;
                    admin.messagesToDelete = undefined;
                    await admin.save();

                    const postButtonsKeyboard = new InlineKeyboard();

                    channel.futurePost.buttons.forEach((item) => {
                        if (typeof item !== "string") {
                            postButtonsKeyboard.url(item.text, item.url);
                            if (item.row) {
                                postButtonsKeyboard.row();
                            }
                        }
                    });

                    if (currentPost.image) {
                        if (typeof currentPost.image === "string") {
                            const sendMethod = `send${currentPost.image
                                .split("^")[1][0]
                                .toUpperCase()}${currentPost.image.split("^")[1].substring(1)}`;
                            const preEditMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.chat.id, currentPost.image.split("^")[0], {
                                caption: currentPost.text,
                                caption_entities: entities,
                                reply_markup: postButtonsKeyboard,
                                disable_web_page_preview: true
                            });

                            admin.preEdit = preEditMessage.message_id;
                            admin.messagesToDelete = undefined;
                            await admin.save();
                        }
                    } else {
                        const preEditMessage = await ctx.api.sendMessage(ctx.chat.id, currentPost.text, {
                            entities,
                            reply_markup: postButtonsKeyboard,
                            disable_web_page_preview: true
                        });
                        if (admin.messagesToDelete.length > 0) {
                            admin.messagesToDelete.forEach(async (message) => {
                                await ctx.api.deleteMessage(ctx.chat.id, message);
                            });
                        }
                        admin.messagesToDelete = undefined;
                        admin.preEdit = preEditMessage.message_id;
                        await admin.save();
                    }

                    await ctx.api.editMessageText(ctx.chat.id, admin.mainMessage, "✅ Новая кнопка была добавлена\n⚙️Теперь можете настроить остальное");
                    await ctx.api.editMessageReplyMarkup(ctx.chat.id, admin.mainMessage, {reply_markup: buttonRow});
                } else {
                    const message = await ctx.reply("❌ Неверный формат, попробуйте ещё раз");
                    admin.messagesToDelete = [...admin.messagesToDelete.filter((val) => admin.preEdit !== val), message.message_id,];
                    await admin.save();
                }
            } else {
                await ctx.reply("❌ Вы не можете изменять кнопки")
            }

            admin.inputMode = undefined;
            admin.command = undefined;
            admin.value = undefined;
            admin.cleanMessages = false;
            admin.messagesToDelete = undefined;
            await admin.save();
        }

        if (admin.command === "spams 5") {
            if (!isNaN(admin.value) && parseInt(admin.value) >= 1) {
                const channel = await Channel.findOne({_id: admin.editingChannel});

                channel.futurePost.timeOut = (parseFloat(admin.value) * 60 * 1000)
                await channel.save()

                admin.inputMode = undefined;
                admin.command = undefined;
                admin.value = undefined;
                await admin.save();

                const inlineKeyboard = new InlineKeyboard()
                    .text("📖 Редактировать текст", "edit-text-spam").row()
                    .text("🖼️ Редактировать изображение", "edit-image-spam").row()
                    .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-spam").row()
                    .text("❌ Редактировать задержку перед удалением", "edit-delete-spam").row()
                    .text("➕ Добавить кнопку", "add-buttonspam").row()
                    .text("❓ Удалить все кнопки", "delete-buttons-spam").row()
                    .text("✅ Отправить рассылку", "send-spam").row()
                    .text("🔙 Назад", "back-channel-2").row();

                const buttonRow = inlineKeyboard.row();

                if(admin.messagesToDelete?.length > 1) {
                    admin.messagesToDelete.forEach(async (message) => {
                        await ctx.api.deleteMessage(ctx.chat.id, message);
                    });
                }

                admin.messagesToDelete = undefined;
                await admin.save()

                await ctx.api.editMessageText(ctx.chat.id, admin.mainMessage, "⚙️Теперь можете настроить остальное");
                await ctx.api.editMessageReplyMarkup(ctx.chat.id, admin.mainMessage, {reply_markup: buttonRow,});
            } else {
                const message = await ctx.reply("❌ Слишком маленькое число, попробуйте ещё раз");
                admin.messagesToDelete = [...admin.messagesToDelete.filter((val) => admin.preEdit !== val), message.message_id,];
                await admin.save();
            }
        }

        if (admin.command === "spams 6") {
            if (!isNaN(admin.value) && parseInt(admin.value) >= 1) {
                const channel = await Channel.findOne({_id: admin.editingChannel});

                channel.futurePost.autoDelete = (parseFloat(admin.value) * 60 * 1000)
                await channel.save()

                admin.inputMode = undefined;
                admin.command = undefined;
                admin.value = undefined;
                await admin.save();

                const inlineKeyboard = new InlineKeyboard()
                    .text("📖 Редактировать текст", "edit-text-spam").row()
                    .text("🖼️ Редактировать изображение", "edit-image-spam").row()
                    .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-spam").row()
                    .text("❌ Редактировать задержку перед удалением", "edit-delete-spam").row()
                    .text("➕ Добавить кнопку", "add-buttonspam").row()
                    .text("❓ Удалить все кнопки", "delete-buttons-spam").row()
                    .text("✅ Отправить рассылку", "send-spam").row()
                    .text("🔙 Назад", "back-channel-2").row();

                const buttonRow = inlineKeyboard.row();

                if(admin.messagesToDelete?.length > 1) {
                    admin.messagesToDelete.forEach(async (message) => {
                        await ctx.api.deleteMessage(ctx.chat.id, message);
                    });
                }

                admin.messagesToDelete = undefined;
                await admin.save()

                await ctx.api.editMessageText(ctx.chat.id, admin.mainMessage, "⚙️Теперь можете настроить остальное");
                await ctx.api.editMessageReplyMarkup(ctx.chat.id, admin.mainMessage, {reply_markup: buttonRow,});
            } else {
                const message = await ctx.reply("❌ Слишком маленькое число, попробуйте ещё раз");
                admin.messagesToDelete = [...admin.messagesToDelete.filter((val) => admin.preEdit !== val), message.message_id,];
                await admin.save();
            }
        }
    }

    public async parseButtons(input: string) {
        const result: (TextUrlObject | string)[] = [];
        const lines = input.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const parts = lines[i].split('|').map(part => part.trim());

            for (let j = 0; j < parts.length; j++) {
                const [text, url] = parts[j].split('-').map(item => item.trim());

                if (text && url && await this.isValidUrl(url)) {
                    const row = j === parts.length - 1;
                    result.push({ text, url, row });
                } else {
                    result.push("error");
                }
            }
        }

        return result;

        interface TextUrlObject {
            text: string;
            url: string;
            row?: boolean;
        }
    }

    public async isValidUrl(url: string) {
        return validator.isURL(url);
    }
}
