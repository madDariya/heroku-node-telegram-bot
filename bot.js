const token = process.env.TOKEN;

const Bot = require('node-telegram-bot-api');
let bot;

if(process.env.NODE_ENV === 'production') {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
}
else {
  bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

bot.on(/\/get/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'What currency do you want to check?',{
    reply_markup: {
        inline_keyboard: [
          [
              {
                  text: '€ - EUR',
                  callback_data: 'EUR'
              },
              {
                  text: '$ - USD',
                  callback_data: 'USD'
              },
              {
                  text: '₽ - RUR',
                  callback_data: 'RUR'
              },
              {
                  text: '₿ - BTC',
                  callback_data: 'BTC'
              }
          ]
        ]
    }
  });
});

bot.on('callback_query', query => {
    //console.log(query);
    const id = query.message.chat.id;

    request('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5', function(error, response, body){
        const data = JSON.parse(body);
        const result = data.filter(item => item.ccy === query.data)[0];
        const flag = {
            'EUR': '🇪🇺',
            'USD': '🇺🇸',
            'RUR': '🇷🇺',
            'UAH': '🇺🇦',
            'BTC': '₿'
          }
        let md = `
        *${flag[result.ccy]} ${result.ccy} 💱 ${result.base_ccy} ${flag[result.base_ccy]}*
      Buy: _${result.buy}_
      Sale: _${result.sale}_
        `;
        bot.sendMessage(id, md, {parse_mode: 'Markdown'});
    })
})
module.exports = bot;
