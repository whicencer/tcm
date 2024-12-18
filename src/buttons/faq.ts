import {InlineKeyboard} from "grammy";
import {Button} from "../structures/Button";
import {Channel} from "../schemas/Channel.schema";
import {Admin} from "../schemas/Admin.schema";

export default class Faq extends Button {
    constructor() {
        super({name: "faq"});
    }

    async run(ctx, bot) {
        await ctx.reply(`❔ Почему я не могу редактировать кнопки?\n\nКнопки в приветствиях/прощаниях/постах/рассылках запрещено редактировать, если у вас более одного вложения в сообщении. То есть если у вас несколько фото или видео, то из-за telegram api нельзя редактировать кнопки\n\n❌ Анимированные эмодзи нельзя использовать при настройке любых текстов `);
        await ctx.answerCallbackQuery()
    }
}