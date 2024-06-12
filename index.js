const { deploySCP_MultiSig, testSCP_MultiSig } = require('./tests/scp_multisig/test_suite');

const deployApp = true;
const doNotDeployApp = false;

const runTests = async () => {
  // await deploySCP_MultiSig();
  await testSCP_MultiSig();


};

runTests();
