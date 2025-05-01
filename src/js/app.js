App = {
  web3Provider: null,
  contracts: {},

  init: function () {
    return App.initWeb3();
  },

  // Instance Web3
  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('https://glowing-space-palm-tree-447v74r7q74h7p5-7545.app.github.dev/');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  // Instance contract
  initContract: function () {
    $.getJSON('Voting.json', function (data) {
      App.contracts.Voting = TruffleContract(data);
      App.contracts.Voting.setProvider(App.web3Provider);
      App.getProposals();
    });
    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-value', function (e) {
      var $this = $(this);
      $this.button('loading');
      App.handleAddProposal(e);
    });

    $(document).ready(function () {
      $('#enableDeadline').on('change', function () {
        if ($(this).is(':checked')) {
          $('#newDeadline').show();
        } else {
          $('#newDeadline').hide();
        }
      });
    });

    $(document).on('click', '.btn-vote', function (e) {
      var $this = $(this);
      $this.button('loading');
      App.handleAddVote(e);
    });
  },

  getProposals: function () {
    var proposalsInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Voting.deployed()
        .then(function (instance) {
          proposalsInstance = instance;
          return proposalsInstance.getNumProposals.call();
        })
        .then(function (numProposals) {
          var wrapperProposals = $('#wrapperProposals');
          wrapperProposals.empty();
          var proposalTemplate = $('#proposalTemplate');
          for (var i = 0; i < numProposals; i++) {
            proposalsInstance.getProposal.call(i).then(function (data) {
              var idx = data[0];
              proposalTemplate.find('.panel-title').text(data[1]);
              proposalTemplate.find('.numVotesPos').text(data[2]);
              proposalTemplate.find('.numVotesNeg').text(data[3]);
              proposalTemplate.find('.numVotesAbs').text(data[4]);
              proposalTemplate.find('.btn-vote').attr('data-proposal', idx);
              proposalTemplate.find('.btn-vote').attr('disabled', false);

              const deadline = parseInt(data[6]);
              const currentTime = Math.floor(Date.now() / 1000);
              let deadlineText = '';

              // ✅ Fix: Only disable buttons if deadline exists and has passed
              if (deadline > 0) {
                const timeRemaining = deadline - currentTime;
                if (timeRemaining > 0) {
                  const minutes = Math.floor(timeRemaining / 60);
                  const seconds = timeRemaining % 60;
                  deadlineText = `Voting ends in: ${minutes}m ${seconds}s`;
                } else {
                  deadlineText = 'Voting ended';
                  proposalTemplate.find('.btn-vote').attr('disabled', true);
                }
              } else {
                deadlineText = 'No deadline set';
              }

              proposalTemplate.find('.deadline').text(deadlineText);

              for (j = 0; j < data[5].length; j++) {
                if (data[5][j] == account) {
                  proposalTemplate.find('.btn-vote').attr('disabled', true);
                }
              }
              wrapperProposals.append(proposalTemplate.html());
            });
          }
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
    $('button').button('reset');
  },

  handleAddProposal: function (event) {
    event.preventDefault();
    var proposalInstance;
    var value = $('.input-value').val();
    let deadline = 0;
    if ($('#enableDeadline').is(':checked')) {
      let deadlineInput = parseFloat(document.getElementById('newDeadline').value);
      if (!isNaN(deadlineInput) && deadlineInput > 0) {
        deadline = Math.floor(Date.now() / 1000) + Math.floor(deadlineInput * 60);
      }
    }

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Voting.deployed()
        .then(function (instance) {
          proposalInstance = instance;
          return proposalInstance.addProposal(value, deadline, {from: account, gas: 300000});
        })
        .then(function () {
          var event = proposalInstance.CreatedProposalEvent();
          App.handleEvent(event);
          $('.input-value').val('');
          $('#newDeadline').val('');
        })
        .catch(function (err) {
          console.log(err.message);
          $('button').button('reset');
        });
    });
  },

  handleAddVote: function (event) {
    event.preventDefault();
    var voteInstance;
    var voteValue = parseInt($(event.target).data('vote'));
    var proposalInt = parseInt($(event.target).data('proposal'));

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Voting.deployed()
        .then(function (instance) {
          voteInstance = instance;
          return voteInstance.vote(proposalInt, voteValue, {from: account, gas: 300000});
        })
        .then(function () {
          var event = voteInstance.CreatedVoteEvent();
          App.handleEvent(event);
        })
        .catch(function (err) {
          console.log(err.message);
          $('button').button('reset');
        });
    });
  },

  handleEvent: function (event) {
    console.log('Waiting for a event...');
    event.watch(function (error, result) {
      if (!error) {
        App.getProposals();
      } else {
        console.log(error);
      }
      event.stopWatching();
    });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
