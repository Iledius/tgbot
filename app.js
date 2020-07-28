require("dotenv").config("/.env");

const { Telegraf } = require("telegraf");
const Jimp = require("jimp");
const axios = require("axios");
const fs = require("fs");
const Path = require("path");

const Token = process.env.BOT_TOKEN;

const bot = new Telegraf(Token);

const send_image = (id, img_path) => {
  console.log(id);
  bot.telegram
    .sendPhoto(id, { source: img_path })
    .catch((err) => console.log(err));
};

bot.start((ctx) => ctx.reply("Welcome!"));
bot.command("img", (ctx) => {
  ctx.replyWithPhoto({ source: "./savedimages/123.png" });
});

bot.on("photo", async (ctx) => {
  console.log("received msg");
  const imageData = await bot.telegram
    .getFile(ctx.message.photo[ctx.message.photo.length - 1].file_id)
    .catch((err) => console.log(err));

  const savepath = Path.resolve(
    __dirname,
    "savedimages",
    `${Date.now()}-original.png`
  );
  const writer = fs.createWriteStream(savepath);

  response = await axios({
    method: "get",
    url: `https://api.telegram.org/file/bot${Token}/${imageData.file_path}`,
    responseType: "stream",
  }).then(async (response) => {
    await response.data.pipe(writer);
    writer.on("finish", () => {
      writer.end();
      ctx.reply("Trying to resize to 512x512");
      resizedImgName = resiz(savepath, ctx.chat.id);
      // console.log("path is: --- ", savepath);
      // send_image(ctx.chat.id, savepath);
    });
  });
});

async function resiz(path, chat_id) {
  const img_name = `./resizedimages/${Date.now()}512x512.png`;
  console.log("name set");
  Jimp.read(path)
    .then((img) => {
      img.resize(512, 512).write(img_name).then(send_image(chat_id, img_name)); // save
    })
    .catch((err) => {
      console.error(err);
    });
  console.log("returning image");
  console.log(img_name);
  return img_name;
}

bot.launch();
