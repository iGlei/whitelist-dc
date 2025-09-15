## Whitelist Bot (Discord + MySQL)

Bot de Discord para gerenciar whitelist via modal e atualizar o banco MySQL.

### Requisitos
- Node.js 18+
- MySQL 5.7+ ou MariaDB compatível

### Instalação
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure as variáveis de ambiente criando um arquivo `.env` na raiz (veja a seção Configuração).

### Configuração (.env)
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
# Discord Bot
TOKEN=
CHANNEL_ID=
GUILD_ID=
ROLE_WHITELISTED=
ROLE_NO_WHITELIST=

# MySQL
DB_HOST=localhost
DB_USER=
DB_PASSWORD=
DB_DATABASE=
```

Descrição rápida das variáveis:
- **TOKEN**: token do bot do Discord.
- **CHANNEL_ID**: ID do canal onde a mensagem com o botão será publicada.
- **GUILD_ID**: ID do servidor (guild) do Discord.
- **ROLE_WHITELISTED**: ID da role atribuída quando aprovado.
- **ROLE_NO_WHITELIST**: ID da role removida quando aprovado.
- **DB_HOST/DB_USER/DB_PASSWORD/DB_DATABASE**: credenciais de acesso ao MySQL.

### Execução
Inicie o bot:
```bash
node bot.js
```

### Notas
- O arquivo `package.json` aponta `main` como `index.js`, mas a entrada do projeto é `bot.js`. Isso não afeta a execução via `node bot.js`.
- Certifique-se de que exista a tabela `id_users` com as colunas `id` (número) e `whitelisted` (0/1).


