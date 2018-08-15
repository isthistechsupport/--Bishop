require('dotenv').config();

const sendbird = require('sendbird');
const request = require('request');
const fs = require('fs');

const credentials = {
  userId: "t2_1zdqmcxq",
  token: ""
}

let listenOn = [];

var sb = new sendbird({
  appId: "2515BDA8-9D3A-47CF-9325-330BC37ADA13"
});

sb.connect(credentials.userId, credentials.token, (user, err) => {
  if (err) throw err;
  console.log(user);
});
