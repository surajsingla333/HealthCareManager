var HealthToken = artifacts.require("./HealthToken.sol");
var HealthCare = artifacts.require("./HealthCare.sol");

module.exports = function(deployer) {
  deployer.deploy(HealthToken).then(function(){
    return deployer.deploy(HealthCare, HealthToken.address);
  })
};
