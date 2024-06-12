const { klaveDeployApp, klaveTransaction, klaveQuery, klaveCloseConnection, klaveOpenConnection } = require('../../klave_network');
const { base64ToArrayBuffer, getMessageEncoding, arrayBufferToBase64 } = require('../../utils');

//wasm to deploy must be copied post generation coming from yarn build command
const app_id = "test_scp_multisig";
const fqdn = "test_scp_multisig_smart_contract";
const WASM_TEST_SCP_MULTISIG = './config/wasm/scp_multisig.b64';

const deploySCP_MultiSig = async () => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);
  if (user_connected)
  {
    await klaveDeployApp(app_id, fqdn, WASM_TEST_SCP_MULTISIG);
  }
  klaveCloseConnection();
}

const addUser = async (user) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  let userId = "";
  if (user_connected)
  {    
      let addUserInput = {
        "userId": "",
        "role": "admin"
      };
      let addUserResult = await klaveTransaction(fqdn,"addUser", addUserInput);
      userId = addUserResult.message.split(":")[1].trim();
  }
  klaveCloseConnection();
  return userId;
}

const listUsers = async () => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);
  
  if (user_connected)
  {    
      await klaveTransaction(fqdn,"listUsers", "");            
  }
  klaveCloseConnection();  
}

const createGroup = async (user, participants) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  let groupId = "";
  if (user_connected)
  {    
      console.log("Particpants: " + participants);
      let createGroupInput = {
        "groupId": "",
        "users": participants
      };
      let createGroupResult = await klaveTransaction(fqdn,"createGroup", createGroupInput);
      groupId = createGroupResult.message.split(":")[1].trim();      
  }
  klaveCloseConnection();
  return groupId;
}

const listGroups = async () => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);

  if (user_connected)
  {    
      await klaveTransaction(fqdn,"listGroups", "");            
  }
  klaveCloseConnection();    
}

const listGroupUsers = async (groupId) => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);
  
  if (user_connected)
  {    
      await klaveTransaction(fqdn,"listGroupUsers", groupId);            
  }
  klaveCloseConnection();  
}
const createContract = async (user, groupId, threshold, description) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);
  
  let contractId = "";
  if (user_connected)
  {    
      let createContractInput = {
        "contractId": "",
        "groupId": groupId,
        "threshold": threshold,
        "description": description
      };
      let createContractResult = await klaveTransaction(fqdn,"createContract", createContractInput);      
      contractId = createContractResult.message.split(":")[1].trim();      
  }
  klaveCloseConnection();
  return contractId;
}

const listGroupContracts = async (groupId) => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);

  if (user_connected)
  {    
      await klaveTransaction(fqdn,"listGroupContracts", groupId);            
  }
  klaveCloseConnection();    
}

const approveContract = async (user, contractId) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  if (user_connected)
  {    
      let approveResult = await klaveTransaction(fqdn,"approveContract", contractId);      
  }
  klaveCloseConnection();  
}

const verifyContract = async (user, contractId) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  let verified = false;
  if (user_connected)
  {    
      let verifyResult = await klaveTransaction(fqdn,"verifyContract", contractId);      
      console.log(verifyResult);
      verified = verifyResult.success;
  }
  klaveCloseConnection();  
  return verified;
}

const testSCP_MultiSig = async (user) => {
  let klave1UserId = await addUser('klave1');
  let klave2UserId = await addUser('klave2');
  let klave3UserId = await addUser('klave3');
  let klave4UserId = await addUser('klave4');
  let klave5UserId = await addUser('klave5'); 
  
  let result = await listUsers();

  let participantsGA = new Array(klave1UserId, klave2UserId, klave3UserId, klave4UserId, klave5UserId);
  let groupId = await createGroup('klave1', participantsGA);

  result = await listGroups();
  result = await listGroupUsers(groupId);

  let contractId = await createContract('klave1', groupId, participantsGA.length - 2, 
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.");

  result = await listGroupContracts(groupId);

  result = await approveContract('klave1', contractId);
  result = await approveContract('klave2', contractId);

  let verified = await verifyContract('klave1', contractId);
  console.assert(verified === false);

  result = await approveContract('klave3', contractId);

  verified = await verifyContract('klave1', contractId);
  console.assert(verified === true);
}

module.exports = {
    deploySCP_MultiSig,
    testSCP_MultiSig,
}
