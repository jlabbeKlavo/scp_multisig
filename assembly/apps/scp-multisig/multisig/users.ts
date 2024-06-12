import { Ledger, JSON, Context } from "@klave/sdk";
import { emit, revert } from "../klave/types";
import { User } from "./user";

const UsersTable = "UsersTable";

/**
 * An Users is associated with a list of users and holds users.
 */
@JSON
export class Users {
    users: Array<string>;

    constructor() {
        this.users = new Array<string>();
    }

    /**
     * load the users from the ledger.
     * @returns true if the users was loaded successfully, false otherwise.
     */
    static load(): Users {
        let usersTable = Ledger.getTable(UsersTable).get("ALL");
        if (usersTable.length == 0) {            
            // emit(`New Users Table created successfully`);
            return new Users;
        }
        let wlt = JSON.parse<Users>(usersTable);
        // emit(`Users loaded successfully: ${usersTable}`);
        return wlt;
    }

    /**
     * save the users to the ledger.
     */
    save(): void {
        let usersTable = JSON.stringify<Users>(this);
        Ledger.getTable(UsersTable).set("ALL", usersTable);
        // emit(`Users saved successfully: ${usersTable}`);
    }

    /**
     * Add a user to the list of users.
     * @param userId The id of the user to add.
     * @param role The role of the user to add.
     */
    addUser(userId: string, role: string): boolean {
        let existingUser = User.load(userId);
        if (existingUser) {
            revert(`User already exists: ${userId}`);
            return false;
        }
        let user = new User(userId, role);
        user.save();
        this.users.push(userId);
        emit(`User added successfully with role ${role}: ${userId} `);
        return true;
    }

    /**
     * Remove a user from the list of users.
     * @param userId The id of the user to remove.
     */
    removeUser(userId: string): boolean {
        let user = User.load(userId);
        if (!user) {
            revert("User not found: " + userId);
            return false;
        }
        user.delete();

        let index = this.users.indexOf(userId);
        this.users.splice(index, 1);
        emit("User removed successfully: " + userId);
        return true;
    }

    /**
     * list all the users in the users.
     * @returns
     */
    list(): void {
        let users: string = "";
        for (let i = 0; i < this.users.length; i++) {
            let user = this.users[i];
            if (users.length > 0) {
                users += ", ";
            }
            users += user;
        }
        if (users.length == 0) {
            emit(`No user found in the list of users`);
        }
        emit(`Users available: ${users}`);
    }

}