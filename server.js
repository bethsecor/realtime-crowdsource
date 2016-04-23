const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const generateId = require('./lib/generate-id');
const port = process.env.PORT || 3000;
const server = http.createServer(app)
                 .listen(port, function () {
                    console.log('Listening on port ' + port + '.');
                  });
const socketIo = require('socket.io');
const io = socketIo(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.locals.polls = {};
app.locals.title = "Crowdsource";

app.get('/', function (req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/polls', (request, response) => {
  if (!request.body.poll) { return response.sendStatus(400); }
  var id = generateId();
  var admin = generateId();

  app.locals.polls[id] = request.body.poll;
  app.locals.polls[id].adminID = admin;
  app.locals.polls[id].url = "http://localhost:3000/polls/" + id;
  app.locals.polls[id].votes = {};
  app.locals.polls[id].closed = false;

  response.redirect('/polls/' + id + '/admin/' + admin );
});

app.get('/polls/:pollID', function (req, res){
  var pollID = req.params.pollID;
  var poll = app.locals.polls[pollID];
  res.render('poll', {pollID: pollID,
                      question: poll.question,
                      options: poll.options,
                      closed: poll.closed});
});

app.get('/polls/:pollID/admin/:adminID', function (req, res){
  var pollID = req.params.pollID;
  var poll = app.locals.polls[pollID];
  res.render('admin-poll', {pollID: pollID,
                            url: poll.url,
                            results: countVotes(poll),
                            closed: poll.closed,
                            closeTime: poll.closeTime});
});

io.on('connection', function (socket) {
  console.log('A user has connected.', io.engine.clientsCount);

  io.sockets.emit('usersConnected', io.engine.clientsCount);

  socket.on('message', function (channel, message) {
    var poll = app.locals.polls[message.id];
    if (channel === 'voteCast') {
      poll.votes[socket.id] = message.vote;
      socket.emit('voteRecorded', "Your selection of \"" + message.vote + "\" has been recorded. You may change your vote by making a different selection above.");
      io.sockets.emit('voteCount', {votes: countVotes(poll), pollID: message.id});
    } else if (channel === 'closePoll') {
      poll.closed = true;
      io.sockets.emit('pollClosed', {pollID: message.id});
    } else if (channel === 'timeClosePoll') {
      app.locals.polls[message.id].closeTime = message.minutes;
      autoClosePoll(message.id);
    }
  });

  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
    io.sockets.emit('usersConnected', io.engine.clientsCount);
  });
});

function autoClosePoll(id) {
  if (app.locals.polls[id].closeTime !== "") {
    setTimeout(function(){
      app.locals.polls[id].closed = true;
      io.sockets.emit('pollClosed', {pollID: id});
    }, minutesToMilliseconds(app.locals.polls[id].closeTime));
  }
}

function minutesToMilliseconds(minutes) {
  return Number(minutes) * 60000;
}

function countVotes(poll) {
  var voteCount = {};
  poll.options.forEach(function(option){
    voteCount[option] = 0;
  });

  for (var vote in poll.votes) {
    voteCount[poll.votes[vote]]++;
  }
  return voteCount;
}

if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}.`);
  });
}

module.exports = server;
