const percentage = require('./percentage');

function countVotes(poll) {
  var voteCount = {};
  poll.options.forEach(function(option){
    voteCount[option] = [0, 0];
  });

  for (var vote in poll.votes) {
    voteCount[poll.votes[vote]][0]++;
    if (voteCount[poll.votes[vote]][0] !== 0) {
      voteCount[poll.votes[vote]][1] = percentage(poll.votes, vote, voteCount);
    }
  }
  return voteCount;
}

module.exports = countVotes;
