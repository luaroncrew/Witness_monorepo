// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Ownable } from "openzeppelin-contracts/contracts/access/Ownable.sol";
import { IERC20 } from "openzeppelin-contracts/contracts/interfaces/IERC20.sol";
import { ISP } from "./SignProtocol/ISP.sol";
import { ISPHook } from "./SignProtocol/ISPHook.sol";
import { Attestation } from "./SignProtocol/Attestation.sol";
import { WitnessDAO } from "./WitnessDAO.sol";


contract UserStatusValidator is Ownable {

    WitnessDAO public dao;

    constructor(address daoAddress) Ownable(_msgSender()) {
        dao = WitnessDAO(daoAddress);
    }

    function checkStatus(bytes32 author) public view {
        require(dao.isBanned(author) == false, "Cannot attest for banned user");
    }
}


contract DataValidatorHook is ISPHook, UserStatusValidator {

    address public daoAddress;
    error UnsupportedOperation();


    struct AttestationData {
        bytes32 author;
        string cid;
        string location;
        uint256 timestamp;
        string hash;
    }

    constructor(address _daoAddress) UserStatusValidator(_daoAddress) {
        daoAddress = _daoAddress;
    }

    function didReceiveAttestation(
        address, // attester
        uint64, // schemaId
        uint64 attestationId,
        bytes calldata // extraData
    )
    external
    payable
    {
        Attestation memory attestation = ISP(_msgSender()).getAttestation(attestationId);
        bytes32 attestedAuthor = abi.decode(attestation.data, (AttestationData)).author;
        checkStatus(attestedAuthor);
    }

    function didReceiveAttestation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        IERC20, // resolverFeeERC20Token
        uint256, // resolverFeeERC20Amount
        bytes calldata // extraData
    )
        external
        pure
    {
        revert UnsupportedOperation();
    }

    function didReceiveRevocation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        bytes calldata // extraData
    )
        external
        payable
    {
        revert UnsupportedOperation();
    }

    function didReceiveRevocation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        IERC20, // resolverFeeERC20Token
        uint256, // resolverFeeERC20Amount
        bytes calldata // extraData
    )
        external
        pure
    {
        revert UnsupportedOperation();
    }
}
