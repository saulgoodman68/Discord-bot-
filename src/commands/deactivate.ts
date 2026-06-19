import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  GuildMember,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("الغاء_تفعيل")
  .setDescription("يزيل جميع الرتب من العضو ويمنحه رتبة غير مفعل❌ فقط")
  .addUserOption((option) =>
    option.setName("العضو").setDescription("العضو المراد إلغاء تفعيله").setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

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
  const botMember = guild.members.me;
  if (!botMember) { await interaction.editReply("❌ تعذّر الوصول إلى صلاحيات البوت."); return; }
  if (executor.roles.highest.position <= member.roles.highest.position) {
    await interaction.editReply("❌ رتبتك ليست أعلى من رتبة هذا العضو."); return;
  }
  if (member.roles.highest.position >= botMember.roles.highest.position) {
    await interaction.editReply("❌ رتبة البوت أدنى من رتبة هذا العضو."); return;
  }
  const inactiveRole = guild.roles.cache.find((r) => r.name === "غير مفعل❌");
  if (!inactiveRole) {
    await interaction.editReply('❌ لم يتم العثور على رتبة **"غير مفعل❌"** في السيرفر.'); return;
  }
  const rolesToRemove = member.roles.cache.filter(
    (r) => r.id !== guild.roles.everyone.id && r.id !== inactiveRole.id
  );
  try {
    await member.roles.remove(rolesToRemove, `إلغاء التفعيل بواسطة ${interaction.user.tag}`);
    await member.roles.add(inactiveRole, `إلغاء التفعيل بواسطة ${interaction.user.tag}`);
    await interaction.editReply(
      `✅ ت
