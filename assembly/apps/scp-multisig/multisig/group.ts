import { Ledger, JSON, Crypto } from "@klave/sdk";
import { emit, revert } from "../klave/types"
import { encode as b64encode } from 'as-base64/assembly';
import { convertToUint8Array } from "../klave/helpers";

const GroupsTable = "GroupsTable";

@JSON
export class Group {
    id: string;
    users: Array<string>;
    contracts: Array<string>;

    constructor(id: string, users: Array<string>) {
        if (id.length > 0 ) {
            this.id = id;
        }
        else {
            this.id = b64encode(convertToUint8Array(Crypto.getRandomValues(64)));
        }
        this.users = users;
        this.contracts = new Array<string>();
    }

    static load(groupId: string) : Group | null {
        let groupTable = Ledger.getTable(GroupsTable).get(groupId);
        if (groupTable.length == 0) {
            // revert(`Group ${groupId} does not exists. Create it first`);
            return null;
        }
        let group = JSON.parse<Group>(groupTable);
        // emit(`Group loaded successfully: '${group.id}'`);
        return group;
    }

    save(): void {
        let groupTable = JSON.stringify<Group>(this);
        Ledger.getTable(GroupsTable).set(this.id, groupTable);
        emit(`Group saved successfully: ${this.id}`);
    }

    delete(): void {
        this.id = "";
        this.users.forEach(element => {
            element = "";
        });
        Ledger.getTable(GroupsTable).unset(this.id);
        emit(`User deleted successfully: ${this.id}`);
    }

    includes(user: string): boolean {
        return this.users.includes(user);
    }

    addContract(contractId: string): boolean {
        if (this.contracts.includes(contractId)) {
            revert(`This contract ${contractId} already exists for this group.`)
            return false;
        }
        this.contracts.push(contractId);
        return true;
    }

    listContracts(): void {
        let contracts: string = "";
        for (let i = 0; i < this.contracts.length; i++) {
            let contract = this.contracts[i];
            if (contracts.length > 0) {
                contracts += ", ";
            }
            contracts += contract;
        }
        if (contracts.length == 0) {
            emit(`No contract found in this groups`);
        }
        emit(`Contracts available: ${contracts}`);
    }

    listUsers(): void {
        let users: string = "";
        for (let i = 0; i < this.users.length; i++) {
            let user = this.users[i];
            if (users.length > 0) {
                users += ", ";
            }
            users += user;
        }
        if (users.length == 0) {
            emit(`No user found in this group`);
        }
        emit(`Users available: ${users}`);
    }
}
