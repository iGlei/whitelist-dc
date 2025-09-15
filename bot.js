require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonBuilder,
    ButtonStyle,
    InteractionType,
    EmbedBuilder
} = require('discord.js');
const { verificarWhitelist } = require('./whitelistHandler');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    partials: [Partials.Channel]
});

// Guardar a mensagem do botão para apagar depois
let botMessage;

// Bot online
client.on(Events.ClientReady, async () => {
    console.log(`✅ Bot online como ${client.user.tag}`);

    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    if (!channel) return console.error('❌ Canal não encontrado.');

    // Embed
    const embed = new EmbedBuilder()
        .setAuthor({ 
            name: "📋 Sistema de Whitelist", 
            iconURL: client.guilds.cache.get(process.env.GUILD_ID)?.iconURL(), 
        })
        .setDescription(
            "*Faça a Allowlist para ser liberado em nosso servidor*\n" +
            "*Para iniciar a whitelist clique no botão **📋 Iniciar whitelist***\n\n" +
            "** **\n" +
            " ⏰   Você terá **3 minutos** para responder às perguntas!"
        )
        .setColor("#1d0038")
        .setImage("https://cdn.discordapp.com/attachments/1404869074743197836/1406391894891561000/whitelist.png?ex=68a24c05&is=68a0fa85&hm=7788e1e806b966d274dc28520d51c8d59fadbe9397093d2bcbf6e5f795d3ccca&");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('abrir_modal_whitelist')
            .setLabel('Iniciar whitelist')
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📋")
    );

    botMessage = await channel.send({
        embeds: [embed],
        components: [row]
    });
});

// Interações
client.on(Events.InteractionCreate, async interaction => {

    // Abrir modal
if (interaction.isButton() && interaction.customId === 'abrir_modal_whitelist') {
    const member = await interaction.guild.members.fetch(interaction.user.id);

    // Verificar se já tem a role de whitelist
    if (member.roles.cache.has(process.env.ROLE_WHITELISTED)) {
        return interaction.reply({ 
            content: "`❌ Você já completou a whitelist!`", 
            ephemeral: true 
        });
    } 

    // Se não tiver, abre o modal normalmente
    const modal = new ModalBuilder()
        .setCustomId('modal_whitelist')
        .setTitle('Sistema de Whitelist');

    const inputName = new TextInputBuilder()
        .setCustomId('player_name')
        .setLabel('Digite seu nome completo')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const inputId = new TextInputBuilder()
        .setCustomId('player_id')
        .setLabel('Digite seu ID do servidor (número)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(inputName);
    const row2 = new ActionRowBuilder().addComponents(inputId);

    modal.addComponents(row1, row2);
    await interaction.showModal(modal);
}


    // Receber modal
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'modal_whitelist') {
        const playerName = interaction.fields.getTextInputValue('player_name');
        const playerId = interaction.fields.getTextInputValue('player_id'); // ID do FiveM

        await interaction.deferReply({ ephemeral: true });

        const resultado = await verificarWhitelist(playerId);

        if (resultado.success) {
            try {
                const member = await interaction.guild.members.fetch(interaction.user.id);

                // Alterar nickname
                await member.setNickname(`${playerName} | ${playerId}`).catch(console.error);

                // Alterar roles
                await member.roles.remove(process.env.ROLE_NO_WHITELIST).catch(() => {});
                await member.roles.add(process.env.ROLE_WHITELISTED).catch(() => {});

                // Webhook original pelo nome
                const webhooks = await interaction.guild.fetchWebhooks();
                const approvedWebhook = webhooks.find(w => w.name === "Whitelist-Aprovados");

                if (approvedWebhook) {
                    await approvedWebhook.send({
                        content:                             
                            "```yaml\n" +
                            "✅ Whitelist aprovada!\n" +
                            `👤 Discord: ${interaction.user.tag}\n` +
                            `📛 Nome: ${playerName}\n` +
                            `🆔 ID: ${playerId}\n` +
                            "```"
                    });
                } else {
                    console.warn('Webhook "Whitelist-Aprovados" não encontrado.');
                }

                // Apagar mensagem do botão
                //if (botMessage) {
                //    await botMessage.delete().catch(console.error);
                //}

                // Resposta ephemeral para o usuário
                await interaction.editReply({ content: `✅ ${resultado.message}` });

            } catch (error) {
                console.error('Erro ao aplicar roles/nickname/webhook:', error);
                await interaction.editReply({ content: '❌ Erro interno ao aplicar whitelist. Contate um administrador.' });
            }

        } else {
            await interaction.editReply({ content: `❌ ${resultado.message}` });
        }
    }
});

client.login(process.env.TOKEN);
