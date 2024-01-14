// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts@4.8.0/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.8.0/token/ERC721/extensions/ERC721Burnable.sol";

contract master {

    address[] public registeredAddresses;

    struct Landlord {
        uint serialNum;
        address listingAdd;
        string cid;
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
        uint holdingShares;
        uint tokenId;
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
            Landlord(0, 0x0000000000000000000000000000000000000000,""),
            Renter(rWalletAddress,0,0,0,0,false,0,false,0,0,rWalletAddress,0,0),
            0
        );
        registeredAddresses.push(rWalletAddress);
    }

    function numUsers() public view returns(uint){
            return registeredAddresses.length;
    }

    function safeMint(address externaladdress,string memory _tokenName, uint _time, uint _deposit, uint _monthlyRental, uint _authorisedShares, string memory uri, string memory _title, string memory _description) public {
        require(personToRenter[externaladdress][externaladdress].depositAmount>=50);
        uint256 currSerialNum = person[externaladdress].currentSerialNum;
        personToRenter[externaladdress][externaladdress].depositAmount -= 50;
        address childContract = address(new listing(_tokenName, [_time, _deposit, _monthlyRental, _authorisedShares], uri, _title, _description, externaladdress)); // creating new contract inside another parent contract
        personToLandlord[externaladdress][currSerialNum].serialNum=currSerialNum;
        personToLandlord[externaladdress][currSerialNum].listingAdd=childContract;
        personToLandlord[externaladdress][currSerialNum].cid=uri;
        person[externaladdress].currentSerialNum=person[externaladdress].currentSerialNum+1;
    }

    function firstPurchase(address externaladdress, address landlordaddress, uint _rentDuration, uint _deposit, uint _monthlyRent, uint _sharespurchased, uint _tokenId) public{
        require(personToRenter[externaladdress][externaladdress].hasActiveRental==false);
        require(personToRenter[externaladdress][externaladdress].depositAmount>_deposit);
        //personToLandlord[landlordaddress][_listingNum].isActiveListing=1;
        personToRenter[externaladdress][externaladdress].holdingShares=_sharespurchased;
        personToRenter[externaladdress][externaladdress].rWalletAddress=externaladdress;
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
        personToRenter[externaladdress][externaladdress].tokenId=_tokenId;
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

    function earlyTerminateRental(address externaladdress, uint sharesTaken) public {
        uint256 overdueBalance=(personToRenter[externaladdress][externaladdress].monthlyRental/2629743)*(block.timestamp-(personToRenter[externaladdress][externaladdress].latestRentDue-2629743));
        uint256 remainingShareBal = personToRenter[externaladdress][externaladdress].holdingShares- sharesTaken;
        require(remainingShareBal>=0);
        require(personToRenter[externaladdress][externaladdress].depositAmount>=overdueBalance);
        require(personToRenter[externaladdress][externaladdress].hasRentPaid==true);
        //personToLandlord[personToRenter[externaladdress][externaladdress].lWalletAddress][personToRenter[externaladdress][externaladdress].tokenNum].isActiveListing=2;
        if (remainingShareBal == 0){
            personToRenter[externaladdress][externaladdress].depositAmount-=overdueBalance;
            personToRenter[personToRenter[externaladdress][externaladdress].lWalletAddress][personToRenter[externaladdress][externaladdress].lWalletAddress].depositAmount+=overdueBalance;
            personToRenter[personToRenter[externaladdress][externaladdress].lWalletAddress][personToRenter[externaladdress][externaladdress].lWalletAddress].depositAmount-=personToRenter[externaladdress][externaladdress].rentalDeposit;
            personToRenter[externaladdress][externaladdress].depositAmount+=personToRenter[externaladdress][externaladdress].rentalDeposit;
            personToRenter[externaladdress][externaladdress].hasActiveRental=false;
            personToRenter[externaladdress][externaladdress].hasRentPaid=false;
            personToRenter[externaladdress][externaladdress].holdingShares=0;
        }else{
            personToRenter[externaladdress][externaladdress].depositAmount-=overdueBalance;
            personToRenter[personToRenter[externaladdress][externaladdress].lWalletAddress][personToRenter[externaladdress][externaladdress].lWalletAddress].depositAmount+=overdueBalance;
            personToRenter[externaladdress][externaladdress].hasRentPaid=true;
            personToRenter[externaladdress][externaladdress].monthlyRental = personToRenter[externaladdress][externaladdress].monthlyRental*remainingShareBal/personToRenter[externaladdress][externaladdress].holdingShares;
            personToRenter[externaladdress][externaladdress].holdingShares = remainingShareBal;
        }
    }
}

contract listing is ERC721, ERC721Burnable {

    struct Listing {
        string cid;
        address owner;
        uint time;
        uint deposit;
        uint monthlyRental;
        uint isActiveListing; //0 = deactive, 1 = bought, 2 = active
        string title;
        string description;
        uint authorised;
        uint outstanding;
        string tokenName;
    }

    mapping(string => Listing) public listingMap;

    constructor(string memory _tokenName, uint[4] memory stats, string memory uri, string memory _title, string memory _description, address externaladdress)
        ERC721("BARE", _tokenName)
    {
        for (uint i = 0; i < stats[3]; i++) {
            _safeMint(externaladdress, i);
        }
        
        listingMap[uri].cid=uri;
        listingMap[uri].owner=externaladdress;
        listingMap[uri].time=stats[0];
        listingMap[uri].deposit=stats[1];
        listingMap[uri].monthlyRental=stats[2];
        listingMap[uri].isActiveListing=2;
        listingMap[uri].cid=uri;
        listingMap[uri].title=_title;
        listingMap[uri].description=_description;
        listingMap[uri].authorised=stats[3];
        listingMap[uri].outstanding=0;
        listingMap[uri].tokenName=_tokenName;
    }

    function deactivateListing(string memory uri) public {
        require(listingMap[uri].outstanding == 0);
        listingMap[uri].isActiveListing=0;
        for (uint i = 0; i < listingMap[uri].authorised; i++) {
            burn(i);
        }
    }

    function purchaseListing(string memory uri, uint sharesPurchased, address purchaser) public{
        require(listingMap[uri].outstanding + sharesPurchased <= listingMap[uri].authorised);
        listingMap[uri].outstanding += sharesPurchased;
        for (uint i = listingMap[uri].outstanding; i < sharesPurchased; i++) {
            safeTransferFrom(listingMap[uri].owner, purchaser, i);
        }
        if(listingMap[uri].outstanding==listingMap[uri].authorised){
            listingMap[uri].isActiveListing=1;
        }
    }

    function terminateRental(string memory uri, uint sharesPurchased, address purchaser) public{
        require(listingMap[uri].outstanding - sharesPurchased >= 0);
        listingMap[uri].outstanding -= sharesPurchased;
        for (uint i = listingMap[uri].outstanding; i > listingMap[uri].authorised - sharesPurchased; i--) {
            safeTransferFrom(purchaser, listingMap[uri].owner, i);
        }
        if(listingMap[uri].outstanding<listingMap[uri].authorised){
            listingMap[uri].isActiveListing=2;
        }
    }

}

