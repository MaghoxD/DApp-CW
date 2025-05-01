pragma solidity ^0.4.17;

contract Voting {

    struct Proposal {
        string title;
        uint voteCountPos;
        uint voteCountNeg;
        uint voteCountAbs;
        uint deadline;
        mapping (address => Voter) voters;
        address[] votersAddress;
    }

    struct Voter {
        uint value;
        bool voted;
    }

    Proposal[] public proposals;

    event CreatedProposalEvent();
    event CreatedVoteEvent();

    function getNumProposals() public view returns (uint) {
        return proposals.length;
    }

    function getProposal(uint proposalInt) public view returns (uint, string, uint, uint, uint, address[], uint) {
        if (proposals.length > 0) {
            Proposal storage p = proposals[proposalInt];
            return (
                proposalInt,
                p.title,
                p.voteCountPos,
                p.voteCountNeg,
                p.voteCountAbs,
                p.votersAddress,
                p.deadline
            );
        }
    }

    function addProposal(string title, uint deadline) public returns (bool) {
        Proposal memory proposal;
        proposal.title = title;
        proposal.deadline = deadline;
        proposals.push(proposal);
        CreatedProposalEvent();
        return true;
    }

    function vote(uint proposalInt, uint voteValue) public returns (bool) {
        require(voteValue == 1 || voteValue == 2 || voteValue == 3);
        Proposal storage p = proposals[proposalInt];

        require(p.deadline == 0 || now < p.deadline);

        if (!p.voters[msg.sender].voted) {
            if (voteValue == 1) {
                p.voteCountPos += 1;
            } else if (voteValue == 2) {
                p.voteCountNeg += 1;
            } else {
                p.voteCountAbs += 1;
            }
            p.voters[msg.sender] = Voter(voteValue, true);
            p.votersAddress.push(msg.sender);
            CreatedVoteEvent();
            return true;
        } else {
            return false;
        }
    }
}
