import {HearsContext, Context, InlineKeyboard} from "grammy";
import {Command} from "../structures/Command";
import {Admin} from "../schemas/Admin.schema";
import {Channel} from "../schemas/Channel.schema";

export default class Greetings extends Command {
    constructor() {
        super({
            name: ["greetedit 1", "greetedit 2", "greetedit 3", "greetedit 5", "greetedit 6"],
        });
    }

    async run(ctx: HearsContext<Context>, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});

        if (admin.command === "greetedit 1") {
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
                    channel.greeting = [...channel.greeting.filter((val, index) => index !== admin.secondValue), {image: images, ...channel.greeting[admin.secondValue],},];
                    await channel.save();
                } else {
                    channel.greeting = [...channel.greeting.filter((val, index) => index !== admin.secondValue), {image: ctx.message?.photo ? `${ctx.message.photo[0].file_id}^photo` : ctx.message?.video ? `${ctx.message.video.file_id}^video` : `${ctx.message.animation.file_id}^gif`, ...channel.greeting[admin.secondValue],},];
                    await channel.save();
                }

                admin.inputMode = undefined;
                admin.command = undefined;
                admin.value = undefined;
                await admin.save();

                const inlineKeyboard = new InlineKeyboard()
                    .text("📖 Редактировать текст", "edit-text-greeting").row()
                    .text("🖼️ Редактировать изображение", "edit-image-greeting").row()
                    .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-greeting").row()
                    .text("❌ Редактировать задержку перед удалением", "edit-delete-greeting").row()
                    .text("➕ Добавить кнопку", "add-buttongreeting").row()
                    .text("❓ Удалить все кнопки", "delete-buttons-greeting").row()
                    .text("🔙 Назад", "back-channel-greeting").row();

                const buttonRow = inlineKeyboard.row();

                await ctx.api.deleteMessage(ctx.chat.id, admin.preEdit);
                admin.messagesToDelete.forEach(async (message) => {
                    await ctx.api.deleteMessage(ctx.chat.id, message);
                });
                admin.preEdit = undefined;
                admin.messagesToDelete = undefined;
                await admin.save();

                const currentGreet = channel.greeting[admin.secondValue];
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

                const greetButtonsKeyboard = new InlineKeyboard() || [];

                if (channel.greeting[admin.secondValue]?.buttons.length) {
                    channel.greeting[admin.secondValue]?.buttons.forEach((item) => {
                        if (typeof item !== "string") {
                            greetButtonsKeyboard.url(item.text, item.url);
                            if (item.row) {
                                greetButtonsKeyboard.row();
                            }
                        }
                    });
                }

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

        if (admin.command === "greetedit 2") {
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

                    channel.greeting = [...channel.greeting.filter((val, index) => index !== admin.secondValue), {
                        text: admin.value,
                        entities, ...channel.greeting[admin.secondValue]
                    }];
                    await channel.save();
                } else {
                    channel.greeting = [...channel.greeting.filter((val, index) => index !== admin.secondValue), {text: admin.value, ...channel.greeting[admin.secondValue]}];
                    await channel.save();
                }

                admin.inputMode = undefined;
                admin.command = undefined;
                admin.value = undefined;
                admin.cleanMessages = false;
                await admin.save();

                const inlineKeyboard = new InlineKeyboard()
                    .text("📖 Редактировать текст", "edit-text-greeting").row()
                    .text("🖼️ Редактировать изображение", "edit-image-greeting").row()
                    .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-greeting").row()
                    .text("❌ Редактировать задержку перед удалением", "edit-delete-greeting").row()
                    .text("➕ Добавить кнопку", "add-buttongreeting").row()
                    .text("❓ Удалить все кнопки", "delete-buttons-greeting").row()
                    .text("🔙 Назад", "back-channel-greeting").row();

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

                const currentGreet = channel.greeting[admin.secondValue];
                const greetButtonsKeyboard = new InlineKeyboard() || [];

                if (channel.greeting[admin.secondValue]?.buttons.length) {
                    channel.greeting[admin.secondValue]?.buttons.forEach((item) => {
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
                            caption_entities: ctx.message.entities,
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
                        mediaGroup[0].caption_entities = ctx.message.entities

                        const preEditMessage = await ctx.api.sendMediaGroup(ctx.chat.id, mediaGroup, {disable_web_page_preview: true});
                        admin.preEdit = preEditMessage[0].message_id
                        admin.messagesToDelete = admin.messagesToDelete ? [...admin.messagesToDelete, ...preEditMessage.filter((val, index) => index > 0).map((val) => val.message_id)] : [...preEditMessage.filter((val, index) => index > 0).map((val) => val.message_id)]
                        await admin.save();
                    }
                } else {
                    const preEditMessage = await ctx.api.sendMessage(ctx.chat.id, ctx.message.text, {
                        entities: ctx.message.entities,
                        reply_markup: greetButtonsKeyboard,
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

        if (admin.command === "greetedit 3") {
            const channel = await Channel.findOne({_id: admin.editingChannel});
            const currentGreet = channel.greeting[admin.secondValue];
            const buttons = await this.parseButtons(admin.value);
            if ((currentGreet.image && typeof currentGreet.image === "string") || (!currentGreet.image)) {
                if (!buttons.includes("error")) {
                    channel.greeting[admin.secondValue].buttons = [...currentGreet?.buttons, ...buttons,];
                    await channel.save();

                    const inlineKeyboard = new InlineKeyboard()
                        .text("📖 Редактировать текст", "edit-text-greeting").row()
                        .text("🖼️ Редактировать изображение", "edit-image-greeting").row()
                        .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-greeting").row()
                        .text("❌ Редактировать задержку перед удалением", "edit-delete-greeting").row()
                        .text("➕ Добавить кнопку", "add-buttongreeting").row()
                        .text("❓ Удалить все кнопки", "delete-buttons-greeting").row()
                        .text("🔙 Назад", "back-channel-greeting").row();

                    const buttonRow = inlineKeyboard.row();

                    await ctx.api.deleteMessage(ctx.chat.id, admin.preEdit);
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

                    const greetButtonsKeyboard = new InlineKeyboard();

                    channel.greeting[admin.secondValue].buttons.forEach((item) => {
                        if (typeof item !== "string") {
                            greetButtonsKeyboard.url(item.text, item.url);
                            if (item.row) {
                                greetButtonsKeyboard.row();
                            }
                        }
                    });

                    if (currentGreet.image) {
                        const sendMethod = `send${currentGreet.image.split("^")[1][0].toUpperCase()}${currentGreet.image.split("^")[1].substring(1)}`;
                        const preEditMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.chat.id, currentGreet.image.split("^")[0], {
                            caption: currentGreet.text,
                            caption_entities: entities,
                            reply_markup: greetButtonsKeyboard, disable_web_page_preview: true
                        });
                        if (admin.messagesToDelete.length > 0) {
                            admin.messagesToDelete.forEach(async (message) => {
                                await ctx.api.deleteMessage(ctx.chat.id, message);
                            });
                        }
                        admin.messagesToDelete = undefined;
                        admin.preEdit = preEditMessage.message_id;
                        await admin.save();
                    } else {
                        const preEditMessage = await ctx.api.sendMessage(ctx.chat.id, currentGreet.text, {
                            entities,
                            reply_markup: greetButtonsKeyboard, disable_web_page_preview: true
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

                    admin.inputMode = undefined;
                    admin.command = undefined;
                    admin.value = undefined;
                    admin.cleanMessages = false;
                    admin.messagesToDelete = undefined;
                    await admin.save();

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
        }

        if (admin.command === "greetedit 5") {
            if (!isNaN(admin.value) && parseInt(admin.value) >= 1) {
                const channel = await Channel.findOne({_id: admin.editingChannel});
                const currentGreet = channel.greeting[admin.secondValue];

                channel.greeting = [...channel.greeting.filter((val, index) => index !== admin.secondValue), {
                    ...currentGreet,
                    timeOut: (parseFloat(admin.value) * 60 * 1000)
                }]
                await channel.save()

                admin.inputMode = undefined;
                admin.command = undefined;
                admin.value = undefined;
                await admin.save();

                const inlineKeyboard = new InlineKeyboard()
                    .text("📖 Редактировать текст", "edit-text-greeting").row()
                    .text("🖼️ Редактировать изображение", "edit-image-greeting").row()
                    .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-greeting").row()
                    .text("❌ Редактировать задержку перед удалением", "edit-delete-greeting").row()
                    .text("➕ Добавить кнопку", "add-buttongreeting").row()
                    .text("❓ Удалить все кнопки", "delete-buttons-greeting").row()
                    .text("🔙 Назад", "back-channel-greeting").row();

                const buttonRow = inlineKeyboard.row();

                admin.messagesToDelete.forEach(async (message) => {
                    await ctx.api.deleteMessage(ctx.chat.id, message);
                });

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

        if (admin.command === "greetedit 6") {
            if (!isNaN(admin.value) && parseInt(admin.value) >= 1) {
                const channel = await Channel.findOne({_id: admin.editingChannel});
                const currentGreet = channel.greeting[admin.secondValue];

                channel.greeting = [...channel.greeting.filter((val, index) => index !== admin.secondValue), {
                    ...currentGreet,
                    autoDelete: (parseFloat(admin.value) * 60 * 1000)
                }]
                await channel.save()

                admin.inputMode = undefined;
                admin.command = undefined;
                admin.value = undefined;
                await admin.save();

                const inlineKeyboard = new InlineKeyboard()
                    .text("📖 Редактировать текст", "edit-text-greeting").row()
                    .text("🖼️ Редактировать изображение", "edit-image-greeting").row()
                    .text("⌚ Редактировать задержку перед отправкой", "edit-timeout-greeting").row()
                    .text("❌ Редактировать задержку перед удалением", "edit-delete-greeting").row()
                    .text("➕ Добавить кнопку", "add-buttongreeting").row()
                    .text("❓ Удалить все кнопки", "delete-buttons-greeting").row()
                    .text("🔙 Назад", "back-channel-greeting").row();

                const buttonRow = inlineKeyboard.row();

                admin.messagesToDelete.forEach(async (message) => {
                    await ctx.api.deleteMessage(ctx.chat.id, message);
                });

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
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}