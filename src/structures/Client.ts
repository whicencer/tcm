import {Bot, InlineKeyboard, session} from "grammy";
import {readdirSync} from "node:fs";
import {Command} from "./Command";
import * as mongoose from "mongoose";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";
import {User} from "../schemas/User.schema";
import * as dotenv from 'dotenv';
import * as path from "path";

const fs = require('fs-extra');
dotenv.config({path: path.resolve(__dirname, "botconfig.env")});

export class ChannelManagerBot extends Bot {
    constructor() {
        super(process.env.BOT_TOKEN);
    }

    public handleCommands() {
        readdirSync(path.join(`src/slashes`)).filter(name => name.endsWith(".ts")).forEach(async cmd => {
            const commandImported = require(`../slashes/${cmd.replace('.ts', '')}`).default;
            const command = new commandImported() as Command;
            this.command(command.data.name, async ctx => {
                const ctxUser = await ctx.getAuthor();
                if (ctxUser.user.id !== 1064234174 && ctxUser.user.id !== 6388679468 && ctxUser.user.id !== 915471265 && ctxUser.user.id !== 6939013881) {
                    await ctx.reply("❌ Этот бот не для вас")
                } else {
                    const admin = await Admin.findOne({_id: ctxUser.user.id});
                    if (!admin) {
                        const newAdmin = new Admin({
                            _id: ctxUser.user.id
                        });
                        await newAdmin.save();
                    }
                    await command.run(ctx, this)
                }
            });
        })
    }

    public async handleMessages() {
        this.on("message", async (ctx) => {
            const ctxUser = await ctx.getAuthor();
            const admin = await Admin.findOne({_id: ctxUser.user.id})

            if (admin && admin.inputMode ) {
                if((ctx.message?.entities && ctx.message?.entities.some(obj => obj.type === "custom_emoji")) || (ctx.message?.caption_entities && ctx.message?.caption_entities.some(obj => obj.type === "custom_emoji"))) {
                    const reply = await ctx.reply("❌ Нельзя использовать анимированные эмодзи")
                    if (admin.cleanMessages) {
                        admin.messagesToDelete = [...admin.messagesToDelete, ctx.message.message_id, reply.message_id]
                        await admin.save()
                    }
                }
                else {
                    const command = this.findCommand(admin.command.split(" ")[0], `${admin.command.split(" ")[0]} ${admin.command.split(" ")[1]}`)

                    if (command) {
                        admin.value = ctx.message.text ? ctx.message.text : ctx.message.caption;
                        await admin.save()

                        if (admin.cleanMessages) {
                            admin.messagesToDelete = [...admin.messagesToDelete, ctx.message.message_id]
                            await admin.save()
                        }
                        await command.run(ctx, this)
                    }
                }
            }
        })
    }

    async handleFuncs(funcTypes: string[]) {
        funcTypes.forEach(type => {
            readdirSync(path.join(`src/functions`)).filter(name => name.endsWith(".ts")).forEach(cmd => {
                const commandImported = require(`../functions/${cmd.replace('.ts', '')}`).default;
                const command = new commandImported() as Command;
                this[type].set(command.data.name, command);
            })
        })
    }

    public handleButtons() {
        readdirSync(path.join(`src/buttons`)).filter(name => name.endsWith(".ts")).forEach(async btn => {
            const buttonImported = require(`../buttons/${btn.replace('.ts', '')}`).default;
            const button = new buttonImported() as Command;

            const buttonNames = Array.isArray(button.data.name) ? button.data.name : [button.data.name];

            buttonNames.forEach(name => {
                this.callbackQuery(new RegExp(`^${name}`), async ctx => {
                    const admin = await Admin.findOne({_id: ctx.callbackQuery.from.id});
                    const callbackData = ctx.callbackQuery.data;
                    if (name === "notrobot") await button.run(ctx, this);
                    else if (ctx.update.callback_query.message.message_id === admin.mainMessage) {
                        if (((name === "channel" || name === "greetedit") && (callbackData.includes('channel_')) || callbackData.includes('greetedit_')) || (name === "greet_delete" && callbackData.includes('greet_delete_'))) {
                            await button.run(ctx, this);
                        } else {
                            await button.run(ctx, this);
                        }
                    } else {
                        await ctx.answerCallbackQuery("❌ Меню уже устарело");
                    }
                });
            });
        });
    }


