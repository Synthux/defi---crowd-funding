// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        mapping(address => uint256) donatedAmount;
        bool refunded; // флаг, чтобы не делать массовый рефанд дважды
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns;

    event CampaignCreated(uint256 indexed id, address owner);
    event DonationReceived(uint256 indexed id, address indexed donor, uint256 amount);
    event RefundClaimed(uint256 indexed id, address indexed donor, uint256 amount);

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");

        Campaign storage c = campaigns[numberOfCampaigns];
        c.owner = _owner;
        c.title = _title;
        c.description = _description;
        c.target = _target;
        c.deadline = _deadline;
        c.image = _image;

        emit CampaignCreated(numberOfCampaigns, _owner);
        return numberOfCampaigns++;
    }

    function donateToCampaign(uint256 _id) public payable {
        Campaign storage c = campaigns[_id];
        require(block.timestamp < c.deadline, "Campaign is over");
        require(msg.value > 0, "Must send ETH");

        // учёт пожертвования
        if (c.donatedAmount[msg.sender] == 0) {
            c.donators.push(msg.sender);
        }
        c.donatedAmount[msg.sender] += msg.value;
        c.amountCollected += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value);
    }

    /// @notice Донатор может вернуть себе средства, если дедлайн прошёл и цель не достигнута
    function claimRefund(uint256 _id) external {
        Campaign storage c = campaigns[_id];

        require(block.timestamp > c.deadline,       "Too early for refund");
        require(c.amountCollected < c.target,       "Target was met");
        uint256 donated = c.donatedAmount[msg.sender];
        require(donated > 0,                        "No funds to refund");

        // сначала уменьшаем собранную сумму
        c.amountCollected -= donated;
        // зануляем донорский баланс
        c.donatedAmount[msg.sender] = 0;
        payable(msg.sender).transfer(donated);

        emit RefundClaimed(_id, msg.sender, donated);
    }

    // Геттер для массива донаторов и их сумм
    function getDonators(uint256 _id) external view returns (address[] memory, uint256[] memory) {
        Campaign storage c = campaigns[_id];
        uint256 len = c.donators.length;
        uint256[] memory amounts = new uint256[](len);
        for (uint i = 0; i < len; i++) {
            amounts[i] = c.donatedAmount[c.donators[i]];
        }
        return (c.donators, amounts);
    }

    // Возвращает базовую информацию о кампаниях
    function getCampaigns() external view returns (
        address[] memory owners,
        string[] memory titles,
        string[] memory descriptions,
        uint256[] memory targets,
        uint256[] memory deadlines,
        uint256[] memory collected,
        string[] memory images
    ) {
        uint256 n = numberOfCampaigns;
        owners       = new address[](n);
        titles       = new string[](n);
        descriptions = new string[](n);
        targets      = new uint256[](n);
        deadlines    = new uint256[](n);
        collected    = new uint256[](n);
        images       = new string[](n);

        for (uint i = 0; i < n; i++) {
            Campaign storage c = campaigns[i];
            owners[i]       = c.owner;
            titles[i]       = c.title;
            descriptions[i] = c.description;
            targets[i]      = c.target;
            deadlines[i]    = c.deadline;
            collected[i]    = c.amountCollected;
            images[i]       = c.image;
        }
    }
}
