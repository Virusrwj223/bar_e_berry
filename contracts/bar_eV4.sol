// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts@4.8.0/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.8.0/token/ERC721/extensions/ERC721Burnable.sol";


contract MyToken is ERC721, ERC721Burnable {
    uint256 private _nextTokenId;
    address[] public registeredAddresses;

    constructor()
        ERC721("BARE", "MTK")
    {}


    struct Landlord {
        uint serialNum;
        uint listingNum;
        uint time;
        uint deposit;
        uint monthlyRental;
        uint isActiveListing; //0 = deactive, 1 = bought, 2 = active
        string cid;
        string title;
        string description;
    }

    struct Renter {
        address rWalletAddress;
        uint start;
        uint latestRentDue;
        uint rentNotificationReceived;
        uint end;
        bool hasRentPaid;
        uint depositAmount;
        bool hasActiveRental;
        uint rentalDeposit;
        uint monthlyRental;
        address lWalletAddress;
        uint tokenNum;
    }

    //create renter
    struct Person {
        address rWalletAddress;
        Landlord landlordDetails;
        Renter RenterDetails;
        uint currentSerialNum;
    }
    mapping(address => Person) public person;
    mapping(address => mapping(uint => Landlord)) public personToLandlord;
    mapping(address => mapping(address => Renter)) public personToRenter;

    function addPerson(
        address rWalletAddress
    ) public {
        person[rWalletAddress] = Person(
            rWalletAddress,
            Landlord(0,0,0,0,0,0,"","",""),
            Renter(rWalletAddress,0,0,0,0,false,0,false,0,0,rWalletAddress,0),
            0
        );
        registeredAddresses.push(rWalletAddress);
    }

    function numUsers() public view returns(uint){
            return registeredAddresses.length;
    }

    function safeMint(address externaladdress, uint _time, uint _deposit, uint _monthlyRental, string memory uri, string memory _title, string memory _description) public{
        require(personToRenter[externaladdress][externaladdress].depositAmount>=50);
        uint256 tokenId = _nextTokenId++;
        uint256 currSerialNum = person[externaladdress].currentSerialNum;
        _safeMint(externaladdress, tokenId);
        personToRenter[externaladdress][externaladdress].depositAmount -= 50;
        personToLandlord[externaladdress][currSerialNum].serialNum=currSerialNum;
        personToLandlord[externaladdress][currSerialNum].listingNum=tokenId;
        personToLandlord[externaladdress][currSerialNum].time=_time;
        personToLandlord[externaladdress][currSerialNum].deposit=_deposit;
        personToLandlord[externaladdress][currSerialNum].monthlyRental=_monthlyRental;
        personToLandlord[externaladdress][currSerialNum].isActiveListing=2;
        personToLandlord[externaladdress][currSerialNum].cid=uri;
        person[externaladdress].currentSerialNum=person[externaladdress].currentSerialNum+1;
        personToLandlord[externaladdress][currSerialNum].title=_title;
        personToLandlord[externaladdress][currSerialNum].description=_description;
    }

    function deactivateListing(address externaladdress, uint listingNum) public {
        personToLandlord[externaladdress][listingNum].isActiveListing=0;
    }

    function firstPurchase(address externaladdress, address landlordaddress, uint _rentDuration, uint _deposit, uint _monthlyRent, uint _listingNum) public{
        require(personToRenter[externaladdress][externaladdress].hasActiveRental==false);
        require(personToRenter[externaladdress][externaladdress].depositAmount>_deposit);
        personToLandlord[landlordaddress][_listingNum].isActiveListing=1;
        personToRenter[externaladdress][externaladdress].tokenNum=_listingNum;
        personToRenter[externaladdress][externaladdress].lWalletAddress=landlordaddress;
        personToRenter[landlordaddress][landlordaddress].depositAmount+=_deposit;
        personToRenter[externaladdress][externaladdress].depositAmount-=_deposit;
        personToRenter[externaladdress][externaladdress].start=block.timestamp;
        personToRenter[externaladdress][externaladdress].end=block.timestamp+_rentDuration*86400;
        personToRenter[externaladdress][externaladdress].latestRentDue=block.timestamp+2629743;
        personToRenter[externaladdress][externaladdress].hasRentPaid=true;
        personToRenter[externaladdress][externaladdress].hasActiveRental=true;
        personToRenter[externaladdress][externaladdress].rentNotificationReceived = personToRenter[externaladdress][externaladdress].latestRentDue;
        personToRenter[externaladdress][externaladdress].rentalDeposit=_deposit;
        personToRenter[externaladdress][externaladdress].monthlyRental=_monthlyRent;
    }

    function deposit(address externalAddress, uint256 _amount) public {
        personToRenter[externalAddress][externalAddress].depositAmount+=_amount;
    }

    function withdraw(address externaladdress, uint256 _amount) public {
        personToRenter[externaladdress][externaladdress].depositAmount-=_amount;
    }

    function payMonthlyRent(address externaladdress) public {
        require(personToRenter[externaladdress][externaladdress].depositAmount>=personToRenter[externaladdress][externaladdress].monthlyRental);
        require(block.timestamp>=personToRenter[externaladdress][externaladdress].latestRentDue);
        personToRenter[externaladdress][externaladdress].depositAmount-=personToRenter[externaladdress][externaladdress].monthlyRental;
        personToRenter[personToRenter[externaladdress][externaladdress].lWalletAddress][personToRenter[externaladdress][externaladdress].lWalletAddress].depositAmount+=personToRenter[externaladdress][externaladdress].monthlyRental;
        personToRenter[externaladdress][externaladdress].hasRentPaid=true;
        personToRenter[externaladdress][externaladdress].latestRentDue=block.timestamp+2629743;

    }
    function earlyTerminateRental(address externaladdress) public {
        uint256 overdueBalance=(personToRenter[externaladdress][externaladdress].monthlyRental/2629743)*(block.timestamp-(personToRenter[externaladdress][externaladdress].latestRentDue-2629743));
        require(personToRenter[externaladdress][externaladdress].depositAmount>=overdueBalance);
        require(personToRenter[externaladdress][externaladdress].hasRentPaid==true);
        personToLandlord[personToRenter[externaladdress][externaladdress].lWalletAddress][personToRenter[externaladdress][externaladdress].tokenNum].isActiveListing=2;
        personToRenter[externaladdress][externaladdress].depositAmount-=overdueBalance;
        personToRenter[personToRenter[externaladdress][externaladdress].lWalletAddress][personToRenter[externaladdress][externaladdress].lWalletAddress].depositAmount+=overdueBalance;
        personToRenter[personToRenter[externaladdress][externaladdress].lWalletAddress][personToRenter[externaladdress][externaladdress].lWalletAddress].depositAmount-=personToRenter[externaladdress][externaladdress].rentalDeposit;
        personToRenter[externaladdress][externaladdress].depositAmount+=personToRenter[externaladdress][externaladdress].rentalDeposit;
        personToRenter[externaladdress][externaladdress].hasActiveRental=false;
        personToRenter[externaladdress][externaladdress].hasRentPaid=false;
    }


}
