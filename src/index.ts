import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ChatInputCommandInteraction,
} from "discord.js";
import * as deactivate from "./commands/deactivate.js";
import * as activate from "./commands/activate.js";

interface Command {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const commands = new Collection<string, Command>();
commands.set(deactivate.data.name, deactivate);
commands.set(activate.data.name, activate);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once(Events.ClientReady, (c) => {
  console.log(`✅ البوت يعمل باسم ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error("خطأ:", err);
    const reply = { content: "❌ حدث خطأ غير متوقع." };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
});

const token = process.env["DISCORD_BOT_TOKEN"];
if (!token) { console.error("❌ DISCORD_BOT_TOKEN غير موجود"); process.exit(1); }

client.login(token);
