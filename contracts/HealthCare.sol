pragma solidity ^0.6.1;
pragma experimental ABIEncoderV2;


import './HealthToken.sol';

contract HealthCare {

    HealthToken token;
    address public owner;

    constructor (address _token) public {
        token = HealthToken(_token);
        owner = msg.sender;
    }


    struct DATA {
        string file;
        string prescription;
    }

    struct PatientData{
        address Patient;
        string[] data;
    }



    mapping(address => bool) public isDoc; // doctor
    address[] public allDoctors;

    mapping(address => bool) public isPatient; // patient
    address[] public allPatients;

    mapping(address => uint256) public docFee; // doctor while registering doctor

    mapping(address => string[]) public patientData; // patient addFile

    mapping(address => DATA[]) public prescription; // patient when doctor add prescription

    mapping(address=> address[]) public docPatientList; // doctor and patient list while sending file
    mapping(address => mapping(address => bool)) public docPatient; // above bool
    mapping(address => mapping(address => string[])) public docData; // above sending file


    // patient function

    event PatientAdded(
        address Patient
    );

    function addPatient() public{
        // msg.sender is patient
        require(isDoc[msg.sender] == false, "Address is Doctor");
        require(isPatient[msg.sender] == false, "Address is already patient");
        isPatient[msg.sender] = true;
        allPatients.push(msg.sender);
        emit PatientAdded(msg.sender);
    }


    function getAllPatients() public view returns(address[] memory){
        return allPatients;
    }

    function allPatientsData() public view returns(string[] memory){
        // msg.sender is patient
        return patientData[msg.sender];
    }

    function allPrescriptions() public view returns(DATA[] memory){
        // msg.sender is patient
        return prescription[msg.sender];
    }

    event DoctorAdded(
        address Doctor,
        uint256 Fee
    );

    function addDoctor(uint256 _fees) public{
        // msg.sender is doctor
        require(isDoc[msg.sender] == false, "Address is already Doctor");
        require(isPatient[msg.sender] == false, "Address is patient");
        allDoctors.push(msg.sender);
        isDoc[msg.sender] = true;
        docFee[msg.sender] = _fees;
        emit DoctorAdded(msg.sender, _fees);
    }

    event FeeChanged(
      address Doctor,
      uint256 Fee
    );

    function changeFee(uint256 _fees) public{
      require(isDoc[msg.sender] == false, "Address is already Doctor");
      require(isPatient[msg.sender] == false, "Address is patient");
      docFee[msg.sender] = _fees;
      emit FeeChanged(msg.sender, _fees);
    }


    function getAllDoctors() public view returns(address[] memory){
        return allDoctors;
    }


    function addFile(string memory _fileHash) public{
        // msg.sender is patient
        require(isPatient[msg.sender] == true, "Address is not patient");
        patientData[msg.sender].push(_fileHash);
    }


    function sendFile(address _doc, string memory _fileHash, uint256 _amount) public {
        // msg.sender is patient
        require(isPatient[msg.sender] == true, "You are not patient");
        require(isDoc[_doc] == true, "Invalid Doctor");
        require(_amount == docFee[_doc], "Insufficient fee sent");

        token.approveContract(address(this), msg.sender, _amount);

        token.transferFrom(msg.sender, address(this), _amount);

        docPatientList[_doc].push(msg.sender);
        docPatient[_doc][msg.sender] = true;
        docData[_doc][msg.sender].push(_fileHash);
    }


    // doctor's function


    function sendPrescription(address _patient, string memory _filehash, string memory _prescription) public {
        // msg.sender is doctor
        require(isDoc[msg.sender] == true, "You are not Doctor");
        require(isPatient[_patient] == true, "Invalid patient");
        require(docPatient[msg.sender][_patient]==true, "Not your patient");

        DATA memory d;
        d.file = _filehash;
        d.prescription = _prescription;

        prescription[_patient].push(d);

        token.transfer(msg.sender, docFee[msg.sender]);
    }


    address[] pat;
    string[][] da;

    function allPatient() public returns(address[] memory, string[][] memory){
        // msg.sender is doctor
        address[] memory p;
        pat = p;
        string[][] memory s;
        da = s;
        for(uint i = 0; i < docPatientList[msg.sender].length; i++){
            pat.push(docPatientList[msg.sender][i]);
            da.push(docData[msg.sender][docPatientList[msg.sender][i]]);
        }
        return(pat, da);
    }

}