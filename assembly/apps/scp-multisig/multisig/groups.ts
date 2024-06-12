import { Ledger, JSON, Context } from "@klave/sdk";
import { emit, revert } from "../klave/types";
import { Group } from "./group";

const GroupsTable = "GroupsTable";

/**
 * An Groups is associated with a list of groups and holds groups.
 */
@JSON
export class Groups {
    groups: Array<string>;

    constructor() {
        this.groups = new Array<string>();
    }

    /**
     * load the groups from the ledger.
     * @returns true if the groups was loaded successfully, false otherwise.
     */
    static load(): Groups {
        let groupsTable = Ledger.getTable(GroupsTable).get("ALL");
        if (groupsTable.length == 0) {            
            // emit(`New Groups Table created successfully`);
            return new Groups;
        }
        let wlt = JSON.parse<Groups>(groupsTable);
        // emit(`Groups loaded successfully: ${groupsTable}`);
        return wlt;
    }

    /**
     * save the groups to the ledger.
     */
    save(): void {
        let groupsTable = JSON.stringify<Groups>(this);
        Ledger.getTable(GroupsTable).set("ALL", groupsTable);
        // emit(`Groups saved successfully: ${groupsTable}`);
    }

    /**
     * Add a group to the list of groups.
     * @param groupId The id of the group to add.
     * @param role The role of the group to add.
     */
    addGroup(groupId: string, participants: Array<string>): boolean {
        let existingGroup = Group.load(groupId);
        if (existingGroup) {
            revert(`Group already exists: ${groupId}`);
            return false;
        }
        let group = new Group(groupId, participants);        
        group.save();
        this.groups.push(group.id);
        emit(`Group added successfully: ${group.id} `);
        return true;
    }

    /**
     * Remove a group from the list of groups.
     * @param groupId The id of the group to remove.
     */
    removeGroup(groupId: string): boolean {
        let group = Group.load(groupId);
        if (!group) {
            revert("Group not found: " + groupId);
            return false;
        }
        group.delete();

        let index = this.groups.indexOf(groupId);
        this.groups.splice(index, 1);
        emit("Group removed successfully: " + groupId);
        return true;
    }

    /**
     * list all the groups in the groups.
     * @returns
     */
    list(): void {
        let groups: string = "";
        for (let i = 0; i < this.groups.length; i++) {
            let group = this.groups[i];
            if (groups.length > 0) {
                groups += ", ";
            }
            groups += group;
        }
        if (groups.length == 0) {
            emit(`No group found in the list of groups`);
        }
        emit(`Groups available: ${groups}`);
    }

}