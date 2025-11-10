
const { MessageUtils } = require('../../utils');
const log = require('../../logger/logs');
const color = require('../../logger/color');

function getAttachmentInfo(message) {
  const msg = message.message;
  const attachments = [];
  
  // Guard against undefined message (for group events)
  if (!msg) return attachments;
  
  if (msg.imageMessage) {
    attachments.push({
      type: 'image',
      mimetype: msg.imageMessage.mimetype,
      caption: msg.imageMessage.caption || ''
    });
  }
  
  if (msg.videoMessage) {
    attachments.push({
      type: 'video',
      mimetype: msg.videoMessage.mimetype,
      caption: msg.videoMessage.caption || ''
    });
  }
  
  if (msg.audioMessage) {
    attachments.push({
      type: 'audio',
      mimetype: msg.audioMessage.mimetype
    });
  }
  
  if (msg.documentMessage) {
    attachments.push({
      type: 'document',
      mimetype: msg.documentMessage.mimetype,
      fileName: msg.documentMessage.fileName
    });
  }
  
  if (msg.stickerMessage) {
    attachments.push({
      type: 'sticker',
      mimetype: msg.stickerMessage.mimetype
    });
  }
  
  return attachments;
}

function getReplyInfo(message, sock) {
  const contextInfo = message.message?.extendedTextMessage?.contextInfo;
  if (!contextInfo || !contextInfo.quotedMessage) return null;
  
  const quotedMsg = contextInfo.quotedMessage;
  const attachments = [];
  
  if (quotedMsg.imageMessage) {
    attachments.push({ 
      type: 'image', 
      caption: quotedMsg.imageMessage.caption || '',
      mimetype: quotedMsg.imageMessage.mimetype
    });
  }
  if (quotedMsg.videoMessage) {
    attachments.push({ 
      type: 'video', 
      caption: quotedMsg.videoMessage.caption || '',
      mimetype: quotedMsg.videoMessage.mimetype
    });
  }
  if (quotedMsg.audioMessage) {
    attachments.push({ 
      type: 'audio',
      mimetype: quotedMsg.audioMessage.mimetype
    });
  }
  if (quotedMsg.documentMessage) {
    attachments.push({ 
      type: 'document', 
      fileName: quotedMsg.documentMessage.fileName,
      mimetype: quotedMsg.documentMessage.mimetype
    });
  }
  
  // Determine if the quoted message is from the bot
  let isFromBot = false;
  
  // First try: Check if Baileys provided the original key with fromMe
  if (contextInfo.fromMe !== undefined) {
    isFromBot = contextInfo.fromMe;
  }
  // Second try: Check our tracked bot message IDs
  else if (global.ST && global.ST.botMessageIds && contextInfo.stanzaId) {
    isFromBot = global.ST.botMessageIds.has(contextInfo.stanzaId);
  }
  // Third try: Check if sock.user is available for comparison (for groups)
  else if (sock && sock.user && contextInfo.participant) {
    // Normalize bot number and participant: remove device suffix and domain
    const botId = sock.user.id.split('@')[0].split(':')[0];
    const participantId = contextInfo.participant.split('@')[0].split(':')[0];
    isFromBot = participantId === botId;
  }
  
  return {
    messageID: contextInfo.stanzaId,
    senderID: contextInfo.participant?.split('@')[0].replace('@lid', ''),
    body: quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || quotedMsg.imageMessage?.caption || quotedMsg.videoMessage?.caption || '',
    attachments: attachments,
    key: {
      remoteJid: message.key.remoteJid,
      id: contextInfo.stanzaId,
      participant: contextInfo.participant,
      fromMe: isFromBot
    }
  };
}

