pragma solidity >=0.4.22 <0.9.0;
contract Election{
    struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }
    mapping(uint=>Candidate) public Candidates;
    mapping(address=>bool) public Voters;
    uint public candidatesCount;
    constructor() public{
        addCandidate("liuqi");
        addCandidate("chenmeng");
    }
    function addCandidate(string memory _name) private{
        candidatesCount++;
        Candidates[candidatesCount]=Candidate(candidatesCount,_name,0);
    }
    event voteEvent(uint indexed _candidateId);
    function vote(uint _candidateId) public{
        require(!Voters[msg.sender]);
        require(_candidateId>0&&_candidateId<=candidatesCount);
        Candidates[_candidateId].voteCount++;
        Voters[msg.sender]=true;
        emit voteEvent(_candidateId);
    }
}