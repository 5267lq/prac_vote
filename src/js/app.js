App={
    web3Provider:null,
    contracts:{},
    account:"0x0",//显示当前账户地址
    hasVoted:false,

    init:async function(){
        return await App.initWeb3();
    },
    initWeb3:async function(){
        if(window.ethereum){
            App.web3Provider=window.ethereum;
            try{
                await window.ethereum.enable();
            }catch(error){
                console.error("User denied account access.");
            }
        }
        else if(window.web3){
            App.web3Provider=window.web3.currentProvider;
        }
        else{
            App.web3Provider=new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3=new Web3(App.web3Provider);
        return App.initContract();
    },
    initContract:function(){
        $.getJSON('Election.json',function(election){
            App.contracts.Election=TruffleContract(election);
            App.contracts.Election.setProvider(App.web3Provider);
            return App.render();
        });
    },
    render:function(){
        var electionInstance;

        var loader=$('loader');
        var content=$('content');
        loader.show();
        content.hide();

        web3.eth.getCoinbase(function(err,account){
            if(err===null){
                App.account=account;
                $("#accountAddress").html("Your account: "+account);
            }
        });

        App.contracts.Election.deployed().then(function(instance){
            electionInstance=instance;
            return electionInstance.candidatesCount();
        }).then(function(candidatesCount){
            var candidatesResult=$('#candidatesResult');
            candidatesResult.empty();
            var candidateSelect=$('#candidateSelect');
            candidateSelect.empty();
            for(var i=1;i<=candidatesCount;i++){
                electionInstance.Candidates(i).then(function(candidate){
                    var id=candidate[0];
                    var name=candidate[1];
                    var voteCount=candidate[2];
                    var candidateTemplate="<tr><th>"+id+"</th><td>"+name+"</td><td>"+voteCount+"</td></tr>";
                    candidatesResult.append(candidateTemplate);
                    var candidateOption="<option value='"+id+"'>"+name+"</option>";
                    candidateSelect.append(candidateOption);
                });
            }
            return electionInstance.Voters(App.account);
        }).then(function(hasVoted){
            if(hasVoted){
                $("form").hide();
            }
            loader.hide();
            content.show();
        }).catch(function(err){
            console.warn(err);
        });
    },

    castVote:function(){
        var candidateId=$("#candidateSelect").val();
        //console.log(candidateId);
        App.contracts.Election.deployed().then(function(instance){
            return instance.vote(candidateId,{from:App.account});
        }).then(function(result){
            $("#loader").show();
            $("#content").hide();
        }).catch(function(err){
            console.error(err);
        });
    }

},

$(function(){
    $(window).load(function(){
        App.init();
    });
});
