import {Button} from "../structures/Button";
import {User} from "../schemas/User.schema";
import {Channel} from "../schemas/Channel.schema";
import {schedule} from 'node-cron';
import {Admin} from "../schemas/Admin.schema";
import {InlineKeyboard} from "grammy";
import {format} from "date-fns";

export default class NotRobot extends Button {
    constructor() {
        super({name: "notrobot"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const user = await User.findOne({_id: ctxUser.user.id});
        const admin = await Admin.findOne({_id: ctxUser.user.id});
        const channel = await Channel.findOne({_id: user.request.channel});
        const currentDate = new Date();
        const formattedDate = format(currentDate, 'dd.MM.yy');

        await ctx.api.deleteMessage(ctx.chat.id, user.messagesToDelete[0]);

        if (!channel?.autoApprove && channel?.greeting) {
            if(!user) {
                const newUser = new User({_id: ctxUser.user.id, username: ctxUser.user.username, channels:[{
                        id: user.request.channel,
                        date: formattedDate
                    }]});
                await newUser.save()
            } else {
                user.channels = [...user.channels, {
                    id: user.request.channel,
                    date: formattedDate
                }]
                await user.save()
            }

            for (const greet of channel.greeting) {
                const entities = greet?.entities?.length ? greet.entities.map((entity) => ((entity?.url ? {
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

                if (greet?.buttons.length) {
                    greet.greeting.buttons.forEach((item) => {
                        if (typeof item !== "string") {
                            greetButtonsKeyboard.url(item.text, item.url);
                            if (item.row) {
                                greetButtonsKeyboard.row();
                            }
                        }
                    });
                }
                if (greet?.image) {
                    if (typeof greet.image === "string") {
                        setTimeout(async () => {
                            const sendMethod = `send${greet.image.split("^")[1][0].toUpperCase()}${greet.image.split("^")[1].substring(1)}`;
                            const greetMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctxUser.user.id, greet.image.split("^")[0], {
                                caption: greet?.text,
                                caption_entities: entities,
                                reply_markup: greetButtonsKeyboard,
                                disable_web_page_preview: true
                            });
                            if (greet.autoDelete) {
                                setTimeout(async () => {
                                    await ctx.api.deleteMessage(ctxUser.user.id, greetMessage.message_id);
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

                            const greetMessage = await ctx.api.sendMediaGroup(ctxUser.user.id, mediaGroup, {disable_web_page_preview: true});

                            if (greet.autoDelete) {
                                setTimeout(async () => {
                                    for(const msg of greetMessage) {
                                        await ctx.api.deleteMessage(ctxUser.user.id, msg.message_id);
                                    }
                                }, greet?.autoDelete ? greet.autoDelete : 0)
                            }
                        }, greet?.timeOut ? greet.timeOut : 0)
                    }
                } else {
                    setTimeout(async () => {
                        const greetMessage = await ctx.api.sendMessage(ctxUser.user.id, greet?.text, {
                            entities,
                            reply_markup: greetButtonsKeyboard,
                            disable_web_page_preview: true
                        });
                        if (greet.autoDelete) {
                            setTimeout(async () => {
                                await ctx.api.deleteMessage(ctxUser.user.id, greetMessage.message_id);
                            }, greet?.autoDelete ? greet.autoDelete : 0)
                        }
                    }, greet?.timeOut ? greet.timeOut : 0)
                }
            }
        }

        await ctx.answerCallbackQuery()
    }
}