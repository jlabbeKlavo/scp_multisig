import { CreateGroupInput, CreateContractInput, AddUserInput, RemoveUserInput} from "./multisig/inputs/types";
import { Group } from "./multisig/group";
import { Users } from "./multisig/users";
import { Contract } from "./multisig/contract";
import { emit, revert } from "./klave/types";
import { Context } from "@klave/sdk";
import { Groups } from "./multisig/groups";

/**
 * @transaction add a user to the group
 * @param input containing the following fields:
 * - userId: string
 * - role: string, "admin" or "user"
 * @returns success boolean
 */
export function addUser(input: AddUserInput): void {
    let users = Users.load();    
    if (users.addUser(Context.get('sender'), input.role)) {
        users.save();
    }
}

/**
 * @transaction remove a user from the group
 * @param input containing the following fields:
 * - userId: string
 * @returns success boolean
 */
export function removeUser(input: RemoveUserInput): void {
    let users = Users.load();
    if (users.removeUser(Context.get('sender'))) {
        users.save();
    }
}

/**
 * @query 
 */
export function listUsers(input: string): void {
    let users = Users.load();
    users.list();
}

/**
 * @transaction initialize the group
 * @param input containing the following fields:
 * - name: string
 * - users: string[]
 */
export function createGroup(input: CreateGroupInput): void {
    let groups = Groups.load();
    if (groups.addGroup(input.groupId, input.users)) {
        groups.save();
    }
}

/**
 * @query 
 */
export function listGroups(input: string): void {
    let groups = Groups.load();
    groups.list();
}

/**
 * @query 
 */
export function listGroupUsers(groupId: string): void {
    let group = Group.load(groupId);
    if (!group) {
        revert(`Group ${groupId} does not exist. Create it first.`);
        return;
    }
    group.listUsers();
}

/**
 * @query 
 */
export function listGroupContracts(groupId: string): void {
    let group = Group.load(groupId);
    if (!group) {
        revert(`Group ${groupId} does not exist. Create it first.`);
        return;
    }
    group.listContracts();
}

/**
 * @transaction initialize the contract
 * @param input containing the following fields:
 * - name: string
 * - group: string
 * - threshold: number
 * - description: string
 */
export function createContract(input: CreateContractInput): void {
    let existingContract = Contract.load(input.contractId);
    if (existingContract) {
        revert(`Contract ${input.contractId} does already exists.`);
        return;
    }
    
    let group = Group.load(input.groupId);
    if (!group) {
        revert(`Group ${input.groupId} does not exist. Create it first.`);
        return;
    }

    let contract = new Contract(input.contractId, input.groupId, input.threshold, input.description);
    contract.save();

    group.addContract(contract.id);
    group.save();
}

/**
 * @transaction sign the contract
 * @param input containing the following fields:
 * - name: string
 */
export function approveContract(contract_name: string): void {
    let existingContract = Contract.load(contract_name);
    if (!existingContract) {
        revert(`Contract shall be created first.`);
        return;
    }
    existingContract.approve();
    existingContract.save();
}

/**
 * @query check if all parties have signed the contract
 * @param input containing the following fields:
 * - name: string
 */
export function verifyContract(contract_name: string): void {
    let existingContract = Contract.load(contract_name);
    if (!existingContract) {
        revert(`Contract shall be created first.`);
        return;
    }
    if (existingContract.ready()) {
        emit("Contract has been confirmed successfully by " + existingContract.confirmed().toString() + " users.");
    }
    else {
        let missing = existingContract.threshold - existingContract.confirmed();
        revert("Contract is missing " + missing.toString() + " confirmations");
    }    
}
