require('dotenv').config();
const sendbird = require('sendbird');
const request = require('request');
const dotenv = require('dotenv');
const os = require('os');
const fs = require('fs');

console.log(process.env.USER_ID);

const credentials = {
  userId: process.env.USER_ID,
  token: process.env.TOKEN
}

let subList = [];

function loadJSON() {
  fs.readFile("chatrooms.json", (err, data)=>{
    subList = JSON.parse(data);
    console.log(subList);
  })
}

function updateJSON() {
  fs.writeFile("chatrooms.json", JSON.stringify(subList), (err)=>{
    if (err) {
      console.warn(err);
    }
  })
}

var autoMessageMessage = "This is the chat room for r/community_chat " + os.EOL + os.EOL +"We strongly recommend you all read the rules and the FAQ on the sub to avoid getting messages removed or banned." + os.EOL + "Rules: https://www.reddit.com/r/community_chat/about/rules/ " + os.EOL +"FAQ: https://www.reddit.com/r/community_chat/wiki/faq" + os.EOL + os.EOL +"Also check out /r/SubChats to find chats on things you might be interested in!" + os.EOL + os.EOL + "Interested in becoming a mod? Apply here: https://goo.gl/VyQHwQ";

var sb = new sendbird({ appId: "2515BDA8-9D3A-47CF-9325-330BC37ADA13" }); var ch = new sb.ChannelHandler();

var kick = async(url, userId, nick) => {
  sb.GroupChannel.getChannel(url, function(channel, error) {
    if (error) {
      console.warn(error);
      return;
    } else {
      channel.banUserWithUserId(userId, 1, "User Kicked", function(error) {
        if (error) {
          console.error(error)
        }
        console.log("Removed " + nick + " From " + channel.name);
        console.log(""); console.log("");
      })
    }
  });
}


var validate = async (nick, userId, url, sub) => {
  var doVal = false
  var siq = {}
  for (var i = 0; i < subList.length; i++) {
    if (subList[i].subName == sub) {
      if (subList[i].validate) {
        doVal = true;
        siq = subList[i];
        break;
      }
    }
  }
  if (doVal) {
    request('https://www.reddit.com/u/' + nick + '/about.json', function (error, response, body) {
      if (response.statusCode == 200) {
        var karma = Number(JSON.parse(body).data.link_karma) + Number(JSON.parse(body).data.comment_karma);
        var x = new Date();
        var c = JSON.parse(body).data.created_utc * 1000;
        var f = (x - c) / 60 / 60 / 24 /1000
        console.log(f);
        console.log(karma);
         // / 60 / 60 / 24 / 1000

        if (f < siq.minAge) {
          console.log(nick+"'s account is underage and/or doesn't have enough karma");
          kick(url, userId, nick)
        } else {
          console.log(nick + " has joined the channel");
          console.log(""); console.log("");
        }
      } else {
        console.warn("Could not get " + nick + "'s about.json file")
      }
    });
  }
}

// var autoMessage = async () => {
//   var channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
//   channelListQuery.includeEmpty = false;
//   channelListQuery.limit = 20; // pagination limit could be set up to 100
//
//   if (channelListQuery.hasNext) {
//     channelListQuery.next(function(channelList, error) {
//       if (error) { console.error(error); return; }
//       for (var i = 0; i < channelList.length; i++) {
//         if (channelList[i].memberCount > 100) {
//           if (channelList[i].data) {
//             if () {
//               channelList[i].sendUserMessage(autoMessageMessage, (message, error) => {
//                 if (error) {
//                   console.error(error);
//                 }
//               });
//             }
//           }
//         }
//       }
//     });
//   }
// }


sb.connect(credentials.userId, credentials.token, (bot, err) => {
  if (err) console.warn(err.message);;
  console.log("Starting " + bot.nickname);
  loadJSON();
  var channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
  channelListQuery.includeEmpty = false;
  channelListQuery.limit = 20; // pagination limit could be set up to 100

  if (channelListQuery.hasNext) {
    channelListQuery.next(function(channelList, error) {
      if (error) { console.error(error); return; }
      for (var i = 0; i < channelList.length; i++) {
        if (channelList[i].memberCount > 2) {
          for (var x = 0; x < subList.length; x++) {
            if (!JSON.parse(channelList[i].data).subreddit.name == subList[x].name) {
              var newSub = {
                name: JSON.parse(channelList[i].data).subreddit.name,
                operators: ["AresPhobos"],
                minKarma: 0,
                minAge: 0,
                validate: false
              }
            }
          }
        }
      }
    });
  }
  // autoMessage();
});

ch.onUserJoined = function (channel, user) {
  console.log(user.nickname + " is trying to join " + channel.name);
  validate(user.nickname, user.userId, channel.url, JSON.parse(channel.data).subreddit.name)
};

sb.addChannelHandler("vsdfh64mc93mg0cn367vne4m50bn3b238", ch);

// var messageInterval = setInterval(function() {
//   autoMessage();
// }, 1000 * 60 * 14)
//
// var messageInterval = setInterval(function() {
//   autoMessage();
// }, 1000 * 60 * 14)
