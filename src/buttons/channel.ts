import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";
import {User} from "../schemas/User.schema";
import {format} from "date-fns";

export default class MyChannels extends Button {
    constructor() {
        super({name: "channel"});
    }

    async run(ctx, bot) {
        const ctxUser = await ctx.getAuthor();
        const channel = await Channel.findOne({_id: ctx.update.callback_query.data.split("_")[1]});
        await Admin.updateOne({_id: ctxUser.user.id}, {
            editingChannel: ctx.update.callback_query.data.split("_")[1],
            mainMessage: ctx.update.callback_query.message.message_id
        })

        const currentDate = new Date();
        const formattedDate = format(currentDate, 'dd.MM.yy');

        const channelId = channel._id;
        const channelName = channel.name;
        const allUsers = await User.find({"channels.id": {$in: [`${ctx.update.callback_query.data.split("_")[1]}`]}});
        const deadUsers = channel.deadMembers ? channel.deadMembers : 0;
        const activeUsers = allUsers.length - deadUsers;

        console.log(await this.getLast7Days())

        const usersInDay = await User.find({
            channels: {
                $elemMatch: {
                    date: { $in: [formattedDate] },
                    id: ctx.update.callback_query.data.split("_")[1]
                }
            }
        });
        const userInWeak = await User.find({
            channels: {
                $elemMatch: {
                    date: { $in: await this.getLast7Days() },
                    id: ctx.update.callback_query.data.split("_")[1]
                }
            }
        });
        const userInMonth = await User.find({
            channels: {
                $elemMatch: {
                    date: { $regex:  new RegExp(`\\.${formattedDate.split(".")[1]}\\.`) },
                    id: ctx.update.callback_query.data.split("_")[1]
                }
            }
        });

        const inlineKeyboard = new InlineKeyboard()
            .text("👋 Настроить приветствие", "greeting").row()
            .text("🫂 Настроить прощание", "leaving").row()
            .text(`🤖 ${channel.captcha ? "Выключить" : "Включить"} капчу`, "captcha").row()
            .text("📫 Сделать рассылку", "spam").row()
            .text("💬 Опубликовать пост", "make-post").row()
            .text(`👌 Настроить одобрение заявок`, "approve-settings").row()
            .text("🔙 Назад", "back-channel-1").row()

        const buttonRow = inlineKeyboard.row();

        await ctx.api.editMessageText(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, "⚙️Выберите, что настроить\n" +
            "\n\n❔ Статистика\n\n" +
            `Имя: ${channelName}\n` +
            `ID: ${channelId}\n\n` +
            `📊 Пользователи\n` +
            `│ Все: ${allUsers.length}\n` +
            `│ Активные: ${activeUsers}\n` +
            `╰ Мёртвые: ${deadUsers}\n\n` +
            `📈 Прирост\n` +
            `│ За день: ${usersInDay.length}\n` +
            `│ За неделю: ${userInWeak.length}\n` +
            `╰ За месяц: ${userInMonth.length}\n`);
        await ctx.api.editMessageReplyMarkup(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id, {reply_markup: buttonRow});
        await ctx.answerCallbackQuery()
    }

    private async getLast7Days() {
        const dates = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
            const year = String(date.getFullYear()).slice(-2); // Получаем последние 2 цифры года

            dates.push(`${day}.${month}.${year}`);
        }

        return dates;
    }
}