    public async handleChannels() {
        this.on("my_chat_member", async (ctx) => {
            const admin = await Admin.findOne({_id: ctx.update.my_chat_member.from.id});

            if (ctx.update.my_chat_member.new_chat_member.status === "administrator" && ctx.update.my_chat_member.chat.type === "channel" && admin) {
                const newChannel = new Channel({
                    _id: ctx.update.my_chat_member.chat.id,
                    name: ctx.update.my_chat_member.chat.title,
                    admin: ctx.update.my_chat_member.from.id
                });
                await newChannel.save();
                await ctx.api.sendMessage(ctx.update.my_chat_member.from.id, "✅ Вы успешно добавили бота в канал");

                console.log(ctx.update.my_chat_member.chat.id)
                const channels = await Channel.find({admin: ctx.update.my_chat_member.from.id});

                const channelsPanel = new InlineKeyboard()

                channels.forEach((channel, index) => {
                    channelsPanel.text(channel.name, "channel_" + channel._id).row()
                })

                channelsPanel.text("❔ Нюансы настройки канла", "faq").row()

                const mainMessage = await ctx.api.sendMessage(ctx.update.my_chat_member.from.id, `${channels.length ? "✅ Выберите канал для его настройки" : "❌ Нет каналов для настройки.\nДобавьте бота в канал на правах администратора, если вы всё сделаете правильно - вам придёт уведомление"}`, {
                    reply_markup: channelsPanel,
                });

                await Admin.updateOne({_id: ctx.update.my_chat_member.from.id}, {
                    mainMessage: mainMessage.message_id,
                });

            } else if (ctx.update.my_chat_member.new_chat_member.status !== "administrator" && ctx.update.my_chat_member.chat.type === "channel") {
                await Channel.deleteOne({_id: ctx.update.my_chat_member.chat.id});
            }
        })
    }

