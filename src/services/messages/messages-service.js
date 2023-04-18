const { Op } = require("sequelize");
const { Message } = require("../../db/models");

async function insertMessage(ctx, attributes) {
  const {
    source,
    messageTimestamp,
    chatType,
    chatId,
    senderId,
    isSentByMe,
    messageId,
    replyToMessageId,
    kind,
    body,
    rawSource
  } = attributes;
  ctx.log('insertMessage attributes: ', { attributes });

  // Yair: don't think this makes sense long term, probably has a way to do insert-if-new in one API call.
  const existingMessage = await Message.findOne({
    where: { chatId, messageId }
  });

  if (existingMessage !== null) {
    // TODO options to update?
    return existingMessage;
  }

  const message = await Message.create({
    source,
    messageTimestamp,
    chatType,
    chatId,
    senderId,
    isSentByMe,
    messageId,
    replyToMessageId,
    kind,
    body,
    rawSource
  });

  return message;
}

async function getMessageHistory(ctx, message, options = {}) {
  const { limit = 20 } = options;
  const { chatId, messageTimestamp } = message;
  const messages = await Message.findAll({
    where: { chatId, messageTimestamp: { [Op.lte]: messageTimestamp } },
    limit,
    order: [["createdAt", "DESC"]]
  });
  return messages.reverse();
}

module.exports = {
  insertMessage,
  getMessageHistory
};