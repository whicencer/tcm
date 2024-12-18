import {HearsContext, Context, InlineKeyboard} from "grammy";
import {Command} from "../structures/Command";
import {Admin} from "../schemas/Admin.schema";

export default class Users extends Command {
    constructor() {
        super({
            name: ["users 1", "users 2"],
        });
    }

    async run(ctx: HearsContext<Context>, bot) {
        const ctxUser = await ctx.getAuthor();
        const admin = await Admin.findOne({_id: ctxUser.user.id});

        const userRoles = {
            "user": true,
            "admin": true,
            "headadmin": true
        }

        if (admin.command === "users 1") {
            const user = admin.value.split("-");

            if (user.length === 2 && isNaN(user[0]) && isNaN(user[1])) {
                user[0] = user[0].trim()
                user[1] = user[1].trim()

                if (user[0][0] === "@") {
                    user[0] = user[0].slice(1)
                }

                if((userRoles[user[1]] === true && user[1] === "headadmin" && admin.isHeadAdmin) || (userRoles[user[1]] === true && user[1] === "admin" && admin.isTrueAdmin) || (admin._id !== 1064234174 && admin._id !== 6388679468 && admin._id !== 915471265 && admin._id !== 6939013881)) {
                    const message = await ctx.reply("❌ У вас не достаточно прав, чтобы назначать headadmin`ов и admin`в");
                    admin.messagesToDelete = [...admin.messagesToDelete.filter((val) => admin.preEdit !== val), message.message_id,];
                    await admin.save();
                } else {
                    if (user.length === 2 && isNaN(user[0]) && isNaN(user[1]) && userRoles[user[1]] === true) {
                        const userFound = await Admin.findOne({username: user[0]});

                        if (!userFound) {
                            if (admin?.messagesToDelete?.length > 0) {
                                admin.messagesToDelete.forEach(async (message) => {
                                    await ctx.api.deleteMessage(ctx.chat.id, message);
                                });
                            }
                            admin.messagesToDelete = undefined;
                            await admin.save();

                            const newAdmin = new Admin({
                                _id: this.generateRandomCombination(20),
                                username: user[0]
                            });

                            if (user[1] === "admin") {
                                newAdmin.isTrueAdmin = true;
                            }else if (user[1] === "headadmin") {
                                newAdmin.isHeadAdmin = true;
                            } else {
                                newAdmin.isHeadAdmin = false;
                                newAdmin.isTrueAdmin = false;
                            }

                            await newAdmin.save();

                            const inlineKeyboard = new InlineKeyboard()
                                .text("➕ Добавить пользователя", "add-user").row()
                                .text("➖ Удалить пользователя", "delete-user").row()
                                .text("📃 Список пользователей", "user-list").row()
                                .text("🔙 Назад", "back-channel-admin").row()

                            const buttonRow = inlineKeyboard.row();

                            await ctx.api.editMessageText(ctx.chat.id, admin.mainMessage, "✅ Новый пользователь добавлен");
                            await ctx.api.editMessageReplyMarkup(ctx.chat.id, admin.mainMessage, {reply_markup: buttonRow});
                        } else {
                            const inlineKeyboard = new InlineKeyboard()
                                .text("➕ Добавить пользователя", "add-user").row()
                                .text("➖ Удалить пользователя", "delete-user").row()
                                .text("📃 Список пользователей", "user-list").row()
                                .text("🔙 Назад", "back-channel-admin").row()

                            const buttonRow = inlineKeyboard.row();

                            await ctx.api.editMessageText(ctx.chat.id, admin.mainMessage, "❌ Пользователь уже существует");
                            await ctx.api.editMessageReplyMarkup(ctx.chat.id, admin.mainMessage, {reply_markup: buttonRow});
                        }

                        if (admin?.messagesToDelete?.length > 0) {
                            admin.messagesToDelete.forEach(async (message) => {
                                await ctx.api.deleteMessage(ctx.chat.id, message);
                            });
                        }
                        admin.messagesToDelete = undefined;
                        await admin.save();

                        admin.inputMode = undefined;
                        admin.command = undefined;
                        admin.value = undefined;
                        admin.cleanMessages = false;
                        admin.messagesToDelete = undefined;
                        await admin.save();
                    } else {
                        const message = await ctx.reply("❌ Неверный формат, попробуйте ещё раз");
                        admin.messagesToDelete = [...admin.messagesToDelete.filter((val) => admin.preEdit !== val), message.message_id,];
                        await admin.save();
                    }
                }
            }
        }

        if (admin.command === "users 2") {
            let user = admin.value.trim();
            if(user[0] === "@") {
                user = user.slice(1)
            }
            const userFound = await Admin.findOne({username: user});
            if ((userFound && userFound.isTrueAdmin && admin.isHeadAdmin) || (userFound && (!userFound.isHeadAdmin && !userFound.isTrueAdmin) && (admin.isHeadAdmin || admin.isTrueAdmin)) || (userFound && (admin._id === 1064234174 || admin._id === 6388679468 || admin._id === 915471265 || admin._id === 6939013881))) {
                if (admin?.messagesToDelete?.length > 0) {
                    admin.messagesToDelete.forEach(async (message) => {
                        await ctx.api.deleteMessage(ctx.chat.id, message);
                    });
                }
                admin.messagesToDelete = undefined;
                await admin.save();

                await Admin.deleteOne({username: user}).exec()

                const inlineKeyboard = new InlineKeyboard()
                    .text("➕ Добавить пользователя", "add-user").row()
                    .text("➖ Удалить пользователя", "delete-user").row()
                    .text("📃 Список пользователей", "user-list").row()
                    .text("🔙 Назад", "back-channel-admin").row()

                const buttonRow = inlineKeyboard.row();

                await ctx.api.editMessageText(ctx.chat.id, admin.mainMessage, "✅ Пользователь удалён");
                await ctx.api.editMessageReplyMarkup(ctx.chat.id, admin.mainMessage, {reply_markup: buttonRow});
            } else {
                const inlineKeyboard = new InlineKeyboard()
                    .text("➕ Добавить пользователя", "add-user").row()
                    .text("➖ Удалить пользователя", "delete-user").row()
                    .text("📃 Список пользователей", "user-list").row()
                    .text("🔙 Назад", "back-channel-admin").row()

                const buttonRow = inlineKeyboard.row();

                await ctx.api.editMessageText(ctx.chat.id, admin.mainMessage, "❌ Пользователь не существует либо у вас нет прав чтобы удалить его");
                await ctx.api.editMessageReplyMarkup(ctx.chat.id, admin.mainMessage, {reply_markup: buttonRow});
            }

            if (admin?.messagesToDelete?.length > 0) {
                admin.messagesToDelete.forEach(async (message) => {
                    await ctx.api.deleteMessage(ctx.chat.id, message);
                });
            }
            admin.messagesToDelete = undefined;
            await admin.save();

            admin.inputMode = undefined;
            admin.command = undefined;
            admin.value = undefined;
            admin.cleanMessages = false;
            admin.messagesToDelete = undefined;
            await admin.save();
        }
    }

    private generateRandomCombination(length) {
        let combination = '';
        for (let i = 0; i < length; i++) {
            const randomDigit = Math.floor(Math.random() * 9) + 1;
            combination += randomDigit.toString();
        }
        return combination;
    }
}
