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
    address public SIGN_PROTOCOL_ADDRESS = 0x878c92FD89d8E0B93Dc0a3c907A2adc7577e39c5;


    // mapping attestationId -> votes for the attestation pertinence
    mapping(uint64 => Vote) public votes;

    // mapping attestationId -> reportCount
    mapping(uint64 => uint256) public reportCounts;

    // mapping userIdentifier -> status
    mapping(bytes32 => Status) public userStatus;


    struct Vote {
        uint256 startTime;
        uint256 yesVotes;
        uint256 noVotes;
        bytes32 userUnderInvestigation;
    }

    struct AttestationData {
        bytes32 author;
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
        bytes32 userIdentifier = attestationData.author;

        require(!(votes[attestationId].startTime < block.timestamp), "Vote already active");
        votes[attestationId] = Vote({
            startTime: block.timestamp,
            yesVotes: 0,
            noVotes: 0,
            userUnderInvestigation: userIdentifier
        });
        setUserStatus(userIdentifier, Status.UNDER_INVESTIGATION);
    }

    function castVote(uint64 attestationId, bytes32 userIdentifier, bool support) external {
        // TODO: block the user from voting multiple times
        require(!isBanned(userIdentifier), "Banned users vote");
        require(block.timestamp < votes[attestationId].startTime + voteDuration, "Voting period ended");
        support ? votes[attestationId].yesVotes++ : votes[attestationId].noVotes++;
    }

    function endVote(uint64 attestationId) external onlyOwner {
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
    function ban(bytes32 userIdentifier) external onlyOwner {
        setUserStatus(userIdentifier, Status.BANNED);
    }


    // --- User Status Management ---
    function setUserStatus(bytes32 userIdentifier, Status status) internal {
        userStatus[userIdentifier] = status;
    }

    function isBanned(bytes32 userIdentifier) public view returns (bool) {
        return userStatus[userIdentifier] == Status.BANNED;
    }

    // attestationId represents the id of link of the image and the testimony posted on Sign Protocol
    // userIdentifier is the World Id's sub: a unique identifier for the witness app
    function reportImage(uint64 attestationId, bytes32 userIdentifier) external {
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
}