async function handleMessages(sock, msg, commands, events, config) {
  try {
    if (!msg.messages || msg.messages.length === 0) return;
    
    const message = msg.messages[0];
    
    if (message.key.fromMe) return;
    
    // Allow messages with messageStubType (group events) to pass through
    const isGroupEvent = message.messageStubType !== undefined;
    if (!message.message && !isGroupEvent) return;
    
    const messageContent = message.message?.conversation || 
                          message.message?.extendedTextMessage?.text || 
                          message.message?.imageMessage?.caption ||
                          message.message?.videoMessage?.caption || '';
    
    const isGroup = message.key.remoteJid.endsWith('@g.us');
    const senderJid = message.key.remoteJid;
    const senderNumber = message.key.participant || message.key.remoteJid;
    const senderId = senderNumber.replace('@s.whatsapp.net', '').replace('@g.us', '');
    
    const activeSock = global.ST?.sock || sock;
    const utils = new MessageUtils(activeSock, message);
    
    const attachments = getAttachmentInfo(message);
    const messageReply = getReplyInfo(message, activeSock);
    
    const event = {
      body: messageContent,
      senderID: senderId,
      threadID: senderJid,
      messageID: message.key.id,
      isGroup: isGroup,
      key: message.key,
      message: message,
      attachments: attachments,
      messageReply: messageReply
    };
    
    const api = {
      sendMessage: (jid, content) => activeSock.sendMessage(jid, content),
      getProfilePicture: async (jid) => {
        try {
          return await activeSock.profilePictureUrl(jid, 'image');
        } catch {
          return null;
        }
      }
    };
    
    const db = global.ST?.db;
    if (db) {
      try {
        if (!isGroup) {
          let dmUser = await db.getDmUser(senderId);
          
          if (!dmUser) {
            const userName = message.pushName || senderId;
            let pfpUrl = '';
            try {
              pfpUrl = await activeSock.profilePictureUrl(senderNumber, 'image');
            } catch {}
            
            dmUser = await db.setDmUser(senderId, {
              phoneNumber: senderId,
              name: userName,
              pfp: pfpUrl,
              totalMsg: 0
            });
          } else {
            const updates = {};
            let needsUpdate = false;
            
            if (message.pushName && message.pushName !== dmUser.name) {
              updates.name = message.pushName;
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              dmUser = await db.updateDmUser(senderId, updates);
            }
          }
          
          await db.incrementDmUserMsg(senderId);
        }
        
        if (isGroup) {
          let thread = await db.getThread(senderJid);
          
          if (!thread) {
            try {
              const groupMetadata = await activeSock.groupMetadata(senderJid);
              let groupPfp = '';
              try {
                groupPfp = await activeSock.profilePictureUrl(senderJid, 'image');
              } catch {}
              
              const members = {};
              let serialCounter = 0;
              for (const participant of groupMetadata.participants) {
                const uid = participant.id.split('@')[0];
                serialCounter++;
                members[uid] = {
                  uid: uid,
                  serialNumber: serialCounter,
                  name: '',
                  pfp: '',
                  role: participant.admin ? (participant.admin === 'superadmin' ? 'superadmin' : 'admin') : 'member',
                  joinedAt: Date.now(),
                  totalMsg: 0
                };
              }
              
              const admins = groupMetadata.participants
                .filter(p => p.admin)
                .map(p => p.id.split('@')[0]);
              
              thread = await db.setThread(senderJid, {
                tid: senderJid,
                name: groupMetadata.subject,
                pfp: groupPfp,
                totalUsers: groupMetadata.participants.length,
                totalMsg: 0,
                admins: admins,
                members: members,
                serialCounter: serialCounter
              });
            } catch (error) {
              log.error('Error fetching group metadata:', error.message);
            }
          }
          
          let memberData = thread.members?.[senderId];
          if (!memberData) {
            let memberPfp = '';
            try {
              memberPfp = await activeSock.profilePictureUrl(senderNumber, 'image');
            } catch {}
            
            memberData = await db.addMemberToThread(senderJid, senderId, {
              name: message.pushName || senderId,
              pfp: memberPfp,
              role: 'member'
            });
          }
          
          await db.incrementThreadMsg(senderJid);
          await db.incrementMemberMsg(senderJid, senderId);
        }
      } catch (error) {
        log.error('Database error in message handler:', error.message);
      }
    }
    
    if (isGroup && db) {
      const member = await db.getMember(event.threadID, senderId);
      if (member && member.ban) {
        try {
          const groupMetadata = await activeSock.groupMetadata(event.threadID);
          const botNumber = activeSock.user.id.split(':')[0];
          const isAdmin = groupMetadata.participants.find(
            p => p.id === `${botNumber}@s.whatsapp.net` && (p.admin === 'admin' || p.admin === 'superadmin')
          );
          
          if (isAdmin) {
            const targetJid = senderId.includes('@') ? senderId : `${senderId}@s.whatsapp.net`;
            await activeSock.groupParticipantsUpdate(event.threadID, [targetJid], 'remove');
            return;
          }
        } catch (error) {
          log.error('Error auto-kicking banned user:', error.message);
        }
      }
    }
    
    for (const eventScript of events) {
      try {
        const stFunc = eventScript.ST || eventScript.st;
        if (!stFunc) {
          log.warn(`Event ${eventScript.config.name} missing 'ST' or 'st' function, skipping...`);
          continue;
        }
        
        const listenType = eventScript.config.listenType || 'both';
        
        if (listenType === 'group' && !isGroup) continue;
        if (listenType === 'dm' && isGroup) continue;
        
        await stFunc({ event, message: utils, api, sock: activeSock });
      } catch (error) {
        log.error(`Event ${eventScript.config.name} error:`, error.message);
      }
    }
    
    const dmAdmins = Array.isArray(config.dmAdmin) ? config.dmAdmin.map(id => id.toString()) : [];
    const gcAdminUids = Array.isArray(config.gcAdminUid) ? config.gcAdminUid.map(id => id.toString()) : [];
    
    const normalizedSenderId = senderId;
    const normalizedSenderIdClean = senderId.replace('@lid', '');
    
    if (config.onlyAdminMode) {
      if (isGroup && !gcAdminUids.includes(normalizedSenderId) && !gcAdminUids.includes(normalizedSenderIdClean)) {
        return;
      } else if (!isGroup && !dmAdmins.includes(normalizedSenderIdClean)) {
        return;
      }
    }
    
    // Get custom prefix from database
    let customPrefix = config.prefix;
    if (db) {
      try {
        if (isGroup) {
          const thread = await db.getThread(senderJid);
          if (thread?.prefix) {
            customPrefix = thread.prefix;
          }
        } else {
          const dmUser = await db.getDmUser(senderId);
          if (dmUser?.prefix) {
            customPrefix = dmUser.prefix;
          }
        }
      } catch (err) {
        // Use default prefix if database error
      }
    }
    
    // Check if message has prefix for command processing
    const hasPrefix = messageContent.startsWith(customPrefix);
    
    // Check for onReply FIRST before processing commands
    if (message.message && message.message.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quotedMsgId = message.message.extendedTextMessage.contextInfo.stanzaId;
      const replyInfo = getReplyInfo(message, activeSock);
      
      // Only process if replying to bot's message
      if (replyInfo && replyInfo.key && replyInfo.key.fromMe) {
        if (global.ST.onReply.has(quotedMsgId)) {
          const replyData = global.ST.onReply.get(quotedMsgId);
          const command = commands.get(replyData.commandName);
          
          if (command && command.onReply) {
            try {
              await command.onReply({ 
                message: utils, 
                event, 
                api, 
                Reply: replyData,
                sock: activeSock,
                config 
              });
              return;
            } catch (error) {
              log.error(`Reply handler error for ${replyData.commandName}:`, error.message);
            }
          }
        }
      }
    }
    
    let commandName = '';
    let args = [];
    let commandExecuted = false;

    // Check if message starts with prefix
    if (hasPrefix) {
      const parts = messageContent.slice(customPrefix.length).trim().split(/\s+/);
      commandName = parts[0].toLowerCase();
      args = parts.slice(1);
      
      // Handle prefix-only message (e.g., just "!")
      if (!commandName) {
        return utils.reply(`❌ Command doesn't exist. Use ${customPrefix}help to see all commands list.`);
      }
    } else {
      // No prefix, check for command anyway
      const parts = messageContent.trim().split(/\s+/);
      commandName = parts[0].toLowerCase();
      args = parts.slice(1);
      
      // Special case: "prefix" word without prefix
      if (commandName === 'prefix' && args.length === 0) {
        return utils.reply(`Your global prefix is ${config.prefix}`);
      }
    }
    
    // Validate command existence
    if (commandName && !commands.has(commandName)) {
      // Only show error if user tried to use prefix
      if (hasPrefix) {
        return utils.reply(`❌ Command "${commandName}" doesn't exist. Use ${customPrefix}help to see all commands list.`);
      }
      // If no prefix was used, don't execute command but allow onChat to run
      commandName = '';
    }
    
    if (commandName && commands.has(commandName)) {
      const command = commands.get(commandName);
      
      const stFunc = command.ST || command.st;
      if (!stFunc) {
        log.error(`Command ${commandName} missing 'ST' or 'st' function!`);
        return utils.reply('❌ This command is not properly configured.');
      }
      
      // Check usePrefix setting
      const commandUsePrefix = command.config.usePrefix !== undefined ? command.config.usePrefix : true;
      const globalPrefixUse = config.prefixUse !== undefined ? config.prefixUse : true;
      
      // Determine if prefix is required for this command
      let prefixRequired = false;
      if (globalPrefixUse && commandUsePrefix) {
        prefixRequired = true; // Both global and command require prefix
      } else if (!globalPrefixUse && commandUsePrefix) {
        prefixRequired = true; // Global is off but command requires prefix
      } else if (globalPrefixUse && !commandUsePrefix) {
        prefixRequired = false; // Global is on but command doesn't require prefix
      } else {
        prefixRequired = false; // Both are off
      }
      
      // If prefix is required but not provided, skip execution
      if (prefixRequired && !hasPrefix) {
        // Don't mark as executed, let onChat handle it
        commandName = '';
      } else {
        const dmAdmins = Array.isArray(config.dmAdmin) ? config.dmAdmin.map(id => id.toString()) : [];
        const gcAdminUids = Array.isArray(config.gcAdminUid) ? config.gcAdminUid.map(id => id.toString()) : [];
        const normalizedSenderId = senderId;
        const normalizedSenderIdClean = senderId.replace('@lid', '');
        
        if (command.config.role === 1) {
          const isAdmin = isGroup 
            ? (gcAdminUids.includes(normalizedSenderId) || gcAdminUids.includes(normalizedSenderIdClean))
            : (dmAdmins.includes(normalizedSenderIdClean));
          if (!isAdmin) {
            return utils.reply('⚠️ This command is only for admins!');
          }
        }
        
        if (command.config.role === 2) {
          const isDmAdmin = dmAdmins.includes(normalizedSenderIdClean) || 
                           dmAdmins.includes(normalizedSenderId);
          const isGcAdmin = gcAdminUids.includes(normalizedSenderIdClean) || 
                           gcAdminUids.includes(normalizedSenderId);
          if (!isDmAdmin && !isGcAdmin) {
            return utils.reply('⚠️ This command is only for the main admin!');
          }
        }
        
        const userName = message.pushName || senderId;
        const location = isGroup ? 'GC' : 'DM';
        
        try {
          await stFunc({ message: utils, event, api, args, sock: activeSock, config, prefix: customPrefix });
          console.log(log.chalk.green('✅') + log.chalk.white(` ${userName}, ${location}, ${commandName}`));
          commandExecuted = true;
        } catch (error) {
          console.log(log.chalk.red('❌') + log.chalk.white(` ${userName}, ${location}, ${commandName} - Error: ${error.message}`));
          await utils.reply(`❌ Error: ${error.message}`);
          commandExecuted = true;
        }
      }
    }
    
    // Only process reaction handlers if we have a regular message (not group events)
    if (message.message) {
      if (message.message.reactionMessage) {
        const reaction = message.message.reactionMessage;
        const reactedMsgId = reaction.key.id;
        
        if (global.ST.onReaction.has(reactedMsgId)) {
          const reactionData = global.ST.onReaction.get(reactedMsgId);
          const command = commands.get(reactionData.commandName);
          
          if (command && command.onReaction) {
            try {
              const reactionEvent = {
                ...event,
                reaction: reaction.text,
                userID: senderId
              };
              
              await command.onReaction({ 
                message: utils, 
                event: reactionEvent, 
                api, 
                Reaction: reactionData,
                sock: activeSock 
              });
            } catch (error) {
              log.error(`Reaction handler error:`, error.message);
            }
          }
        }
      }
    }
    
    // Run onChat handlers ONLY if no command was executed
    if (!commandExecuted) {
      for (const [cmdName, command] of commands) {
        if (command.onChat && typeof command.onChat === 'function') {
          try {
            const result = await command.onChat({ event, message: utils, api, sock: activeSock, config });
            // If onChat returns false, stop processing other onChat handlers
            if (result === false) {
              break;
            }
          } catch (error) {
            log.error(`onChat error in ${cmdName}:`, error.message);
          }
        }
      }
    }
    
  } catch (error) {
    log.error('Message handler error:', error);
  }
}

module.exports = { handleMessages };
