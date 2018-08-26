require('dotenv').config();
var bet = "abcdefghijklmnopqrstuvwxyz0123456789-_"
const sendbird = require('sendbird');
const request = require('request');
const dotenv = require('dotenv');
const fs = require('fs');
const https = require('https');

console.log(process.env.USER_ID);
console.log(process.env.TOKEN);

const credentials = {
  userId: process.env.USER_ID,
  token: process.env.TOKEN
}

let cList = [];
var plzSnap = [];








let listenOn = [];

var sb = new sendbird({
  appId: "2515BDA8-9D3A-47CF-9325-330BC37ADA13"

});
var ch = new sb.ChannelHandler();

var filt = [];
var people = [];
var hasMore = [];


fs.readFile("people.json", (err, data) => {
  if (err) throw err;
  plzSnap = JSON.parse(data);
});


fs.readFile("filter.json", (err, data) => {
  if (err) throw err;
  filt = JSON.parse(data);
  console.log(filt.length);
  // var bet = "abcdefghijklmnopqrstuvwxyz0123456789-_"
  // //for (var i = 0; i < newfilt.length; i++) {
  //   for (var x = 0; x < bet.length; x++) {
  //     var out = bet.charAt(x);
  //     console.log(out);
  //     filt.push(out)
  //   }
  // //}
  // console.log(filt);
  // fs.writeFile("filter.json", JSON.stringify(filt), ()=>{})
});

var memQ = async(channel, filter) => {
  var memQuery = channel.createMemberListQuery();
  memQuery.nicknameStartsWithFilter = filter;
  memQuery.limit = 99;
  if (memQuery.hasNext) {
    memQuery.next((arr, err)=>{
      if (err) {console.warn(err.message); return}
      if (arr.length > 98) {hasMore.push(filter); console.log(filter + " has more than 99 users");}
      if (arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
          if (!people.includes(arr[i].userId)) {
            // console.log(arr[i].userId);
            people.push(arr[i].userId)
          }
        }
      }
    })
  }
}

var getAll = async(url) => {
  sb.GroupChannel.getChannel(url, (channel, err) => {
    if (err) console.warn(err.message);
    console.log(channel.name);

    var num = filt.length;
    var n = -1;
    function toop() {
      setTimeout(function() {
        n = n + 1
        memQ(channel, filt[n]);
        console.log((n+1) + " keys out of " + num + " searched");
        if (n < filt.length-1) {
          toop();
        } else {
          if (hasMore.length > 0) {
            var newFilt = [];
            for (var i = 0; i < hasMore.length; i++) {
              for (var x = 0; x < bet.length; x++) {
                var out = hasMore[i] + bet.charAt(x)
                newFilt.push(out)
              }
            }
            filt = newFilt;
            hasMore = [];
            getAll(url);
          }
          console.log(people.length + " usernames collected");
          fs.writeFile("people.json", JSON.stringify(people),()=>{})
          // console.log(hasMore);
        }
      }, 50);
    }
    toop();
  });
}

var removeGuy = async(url, guy) => {
  sb.GroupChannel.getChannel(url, function(channel, error) {
    if (error) {
      console.error(error);
      return;
    } else {
      channel.unbanUserWithUserId(guy, function(error) {
        if (error) {
          console.error(error)
        }
        console.log("unbanned " + guy);
      })
    }
    // // Successfully fetched the channel.
    // console.log(channel);
  });
}

var snap = async(url) => {
  var n = 0;
  function TO() {
    setTimeout(function() {
      removeGuy(url, plzSnap[n]);
      n = n + 1
      if (n < plzSnap.length) {
        TO();
      } else {
        console.log(n);
      }
    }, 50)
  }
  TO();
}



sb.connect(credentials.userId, credentials.token, (bot, err) => {
  if (err) console.warn(err.message);;
  // console.log("Starting " + bot.nickname);
  var channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
  channelListQuery.includeEmpty = true;
  channelListQuery.limit = 20; // pagination limit could be set up to 100

  if (channelListQuery.hasNext) {
    channelListQuery.next(function(channelList, error) {
      if (error) {
        console.error(error);
        return;
      }
      // loadJSON();
      console.log(channelList[4].name);
      // snap(channelList[4].url);
      console.log(plzSnap.length);
    });
  }
});


ch.onUserJoined = function(channel, user) {

};

sb.addChannelHandler("vsdfh64mc93mg0cn367vne4m50bn3b238", ch);
