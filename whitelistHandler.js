const db = require('./db');

async function verificarWhitelist(userIdInformado) {
  try {
    const connection = await db.getConnection();
    if (!connection) throw new Error('`Não foi possível conectar ao banco de dados.`');

    // Buscar usuário direto pelo ID informado
    const [users] = await connection.execute(
      'SELECT whitelisted FROM id_users WHERE id = ?',
      [userIdInformado]
    );

    if (users.length === 0) {
      connection.release();
      return { success: false, message: '`Usuário não encontrado na tabela de whitelist.`' };
    }

    if (users[0].whitelist === 1) {
      connection.release();
      return { success: false, message: '`Você já possui whitelist.`' };
    }

    // Atualizar whitelist
    await connection.execute(
      'UPDATE id_users SET whitelisted = 1 WHERE id = ?',
      [userIdInformado]
    );

    connection.release();
    return { success: true, message: '`Whitelist liberada com sucesso!`' };
 
  } catch (error) {
    console.error('Erro ao verificar whitelist:', error);
    return { success: false, message: '`Erro interno ao verificar whitelist.`' };
  }
}

module.exports = { verificarWhitelist };
