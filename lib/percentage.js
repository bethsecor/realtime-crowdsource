const totalVotes = require('./total-votes');

function percentage(votes, vote, voteCount) {
  return ((voteCount[votes[vote]][0] / totalVotes(votes)) * 100).toFixed(2);
}

module.exports = percentage;
