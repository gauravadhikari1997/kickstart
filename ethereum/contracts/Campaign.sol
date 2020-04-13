pragma solidity ^0.6.5;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimumContri) public {
        address newCampaign = address(new Campaign(minimumContri, msg.sender));
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns(address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {

    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    address payable public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;

    Request[] public requests;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor(uint c, address payable creator) public {
        manager = creator;
        minimumContribution = c;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);

        // Keep track of number of contributors
        if(!approvers[msg.sender]) {
          approversCount ++;
        }
        approvers[msg.sender] = true;
    }

    function createRequest(string memory description, uint value, address payable recipient) public restricted {
        // Ensure we can't ask for more money than the contract holds
        require(value <= address(this).balance);
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint index) public {
        // he is contributer
        // he has not already approved that request
        require(approvers[msg.sender]);
        require(!requests[index].approvals[msg.sender]);

        // make this contributer's approval true in that request
        // increment the approvalCount of that request
        requests[index].approvals[msg.sender] = true;
        requests[index].approvalCount++;
    }

    function finalizeRequest(uint index) public restricted {
        // Request is not already finalized
        // Request Approval count is greater than total approvers/contributers
        require(!requests[index].complete);
        require(requests[index].approvalCount > (approversCount/2));

        // transfer money
        // mark request as completed
        requests[index].recipient.transfer(requests[index].value);
        requests[index].complete = true;
    }
    function getSummary() public view returns( uint, uint, uint, uint, address ) {
        return (
          minimumContribution,
          address(this).balance,
          requests.length,
          approversCount,
          manager
          );
    }

    function getRequestCount() public view returns( uint ) {
        return requests.length;
    }
}
