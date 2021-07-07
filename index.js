const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios").default;
const token = "1872497104:AAGJP_e09_v7fgkPCXlpI_OJpCQz_MppShg";
const bot = new TelegramBot(token, { polling: true });

let timer;

const getNationalRates = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        "https://developerhub.alfabank.by:8273/partner/1.0.1/public/nationalRates?currencyCode=840"
      )
      .then((response) => resolve(response.data.rates[0]))
      .catch((error) => reject(error));
  });
};
const getAlfaRates = () => {
  return new Promise((resolve, reject) => {
    axios
      .get("https://developerhub.alfabank.by:8273/partner/1.0.1/public/rates")
      .then((response) => resolve(response.data.rates))
      .catch((error) => reject(error));
  });
};

const getPrice = (time, msg) => {
  bot.sendMessage(msg.chat.id, "Bonjour");
  timer = setInterval(() => {
    Promise.all([getAlfaRates(), getNationalRates()]).then((values) => {
      const dollarAlfa = values[0].find((i) => i.name === "доллар США");
      let advice;
      if (dollarAlfa.buyRate > values[1].rate) {
        advice = "-> трансфер по нацбанку";
      } else {
        advice = "-> по курсу банка";
      }
      bot.sendMessage(
        msg.chat.id,
        `НацБанк: ${values[1].rate}, ${values[1].date} \n` +
          `Альфа: ${dollarAlfa.buyRate}, ${dollarAlfa.date} \n ${advice}`
      );
    });
  }, time);
};
bot.onText(/\/watch_every_5s/, (msg) => {
  getPrice(5000, msg);
});
bot.onText(/\/watch_every_1h/, (msg) => {
  getPrice(3600000, msg);
});
bot.onText(/\/stop/, (msg) => {
  clearInterval(timer);
  bot.sendMessage(msg.chat.id, "Au revoir");
});
