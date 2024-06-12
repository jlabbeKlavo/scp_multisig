import { Ledger, Crypto, JSON, Context } from '@klave/sdk'
import { emit, revert } from "../klave/types"
import { encode as b64encode } from 'as-base64/assembly';
import { convertToUint8Array } from "../klave/helpers";
import { Group } from './group';

const ContractsTable = "ContractsTable";

@JSON
export class Contract {
    id: string;
    group: string;
    threshold: number;
    description: string;        
    owner: string;

    confirmed_users: Array<string>;

    constructor(id: string, group: string, threshold: number, description: string) {
        if (id.length > 0 ) {
            this.id = id;
        }
        else {
            this.id = b64encode(convertToUint8Array(Crypto.getRandomValues(64)));
        }
        this.group = group;
        this.threshold = threshold;
        this.description = description;        
        this.owner = Context.get('sender');
        this.confirmed_users = new Array<string>(); 
    }

    static load(contractId: string) : Contract | null {
        let contractTable = Ledger.getTable(ContractsTable).get(contractId);
        if (contractTable.length == 0) {
            // revert("Contract does not exists. Create it first");
            return null;
        }
        let contract = JSON.parse<Contract>(contractTable);
        // emit(`Contract loaded successfully: '${contract.id}'`);
        return contract;
    }

    save(): void {
        let contractTable = JSON.stringify<Contract>(this);
        Ledger.getTable(ContractsTable).set(this.id, contractTable);
        emit(`Contract saved successfully: ${this.id}`);
    }

    create(description: string, type: string): boolean {
        
        this.description = description;
        this.owner = Context.get('sender');
        return true;
    }

    delete(): void {
        Ledger.getTable(ContractsTable).unset(this.id);
        emit(`Contract deleted successfully: ${this.id}`);
    }

    approve(): boolean {        
        let sender = Context.get('sender');
        if (this.confirmed_users.includes(sender)) {
            revert("This user already confirmed the contract");            
            return false;
        }
        let group = Group.load(this.group);
        if (!group) {
            revert("This group does not exist");
            return false;
        }
        if (!group.includes(sender)) {
            revert(sender + " does not belong to group " + this.group);
            return false;
        }
        this.confirmed_users.push(sender);
        emit(sender + " successfully approved the contract " + this.id);
        return true;
    }

    ready(): boolean {
        if (this.confirmed_users.length >= this.threshold) {
            return true;
        }
        return false;
    }

    confirmed(): number {
        return this.confirmed_users.length;
    }

}