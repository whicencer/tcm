import {Button} from "../structures/Button";
import {User} from "../schemas/User.schema";
import {Channel} from "../schemas/Channel.schema";
import {schedule} from 'node-cron';
import {Admin} from "../schemas/Admin.schema";
import {InlineKeyboard} from "grammy";

export default class NotRobot extends Button {
    constructor() {
        super({name: "send-spam"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: admin.editingChannel});
        const users = await User.find({channels: {$in: [channel.id]}});

        if(admin?.preEdit) {
            ctx.api.deleteMessage(admin._id, admin.preEdit);
        }

        if(admin.messagesToDelete) {
            for (const msg of admin.messagesToDelete) {
                await ctx.api.deleteMessage(admin._id, msg);
            }
        }

        admin.messagesToDelete = undefined;
        admin.preEdit = undefined;
        await admin.save();

        for(const user of users.map(val => val._id)) {
            const greet = channel.futurePost;
            const entities = greet?.entities?.length ? greet.entities.map((entity) => (entity?.url ? {
                    offset: entity.offset,
                    length: entity.length,
                    type: entity.etype,
                    url: entity.url,
                } : {
                    offset: entity.offset,
                    length: entity.length,
                    type: entity.etype,
                }
            )) : [];
            const greetButtonsKeyboard = new InlineKeyboard() || [];

            if (greet.buttons.length) {
                greet.buttons.forEach((item) => {
                    if (typeof item !== "string") {
                        greetButtonsKeyboard.url(item.text, item.url);
                        if (item.row) {
                            greetButtonsKeyboard.row();
                        }
                    }
                });
            }
            if (greet.image) {
                if(typeof greet.image === "string") {
                    setTimeout(async () => {
                        const sendMethod = `send${greet.image.split("^")[1][0].toUpperCase()}${greet.image.split("^")[1].substring(1)}`;
                        const greetMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](user, greet.image.split("^")[0], {
                            caption: greet?.text,
                            caption_entities: entities,
                            reply_markup: greetButtonsKeyboard,
                        });
                        if (greet.autoDelete) {
                            setTimeout(async () => {
                                await ctx.api.deleteMessage(user, greetMessage.message_id);
                            }, greet?.autoDelete ? greet.autoDelete : 0)
                        }
                    }, greet?.timeOut ? greet.timeOut : 0)
                } else {
                    setTimeout(async () => {
                        const mediaGroup = greet.image.map((val) => ({
                            type: (val.split("^")[1] === "gif" ? "animation" : val.split("^")[1]),
                            media: val.split("^")[0]
                        }))
                        mediaGroup[0].caption = greet.text;
                        mediaGroup[0].caption_entities = entities;

                        const greetMessage = await ctx.api.sendMediaGroup(user, mediaGroup, {disable_web_page_preview: true});

                        if (greet.autoDelete) {
                            setTimeout(async () => {
                                for(const msg of greetMessage) {
                                    await ctx.api.deleteMessage(user, msg.message_id);
                                }
                            }, greet?.autoDelete ? greet.autoDelete : 0)
                        }
                    }, greet?.timeOut ? greet.timeOut : 0)
                }
            } else {
                setTimeout(async () => {
                    const greetMessage = await ctx.api.sendMessage(user, greet.text, {
                        entities,
                        reply_markup: greetButtonsKeyboard,
                    });
                    if (greet.autoDelete) {
                        setTimeout(async () => {
                            await ctx.api.deleteMessage(user, greetMessage.message_id);
                        }, greet.autoDelete)
                    }
                }, greet.timeOut)
            }
        }

        channel.futurePost = undefined;
        await channel.save();

        const inlineKeyboard = new InlineKeyboard()
            .text("👋 Настроить приветствие", "greeting").row()
            .text("🫂 Настроить прощание", "leaving").row()
            .text(`🤖 ${channel.captcha ? "Выключить" : "Включить"} капчу`, "captcha").row()
            .text("📫 Сделать рассылку", "spam").row()
            .text("💬 Опубликовать пост", "make-post").row()
            .text(`👌 Настроить одобрение заявок`, "approve-settings").row()
            .text("🔙 Назад", "back-channel-1").row()

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, `✅ Рассылка выслана\n⚙️Выберите действие`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }
}