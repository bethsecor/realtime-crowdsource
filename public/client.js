var socket = io();

var connectionCount = document.getElementById('connection-count');

socket.on('usersConnected', function (count) {
  connectionCount.innerText = 'Connected Users: ' + count;
});

var buttons = document.querySelectorAll('#poll button');
var pollID = document.location.href.split('/')[4];

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    socket.send('voteCast', {vote: this.innerText, id: pollID});
  });
}

socket.on('voteCount', function (votes) {
  console.log(votes);
  $results = $('#results');
  if ($results !== null && votes.pollID === pollID) {
    $('#results').empty();
    for (var option in votes.votes){
      $('#results').append('<p>' + option + ': ' + votes.votes[option] + '<p>');
    }
  }
});

socket.on('voteRecorded', function (message) {
  $selection = $('#selection');
  if ($selection !== null) {
    $('#selection').empty().append('<p>' + message + '<p>');
  }
});

if ($('#close-poll')[0]) {
  $('#close-poll')[0].addEventListener('click', function () {
    console.log("close this poll!");
    socket.send('closePoll', {id: pollID});
  });
}

if($('#time-close')[0]) {
  $('#time-close')[0].addEventListener('focusout', function () {
    console.log(this.value);
    if(this.value !== "" && !isNaN(this.value)) {
      $('#set-time').empty().append('<p> Poll will close at ' + browser_time(this.value) + '.<p>');
      socket.send('timeClosePoll', {id: pollID, minutes: this.value});
    }
  });
}

function browser_time(minutes) {
  var d = new Date();
  var closePollTime = new Date(d.getTime() + Number(minutes)*60000);
  var c_hour = closePollTime.getHours();
  var c_min = closePollTime.getMinutes();
  var time = c_hour + ":" + c_min;
  return time;
}

var pollThings = document.getElementById('#poll-things');

socket.on('pollClosed', function (message) {
  $pollThings = $('#poll-things');
  if ($pollThings !== null && message.pollID === pollID) {
    $pollThings.empty().append('<p>This poll is closed. Sad day for you.</p>');
  }
  $pollStatus = $('#poll-status');
  if ($pollStatus !== null && message.pollID === pollID) {
    $pollStatus.empty().append('<p>Poll Status: Closed</p>');
  }
});
