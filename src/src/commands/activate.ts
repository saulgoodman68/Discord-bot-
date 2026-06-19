import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  GuildMember,
  Role,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("تفعيل")
  .setDescription("يزيل رتبة غير مفعل❌ ويمنح العضو رتبة مفعل ✅ والرتب الأساسية")
  .addUserOption((option) =>
    option.setName("العضو").setDescription("العضو المراد تفعيله").setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

const ROLES_TO_GRANT = [
  "مفعل ✅",
  "5-15",
  "𝐀𝐀𝐑𝐅 | 🪖 المشاة",
  "جندي↬⎰𝐀𝐀𝐑𝐅",
];

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: false });
  const guild = interaction.guild;
  if (!guild) { await interaction.editReply("❌ هذا الأمر يعمل داخل السيرفر فقط."); return; }
  const executor = interaction.member as GuildMember;
  if (!executor.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await interaction.editReply("❌ لا تملك صلاحية **إدارة الأدوار**."); return;
  }
  const targetUser = interaction.options.getUser("العضو", true);
  const member = await guild.members.fetch(targetUser.id).catch(() => null);
  if (!member) { await interaction.editReply("❌ تعذّر العثور على العضو."); return; }
  if (executor.roles.highest.position <= member.roles.highest.position) {
    await interaction.editReply("❌ رتبتك ليست أعلى من رتبة هذا العضو."); return;
  }
  const activeRole = guild.roles.cache.find((r) => r.name === "مفعل ✅");
  const inactiveRole = guild.roles.cache.find((r) => r.name === "غير مفعل❌");
  if (!activeRole) {
    await interaction.editReply('❌ لم يتم العثور على رتبة **"مفعل ✅"** في السيرفر.'); return;
  }
  if (member.roles.cache.has(activeRole.id)) {
    await interaction.editReply(`ℹ️ ${member} **مفعّل بالفعل**.`); return;
  }
  const missingRoles: string[] = [];
  const rolesToAdd = ROLES_TO_GRANT.map((name) => {
    const role = guild.roles.cache.find((r) => r.name === name);
    if (!role) missingRoles.push(name);
    return role;
  }).filter(Boolean) as Role[];
  try {
    if (inactiveRole && member.roles.cache.has(inactiveRole.id)) {
      await member.roles.remove(inactiveRole, `تفعيل بواسطة ${interaction.user.tag}`);
    }
    await member.roles.add(rolesToAdd, `تفعيل بواسطة ${interaction.user.tag}`);
    const grantedList = rolesToAdd.map((r) => `**${r.name}**`).join("، ");
    const warningLine = missingRoles.length > 0
      ? `\n⚠️ رتب غير موجودة: ${missingRoles.map((n) => `**${n}**`).join("، ")}` : "";
    await interaction.editReply(
      `✅ تم تفعيل ${member} بنجاح.\n` +
      `🎖️ الرتب الممنوحة: ${grantedList}\n` +
      `👮 نُفِّذ بواسطة: ${executor}` + warningLine
    );
  } catch {
    await interaction.editReply("❌ حدث خطأ. تأكد من صلاحيات البوت.");
  }
  }
