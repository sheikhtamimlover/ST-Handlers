const axios = require('axios');
const baseApiUrl = async () => "https://www.noobs-api.rf.gd/dipto";

module.exports.config = {
    name: "bby",
    aliases: ["baby", "bbe", "babe"],
    version: "6.9.0",
    author: "dipto",
    countDown: 0,
    role: 0,
    description: "better then all sim simi",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR \nall OR\nedit [YourMessage] - [NeeMessage]"
    }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    const link = `${await baseApiUrl()}/baby`;
    const dipto = args.join(" ").toLowerCase();
    const uid = event.senderID;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
            return await api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID);
        }

        if (args[0] === 'remove') {
            const fina = dipto.replace("remove ", "");
            const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
            return await api.sendMessage(dat, event.threadID);
        }

        if (args[0] === 'rm' && dipto.includes('-')) {
            const [fi, f] = dipto.replace("rm ", "").split(' - ');
            const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
            return await api.sendMessage(da, event.threadID);
        }

        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const data = (await axios.get(`${link}?list=all`)).data;
                const teachers = await Promise.all(data.teacher.teacherList.map(async (item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    const name = (await usersData.get(number)).name;
                    return { name, value };
                }));
                teachers.sort((a, b) => b.value - a.value);
                const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                return await api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID);
            } else {
                const d = (await axios.get(`${link}?list=all`)).data.length;
                return await api.sendMessage(`Total Teach = ${d}`, event.threadID);
            }
        }

        if (args[0] === 'msg') {
            const fuk = dipto.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
            return await api.sendMessage(`Message ${fuk} = ${d}`, event.threadID);
        }

        if (args[0] === 'edit') {
            const command = dipto.split(' - ')[1];
            if (!command || command.length < 2) return await api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]', event.threadID);
            const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
            return await api.sendMessage(`changed ${dA}`, event.threadID);
        }

        if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
            const [comd, command] = dipto.split(' - ');
            const final = comd.replace("teach ", "");
            if (!command || command.length < 2) return await api.sendMessage('❌ | Invalid format!', event.threadID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}`);
            const tex = re.data.message;
            const teacher = (await usersData.get(re.data.teacher)).name;
            return await api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacher}\nTeachs: ${re.data.teachs}`, event.threadID);
        }

        if (args[0] === 'teach' && args[1] === 'amar') {
            const [comd, command] = dipto.split(' - ');
            const final = comd.replace("teach ", "");
            if (!command || command.length < 2) return await api.sendMessage('❌ | Invalid format!', event.threadID);
            const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
            return await api.sendMessage(`✅ Replies added ${tex}`, event.threadID);
        }

        if (args[0] === 'teach' && args[1] === 'react') {
            const [comd, command] = dipto.split(' - ');
            const final = comd.replace("teach react ", "");
            if (!command || command.length < 2) return await api.sendMessage('❌ | Invalid format!', event.threadID);
            const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
            return await api.sendMessage(`✅ Replies added ${tex}`, event.threadID);
        }

        if (dipto.includes('amar name ki') || dipto.includes('amr nam ki') || dipto.includes('amar nam ki') || dipto.includes('amr name ki') || dipto.includes('whats my name')) {
            const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
            return await api.sendMessage(data, event.threadID);
        }

        const d = (await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=1`)).data.reply;
        const info = await api.sendMessage(d, event.threadID);
        if (info) {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                type: "reply",
                messageID: info.messageID,
                author: uid,
                d,
                apiUrl: link
            });
        }

    } catch (e) {
        console.log(e);
        await api.sendMessage("Check console for error", event.threadID);
    }
};

module.exports.onReply = async ({ api, event }) => {
    try {
        if (event.type === "message_reply") {
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
            const info = await api.sendMessage(a, event.threadID);
            if (info) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }
        }
    } catch (err) {
        await api.sendMessage(`Error: ${err.message}`, event.threadID);
    }
};

module.exports.onChat = async ({ api, event }) => {
    try {
        const body = event.body?.toLowerCase() || "";
        if (/^(baby|bby|bot|jan|babu|janu)\b/.test(body)) {
            const arr = body.replace(/^\S+\s*/, "");
            const randomReplies = ["😚", "Yes 😀, I am ≛⃝𝙰𝚈𝙴𝙰𝙷𝙰 𝚀𝚄𝙴𝙴𝙽👑__/:;)🤍 here", "What's up?", "Bolo jaan ki korte panmr jonno"];

            if (!arr) {
                const info = await api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID);
                if (info) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: module.exports.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }
                return;
            }

            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
            const info = await api.sendMessage(a, event.threadID);
            if (info) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }
        }
    } catch (err) {
        await api.sendMessage(`Error: ${err.message}`, event.threadID);
    }
};
