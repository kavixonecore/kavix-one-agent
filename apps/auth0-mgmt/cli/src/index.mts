import { createOrgCommand } from "./commands/create-org.mjs";
import { deleteOrgCommand } from "./commands/delete-org.mjs";
import { listOrgsCommand } from "./commands/list-orgs.mjs";
import { addMemberCommand } from "./commands/add-member.mjs";
import { removeMemberCommand } from "./commands/remove-member.mjs";
import { listMembersCommand } from "./commands/list-members.mjs";
import { createRoleCommand } from "./commands/create-role.mjs";
import { assignRoleCommand } from "./commands/assign-role.mjs";
import { listRolesCommand } from "./commands/list-roles.mjs";
import { enableConnectionCommand } from "./commands/enable-connection.mjs";
import { disableConnectionCommand } from "./commands/disable-connection.mjs";
import { listConnectionsCommand } from "./commands/list-connections.mjs";
import { sendInviteCommand } from "./commands/send-invite.mjs";
import { listInvitesCommand } from "./commands/list-invites.mjs";
import { revokeInviteCommand } from "./commands/revoke-invite.mjs";
import { setupSocialCommand } from "./commands/setup-social.mjs";

const COMMANDS: Record<string, (args: string[]) => Promise<void>> = {
  "create-org": createOrgCommand,
  "delete-org": deleteOrgCommand,
  "list-orgs": listOrgsCommand,
  "add-member": addMemberCommand,
  "remove-member": removeMemberCommand,
  "list-members": listMembersCommand,
  "create-role": createRoleCommand,
  "assign-role": assignRoleCommand,
  "list-roles": listRolesCommand,
  "enable-connection": enableConnectionCommand,
  "disable-connection": disableConnectionCommand,
  "list-connections": listConnectionsCommand,
  "send-invite": sendInviteCommand,
  "list-invites": listInvitesCommand,
  "revoke-invite": revokeInviteCommand,
  "setup-social": setupSocialCommand,
};

function printHelp(): void {
  console.log("Auth0 Management CLI\n");
  console.log("Usage: bun src/index.mts <command> [options]\n");
  console.log("Commands:");
  for (const name of Object.keys(COMMANDS)) {
    console.log(`  ${name}`);
  }
  console.log("\nUse --help after a command for details.");
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === "--help") {
    printHelp();
    return;
  }
  const handler = COMMANDS[command];
  if (!handler) {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
  await handler(args);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