    public async handleMembers() {
        this.on("chat_member", async (ctx) => {
            const channel = await Channel.findOne({_id: ctx.update.chat_member.chat.id});
            if (ctx.update.chat_member.new_chat_member.status === "member" && channel?.greeting.length > 0) {
                const userInList = channel.requestsList.includes(ctx.update.chat_member.old_chat_member.user.id);

                if (!channel.captcha && !channel.autoApprove.switched && channel.greeting && !channel.requestsList.includes(ctx.update.chat_member.old_chat_member.user.id)) {
                    const user = await User.findOne({_id: ctx.update.chat_member.from.id});
                    if (!user) {
                        const newUser = new User({
                            _id: ctx.update.chat_member.from.id,
                            username: ctx.update.chat_member.from.username,
                            channels: [ctx.update.chat_member.chat.id]
                        });
                        await newUser.save()
                    } else {
                        user.channels = [...user.channels, ctx.update.chat_member.chat.id]
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
                        if (greet?.image) {
                            if (typeof greet.image === "string") {
                                setTimeout(async () => {
                                    const sendMethod = `send${greet.image.split("^")[1][0].toUpperCase()}${greet.image.split("^")[1].substring(1)}`;
                                    const greetMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.update.chat_member.from.id, greet.image.split("^")[0], {
                                        caption: greet?.text,
                                        caption_entities: entities,
                                        reply_markup: greetButtonsKeyboard,
                                        disable_web_page_preview: true
                                    });
                                    if (greet.autoDelete) {
                                        setTimeout(async () => {
                                            await ctx.api.deleteMessage(ctx.update.chat_member.from.id, greetMessage.message_id);
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

                                    const greetMessage = await ctx.api.sendMediaGroup(ctx.update.chat_member.from.id, mediaGroup, {disable_web_page_preview: true});

                                    if (greet.autoDelete) {
                                        setTimeout(async () => {
                                            for(const msg of greetMessage) {
                                                await ctx.api.deleteMessage(ctx.update.chat_member.from.id, msg.message_id);
                                            }
                                        }, greet?.autoDelete ? greet.autoDelete : 0)
                                    }
                                }, greet?.timeOut ? greet.timeOut : 0)
                            }
                        } else {
                            setTimeout(async () => {
                                const greetMessage = await ctx.api.sendMessage(ctx.update.chat_member.from.id, greet?.text, {
                                    entities,
                                    reply_markup: greetButtonsKeyboard,
                                    disable_web_page_preview: true
                                });
                                if (greet.autoDelete) {
                                    setTimeout(async () => {
                                        await ctx.api.deleteMessage(ctx.update.chat_member.from.id, greetMessage.message_id);
                                    }, greet?.autoDelete ? greet.autoDelete : 0)
                                }
                            }, greet?.timeOut ? greet.timeOut : 0)
                        }
                    }
                }
                if (userInList) {
                    channel.requestsList = channel.requestsList.filter(value => value !== ctx.update.chat_member.old_chat_member.user.id)
                    await channel.save()
                }
            } else if (ctx.update.chat_member.new_chat_member.status === "left" && channel?.leaving.length > 0) {
                for (const leave of channel.leaving) {
                    const entities = leave?.entities?.length ? leave.entities.map((entity) => ((entity?.url ? {
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
                    const leaveButtonKeyboard = new InlineKeyboard() || [];

                    if (leave?.buttons?.length > 0) {
                        leave?.buttons.forEach((item) => {
                            if (typeof item !== "string") {
                                leaveButtonKeyboard.url(item.text, item.url);
                                if (item.row) {
                                    leaveButtonKeyboard.row();
                                }
                            }
                        });
                    }
                    if (leave?.image) {
                        if (typeof leave.image === "string") {
                            setTimeout(async () => {
                                const sendMethod = `send${leave.image.split("^")[1][0].toUpperCase()}${leave.image.split("^")[1].substring(1)}`;
                                const leaveMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.update.chat_member.from.id, leave.image.split("^")[0], {
                                    caption: leave?.text,
                                    caption_entities: entities,
                                    reply_markup: leaveButtonKeyboard,
                                    disable_web_page_preview: true
                                });
                                if (leave.autoDelete) {
                                    setTimeout(async () => {
                                        await ctx.api.deleteMessage(ctx.update.chat_member.from.id, leaveMessage.message_id);
                                    }, leave?.autoDelete ? leave.autoDelete : 0)
                                }
                            }, leave?.timeOut ? leave.timeOut : 0)
                        } else {
                            setTimeout(async () => {
                                const mediaGroup = leave.image.map((val) => ({
                                    type: (val.split("^")[1] === "gif" ? "animation" : val.split("^")[1]),
                                    media: val.split("^")[0]
                                }))
                                mediaGroup[0].caption = leave.text;
                                mediaGroup[0].caption_entities = entities;
                                mediaGroup[0].disable_web_page_preview = true;

                                const leaveMessage = await ctx.api.sendMediaGroup(ctx.update.chat_member.from.id, mediaGroup, {disable_web_page_preview: true});

                                if (leave.autoDelete) {
                                    setTimeout(async () => {
                                        for(const msg of leaveMessage) {
                                            await ctx.api.deleteMessage(ctx.update.chat_member.from.id, msg.message_id);
                                        }
                                    }, leave?.autoDelete ? leave.autoDelete : 0)
                                }
                            }, leave?.timeOut ? leave.timeOut : 0)
                        }
                    } else {
                        setTimeout(async () => {
                            const leaveMessage = await ctx.api.sendMessage(ctx.update.chat_member.from.id, leave?.text, {
                                entities,
                                reply_markup: leaveButtonKeyboard,
                                disable_web_page_preview: true
                            });
                            if (leave.autoDelete) {
                                setTimeout(async () => {
                                    await ctx.api.deleteMessage(ctx.update.chat_member.from.id, leaveMessage.message_id);
                                }, leave?.autoDelete ? leave.autoDelete : 0)
                            }
                        }, leave?.timeOut ? leave.timeOut : 0)
                    }
                }
            }
        })
    }

    public async handleJoinRequests() {
        this.on('chat_join_request', async (ctx) => {
            const channel = await Channel.findOne({_id: ctx.update.chat_join_request.chat.id});
            if (channel && channel.autoApprove.switched) {
                const user = await User.findOne({_id: ctx.update.chat_join_request.from.id});
                if (!user) {
                    const newUser = new User({
                        _id: ctx.update.chat_join_request.from.id,
                        userName: ctx.update.chat_join_request.from.username,
                        channels: [ctx.update.chat_join_request.chat.id],
                        request: {
                            channel: ctx.update.chat_join_request.chat.id
                        },
                    })
                    await newUser.save();
                } else {
                    user.request = {
                        channel: ctx.update.chat_join_request.chat.id
                    }
                    user.channels = [...user.channels, ctx.update.chat_join_request.chat.id]
                    await user.save();
                }

                if (channel.autoApprove.timeOut) {
                    setTimeout(async () => {
                        await ctx.approveChatJoinRequest(ctx.update.chat_join_request.from.id);
                    }, channel.autoApprove.timeOut)
                } else {
                    await ctx.approveChatJoinRequest(ctx.update.chat_join_request.from.id);
                }
            }
            if (channel && channel.captcha) {
                const inlineKeyboard = new InlineKeyboard()
                    .text("🤖❌ Я не робот", "notrobot").row()

                const buttonRow = inlineKeyboard.row();

                const message = await ctx.api.sendMessage(ctx.update.chat_join_request.from.id, "✅ Подтвердите, что вы не робот", {reply_markup: buttonRow});

                const user = await User.findOne({_id: ctx.update.chat_join_request.from.id});
                if (!user) {
                    const newUser = new User({
                        _id: ctx.update.chat_join_request.from.id,
                        userName: ctx.update.chat_join_request.from.username,
                        request: {
                            channel: ctx.update.chat_join_request.chat.id
                        },
                        channels: [ctx.update.chat_join_request.chat.id],
                        messagesToDelete: [message.message_id]
                    })
                    await newUser.save();
                } else {
                    user.request = {
                        channel: ctx.update.chat_join_request.chat.id
                    }
                    user.channels = [...user.channels, ctx.update.chat_join_request.chat.id]
                    user.messagesToDelete = [message.message_id]
                    await user.save();
                }
            }
            if ((channel && channel.autoApprove.switched && channel?.greeting.length > 0) || (channel && !channel.captcha && !channel.autoApprove.switched && channel?.greeting.length > 0)) {

                const user = await User.findOne({_id: ctx.update.chat_join_request.from.id});
                if (!user) {
                    const newUser = new User({
                        _id: ctx.update.chat_join_request.from.id,
                        username: ctx.update.chat_join_request.from.username,
                        channels: [ctx.update.chat_join_request.chat.id]
                    });
                    await newUser.save()
                } else {
                    user.channels = [...user.channels, ctx.update.chat_join_request.chat.id]
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

                    if (greet?.buttons?.length) {
                        greet?.buttons.forEach((item) => {
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
                                const greetMessage = await ctx.api[`${sendMethod === "sendGif" ? "sendAnimation" : sendMethod}`](ctx.update.chat_join_request.from.id, greet.image.split("^")[0], {
                                    caption: greet?.text,
                                    caption_entities: entities,
                                    reply_markup: greetButtonsKeyboard,
                                    disable_web_page_preview: true
                                });
                                if (greet.autoDelete) {
                                    setTimeout(async () => {
                                        await ctx.api.deleteMessage(ctx.update.chat_join_request.from.id, greetMessage.message_id);
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

                                const greetMessage = await ctx.api.sendMediaGroup(ctx.update.chat_join_request.from.id, mediaGroup, {disable_web_page_preview: true});

                                if (greet.autoDelete) {
                                    setTimeout(async () => {
                                        for(const msg of greetMessage) {
                                            await ctx.api.deleteMessage(ctx.update.chat_join_request.from.id, msg.message_id);
                                        }
                                    }, greet?.autoDelete ? greet.autoDelete : 0)
                                }
                            }, greet?.timeOut ? greet.timeOut : 0)
                        }
                    } else {
                        setTimeout(async () => {
                            const greetMessage = await ctx.api.sendMessage(ctx.update.chat_join_request.from.id, greet?.text, {
                                entities,
                                reply_markup: greetButtonsKeyboard,
                                disable_web_page_preview: true
                            });
                            if (greet.autoDelete) {
                                setTimeout(async () => {
                                    await ctx.api.deleteMessage(ctx.update.chat_join_request.from.id, greetMessage.message_id);
                                }, greet?.autoDelete ? greet.autoDelete : 0)
                            }
                        }, greet?.timeOut ? greet.timeOut : 0)
                    }
                }

                channel.requestsList = [ctx.update.chat_join_request.from.id, ...channel.requestsList]
                await channel.save()
            }
        });
    }

    findCommand(type, key) {
        let result;
        for (const [k, v] of this[type]) {
            if (k.includes(key)) {
                result = v;
            }
        }
        return result
    }

    public async startBot() {
        //mongodb://localhost:27017 mongodb://db:27017/db
        mongoose.connect(process.env.BOT_TOKEN).then(() => {
            console.log("Connected to db")
        });
        await this.start({
            allowed_updates: ["message", "channel_post", "callback_query", "chat_member", "chat_join_request", "my_chat_member"],
            onStart: async () => {
                await this.handleFuncs(["greetings", "leavings", "greetedit", "leaveedit", "posts", "spams"]);
                await this.handleChannels();
                await this.handleButtons();
                await this.handleCommands();
                await this.handleMessages();
                await this.handleMembers();
                await this.handleJoinRequests();
                this.catch((error) => {
                    fs.appendFile("./logs.txt", `\n${error.message}\n${error.stack}`);
                    console.log(`Err detected:\n${error.message}\n${error.stack}\nSEE MORE IN LOGS`)
                })
                console.log("Bot started!");
            }
        });
    }

    greetings = new Map();
    leavings = new Map();
    greetedit = new Map();
    leaveedit = new Map();
    posts = new Map();
    spams = new Map();
}

process.on('uncaughtException', function (err) {
    fs.appendFile("./logs.txt", `\n${err.message}\n${err.stack}`);
    console.log(`Err detected:\n${err.message}\n${err.stack}\nSEE MORE IN LOGS`)
});