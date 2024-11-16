// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Ownable } from "openzeppelin-contracts/contracts/access/Ownable.sol";
import { ISP } from "./SignProtocol/ISP.sol";
import { Attestation } from "./SignProtocol/Attestation.sol";


contract WitnessDAO is Ownable {
    address private daoAddress;
    enum Status { ACTIVE, UNDER_INVESTIGATION, BANNED }

    // Sign Protocol instance to query
    ISP public isp;

    // constants
    uint256 public voteDuration = 1 weeks;
    uint256 public banThresholdPercentage = 50;
    uint256 public REPORT_THRESHOLD = 3;
    address public SIGN_PROTOCOL_ADDRESS = 0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD;


    // mapping attestationId -> votes for the attestation pertinence
    mapping(uint64 => Vote) public votes;

    // create an array of the indexes of the votes
    uint64[] public voteIndexes;

    // mapping attestationId -> reportCount
    mapping(uint64 => uint256) public reportCounts;

    // mapping userIdentifier -> status
    mapping(string => Status) public userStatus;


    struct Vote {
        uint256 startTime;
        uint256 yesVotes;
        uint256 noVotes;
        string userUnderInvestigation;
    }

    struct AttestationData {
        string author;
        string cid;
        string location;
        uint256 timestamp;
        string hash;
    }

    constructor () Ownable(_msgSender()) {
        isp = ISP(SIGN_PROTOCOL_ADDRESS);
    }

    function startVote(uint64 attestationId) internal {
        Attestation memory attestation = isp.getAttestation(attestationId);
        AttestationData memory attestationData = abi.decode(attestation.data, (AttestationData));
        string memory userIdentifier = attestationData.author;

        require(!(votes[attestationId].startTime < block.timestamp), "Vote already active");
        votes[attestationId] = Vote({
            startTime: block.timestamp,
            yesVotes: 0,
            noVotes: 0,
            userUnderInvestigation: userIdentifier
        });
        setUserStatus(userIdentifier, Status.UNDER_INVESTIGATION);
    }

    function castVote(uint64 attestationId, string memory userIdentifier, bool support) external onlyOwner {
        // TODO: block the user from voting multiple times
        require(!isBanned(userIdentifier), "Banned users vote");
        require(block.timestamp < votes[attestationId].startTime + voteDuration, "Voting period ended");
        support ? votes[attestationId].yesVotes++ : votes[attestationId].noVotes++;
    }

    function endVote(uint64 attestationId) internal {
        Vote storage vote = votes[attestationId];
        require(block.timestamp >= vote.startTime + voteDuration, "Voting period not ended");

        uint256 totalVotes = vote.yesVotes + vote.noVotes;
        uint256 yesVotePercentage = (vote.yesVotes * 100) / totalVotes;

        yesVotePercentage >= banThresholdPercentage ?
            setUserStatus(vote.userUnderInvestigation, Status.BANNED):
            setUserStatus(vote.userUnderInvestigation, Status.ACTIVE);
    }

    function setBanThresholdPercentage(uint256 newThreshold) external onlyOwner {
        require(newThreshold <= 100, "Threshold cannot exceed 100%");
        banThresholdPercentage = newThreshold;
    }

    function setVoteDuration(uint256 newDuration) external onlyOwner {
        voteDuration = newDuration;
    }

    // --- backdoor functions ---
    function ban(string memory userIdentifier) external onlyOwner {
        setUserStatus(userIdentifier, Status.BANNED);
    }


    // --- User Status Management ---
    function setUserStatus(string memory userIdentifier, Status status) internal {
        userStatus[userIdentifier] = status;
    }

    function isBanned(string memory userIdentifier) public view returns (bool) {
        return userStatus[userIdentifier] == Status.BANNED;
    }

    function forceVoteStart(uint64 attestationId) external onlyOwner{
        startVote(attestationId);
    }

    // attestationId represents the id of link of the image and the testimony posted on Sign Protocol
    // userIdentifier is the World Id's sub: a unique identifier for the witness app
    function reportImage(uint64 attestationId, string memory userIdentifier) external {
        // would be cool to verify the existence before reporting using the following:
        // Attestation attestation = isp.getAttestation(attestationId);

        // verify if the reporter is banned
        require(!isBanned(userIdentifier), "Banned users cannot report");

        reportCounts[attestationId]++;

        // if the number of reports exceeds the threshold, start a vote
        if (reportCounts[attestationId] >= REPORT_THRESHOLD) {
            startVote(attestationId);
        }
    }

    // iterate over all the votes to find those that must be ended
    function endVotes() external onlyOwner {
        for(uint64 voteIndex = 0; voteIndex < voteIndexes.length; voteIndex++) {
            uint64 attestationId = voteIndexes[voteIndex];
            Vote storage vote = votes[attestationId];
            if (block.timestamp >= vote.startTime + voteDuration) {
                endVote(attestationId);
            }
        }
    }

}
