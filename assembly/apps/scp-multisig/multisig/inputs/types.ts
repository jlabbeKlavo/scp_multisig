import { JSON } from "@klave/sdk";

@JSON
export class CreateGroupInput {
    groupId: string;
    users: Array<string>;
}

@JSON
export class CreateContractInput {
    contractId: string;
    groupId: string;
    threshold: number;
    description: string;
}

@JSON
export class AddUserInput {
    userId: string;
    role: string;
}

@JSON
export class RemoveUserInput {
    userId: string;
}
