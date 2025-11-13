const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");

module.exports = {
  config: {
    name: "bank2",
    version: "2.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: {
      en: "Advanced banking system with ATM and card features",
      bn: "এটিএম এবং কার্ড সুবিধা সহ উন্নত ব্যাংকিং সিস্টেম"
    },
    category: "economy",
    guide: {
      en: "   {pn} - View balance\n   {pn} register - Create bank account\n   {pn} deposit <amount> - Deposit money\n   {pn} withdraw <amount> - Withdraw money\n   {pn} transfer <@tag> <amount> - Transfer money\n   {pn} card - View your bank card\n   {pn} atm - Access ATM\n   {pn} setpin <4-digit> - Set ATM PIN\n   {pn} history - Transaction history",
      bn: "   {pn} - ব্যালেন্স দেখুন\n   {pn} register - ব্যাংক অ্যাকাউন্ট তৈরি করুন\n   {pn} deposit <টাকা> - টাকা জমা দিন\n   {pn} withdraw <টাকা> - টাকা তুলুন\n   {pn} transfer <@ট্যাগ> <টাকা> - টাকা পাঠান\n   {pn} card - আপনার ব্যাংক কার্ড দেখুন\n   {pn} atm - এটিএম ব্যবহার করুন\n   {pn} setpin <৪-সংখ্যা> - এটিএম পিন সেট করুন\n   {pn} history - লেনদেন ইতিহাস"
    }
  },

  langs: {
    en: {
      notRegistered: "❌ You don't have a bank account! Use {pn} register to create one.",
      registered: "✅ Bank account created successfully!\n💰 Starting balance: $1,000",
      alreadyRegistered: "❌ You already have a bank account!",
      invalidAmount: "❌ Invalid amount! Please enter a valid number.",
      insufficientBalance: "❌ Insufficient balance!",
      depositSuccess: "✅ Deposited ${1} successfully!\n💰 New balance: ${2}",
      withdrawSuccess: "✅ Withdrawn ${1} successfully!\n💰 New balance: ${2}",
      transferSuccess: "✅ Transferred ${1} to {2} successfully!",
      invalidUser: "❌ Invalid user! Please tag a valid user.",
      pinSet: "✅ ATM PIN set successfully!\n🔐 Your PIN: {1}",
      invalidPin: "❌ Invalid PIN! PIN must be 4 digits.",
      noPinSet: "❌ You haven't set an ATM PIN yet! Use {pn} setpin <4-digit>",
      wrongPin: "❌ Wrong PIN! Try again.",
      enterPin: "🔐 Enter your 4-digit ATM PIN:",
      atmAccess: "✅ ATM access granted!",
      cardGenerated: "✅ Your MasterCard has been generated!",
      historyEmpty: "📋 No transaction history yet!",
      historyTitle: "📊 Transaction History"
    },
    bn: {
      notRegistered: "❌ আপনার কোন ব্যাংক অ্যাকাউন্ট নেই! {pn} register দিয়ে তৈরি করুন।",
      registered: "✅ ব্যাংক অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!\n💰 শুরুর ব্যালেন্স: $১,০০০",
      alreadyRegistered: "❌ আপনার ইতিমধ্যে একটি ব্যাংক অ্যাকাউন্ট আছে!",
      invalidAmount: "❌ অবৈধ পরিমাণ! একটি বৈধ সংখ্যা লিখুন।",
      insufficientBalance: "❌ অপর্যাপ্ত ব্যালেন্স!",
      depositSuccess: "✅ ${1} সফলভাবে জমা হয়েছে!\n💰 নতুন ব্যালেন্স: ${2}",
      withdrawSuccess: "✅ ${1} সফলভাবে তোলা হয়েছে!\n💰 নতুন ব্যালেন্স: ${2}",
      transferSuccess: "✅ {2} কে ${1} সফলভাবে পাঠানো হয়েছে!",
      invalidUser: "❌ অবৈধ ব্যবহারকারী! একটি বৈধ ব্যবহারকারী ট্যাগ করুন।",
      pinSet: "✅ এটিএম পিন সফলভাবে সেট হয়েছে!\n🔐 আপনার পিন: {1}",
      invalidPin: "❌ অবৈধ পিন! পিন ৪ সংখ্যার হতে হবে।",
      noPinSet: "❌ আপনি এখনও এটিএম পিন সেট করেননি! {pn} setpin <৪-সংখ্যা> ব্যবহার করুন",
      wrongPin: "❌ ভুল পিন! আবার চেষ্টা করুন।",
      enterPin: "🔐 আপনার ৪-সংখ্যার এটিএম পিন লিখুন:",
      atmAccess: "✅ এটিএম অ্যাক্সেস দেওয়া হয়েছে!",
      cardGenerated: "✅ আপনার মাস্টারকার্ড তৈরি হয়েছে!",
      historyEmpty: "📋 এখনও কোন লেনদেন ইতিহাস নেই!",
      historyTitle: "📊 লেনদেন ইতিহাস"
    }
  },

  onStart: async function({ api, event, args, message, usersData, getLang }) {
    try {
      const { senderID, threadID, messageID } = event;
      const dbPath = path.join(__dirname, "cache", "bank2_data.json");
      
      // Ensure cache directory exists
      await fs.ensureDir(path.join(__dirname, "cache"));
      
      // Load database
      let bankDB = {};
      if (await fs.pathExists(dbPath)) {
        bankDB = await fs.readJSON(dbPath);
      }
      
      // Initialize user data structure
      if (!bankDB[senderID]) {
        bankDB[senderID] = {
          balance: 0,
          cardNumber: null,
          pin: null,
          history: [],
          registered: false
        };
      }

      const action = args[0]?.toLowerCase();

      // REGISTER
      if (action === "register") {
        if (bankDB[senderID].registered) {
          return message.reply(getLang("alreadyRegistered"));
        }
        
        bankDB[senderID] = {
          balance: 1000,
          cardNumber: generateCardNumber(),
          pin: null,
          history: [{
            type: "opening",
            amount: 1000,
            date: new Date().toISOString(),
            description: "Account Opening Bonus"
          }],
          registered: true
        };
        
        await fs.writeJSON(dbPath, bankDB, { spaces: 2 });
        
        const balanceImg = await createBalanceImage(senderID, bankDB[senderID].balance, usersData);
        return message.reply({
          body: getLang("registered"),
          attachment: balanceImg
        });
      }

      // Check if registered
      if (!bankDB[senderID].registered) {
        return message.reply(getLang("notRegistered"));
      }

      // VIEW BALANCE (default)
      if (!action) {
        const balanceImg = await createBalanceImage(senderID, bankDB[senderID].balance, usersData);
        return message.reply({ attachment: balanceImg });
      }

      // DEPOSIT
      if (action === "deposit") {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
          return message.reply(getLang("invalidAmount"));
        }
        
        bankDB[senderID].balance += amount;
        bankDB[senderID].history.push({
          type: "deposit",
          amount: amount,
          date: new Date().toISOString(),
          description: "Cash Deposit"
        });
        
        await fs.writeJSON(dbPath, bankDB, { spaces: 2 });
        
        const balanceImg = await createBalanceImage(senderID, bankDB[senderID].balance, usersData);
        return message.reply({
          body: getLang("depositSuccess", amount, bankDB[senderID].balance),
          attachment: balanceImg
        });
      }

      // WITHDRAW
      if (action === "withdraw") {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
          return message.reply(getLang("invalidAmount"));
        }
        
        if (bankDB[senderID].balance < amount) {
          return message.reply(getLang("insufficientBalance"));
        }
        
        bankDB[senderID].balance -= amount;
        bankDB[senderID].history.push({
          type: "withdraw",
          amount: amount,
          date: new Date().toISOString(),
          description: "Cash Withdrawal"
        });
        
        await fs.writeJSON(dbPath, bankDB, { spaces: 2 });
        
        const balanceImg = await createBalanceImage(senderID, bankDB[senderID].balance, usersData);
        return message.reply({
          body: getLang("withdrawSuccess", amount, bankDB[senderID].balance),
          attachment: balanceImg
        });
      }

      // TRANSFER
      if (action === "transfer") {
        const mention = Object.keys(event.mentions)[0];
        const amount = parseInt(args[args.length - 1]);
        
        if (!mention) {
          return message.reply(getLang("invalidUser"));
        }
        
        if (isNaN(amount) || amount <= 0) {
          return message.reply(getLang("invalidAmount"));
        }
        
        if (bankDB[senderID].balance < amount) {
          return message.reply(getLang("insufficientBalance"));
        }
        
        // Initialize receiver if not exists
        if (!bankDB[mention]) {
          bankDB[mention] = {
            balance: 0,
            cardNumber: generateCardNumber(),
            pin: null,
            history: [],
            registered: true
          };
        }
        
        bankDB[senderID].balance -= amount;
        bankDB[mention].balance += amount;
        
        const receiverName = await usersData.getName(mention);
        
        bankDB[senderID].history.push({
          type: "transfer_sent",
          amount: amount,
          date: new Date().toISOString(),
          description: `Transfer to ${receiverName}`
        });
        
        bankDB[mention].history.push({
          type: "transfer_received",
          amount: amount,
          date: new Date().toISOString(),
          description: `Transfer from ${await usersData.getName(senderID)}`
        });
        
        await fs.writeJSON(dbPath, bankDB, { spaces: 2 });
        
        return message.reply(getLang("transferSuccess", amount, receiverName));
      }

      // SET PIN
      if (action === "setpin") {
        const pin = args[1];
        if (!pin || pin.length !== 4 || isNaN(pin)) {
          return message.reply(getLang("invalidPin"));
        }
        
        bankDB[senderID].pin = pin;
        await fs.writeJSON(dbPath, bankDB, { spaces: 2 });
        
        return message.reply(getLang("pinSet", pin));
      }

      // ATM ACCESS
      if (action === "atm") {
        if (!bankDB[senderID].pin) {
          return message.reply(getLang("noPinSet"));
        }
        
        const atmImg = await createATMImage();
        
        return message.reply({
          body: getLang("enterPin"),
          attachment: atmImg
        }, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: senderID,
              type: "atmPin"
            });
          }
        });
      }

      // CARD
      if (action === "card") {
        const cardImg = await createCardImage(senderID, bankDB[senderID].cardNumber, usersData);
        return message.reply({
          body: getLang("cardGenerated"),
          attachment: cardImg
        });
      }

      // HISTORY
      if (action === "history") {
        if (bankDB[senderID].history.length === 0) {
          return message.reply(getLang("historyEmpty"));
        }
        
        const historyImg = await createHistoryImage(senderID, bankDB[senderID].history, usersData);
        return message.reply({
          body: getLang("historyTitle"),
          attachment: historyImg
        });
      }

    } catch (err) {
      console.log(err);
      return message.reply("❌ An error occurred!");
    }
  },

  onReply: async function({ api, event, Reply, message, usersData, getLang }) {
    try {
      const { senderID, body, threadID, messageID } = event;
      
      if (Reply.type === "atmPin" && Reply.author === senderID) {
        const dbPath = path.join(__dirname, "cache", "bank2_data.json");
        const bankDB = await fs.readJSON(dbPath);
        
        const enteredPin = body.trim();
        
        if (enteredPin === bankDB[senderID].pin) {
          const balanceImg = await createATMBalanceImage(senderID, bankDB[senderID].balance, usersData);
          
          return message.reply({
            body: getLang("atmAccess"),
            attachment: balanceImg
          });
        } else {
          return message.reply(getLang("wrongPin"));
        }
      }
      
    } catch (err) {
      console.log(err);
    }
  }
};

// Helper Functions

function generateCardNumber() {
  const prefix = "5425"; // MasterCard prefix
  let cardNumber = prefix;
  
  for (let i = 0; i < 12; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  
  return cardNumber.match(/.{1,4}/g).join(" ");
}

async function createBalanceImage(userID, balance, usersData) {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext("2d");
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 400);
  gradient.addColorStop(0, "#667eea");
  gradient.addColorStop(1, "#764ba2");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 400);
  
  // White card background
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, 50, 50, 700, 300, 20);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Title
  ctx.fillStyle = "#333";
  ctx.font = "bold 40px Arial";
  ctx.fillText("BANK ACCOUNT", 80, 110);
  
  // Balance label
  ctx.fillStyle = "#666";
  ctx.font = "24px Arial";
  ctx.fillText("Available Balance", 80, 170);
  
  // Balance amount
  ctx.fillStyle = "#667eea";
  ctx.font = "bold 60px Arial";
  ctx.fillText(`$${balance.toLocaleString()}`, 80, 240);
  
  // User name
  const userName = await usersData.getName(userID);
  ctx.fillStyle = "#999";
  ctx.font = "20px Arial";
  ctx.fillText(userName, 80, 310);
  
  // Date
  ctx.fillStyle = "#999";
  ctx.font = "18px Arial";
  const date = new Date().toLocaleDateString();
  ctx.fillText(date, 600, 310);
  
  return canvas.createPNGStream();
}

async function createCardImage(userID, cardNumber, usersData) {
  const canvas = createCanvas(850, 540);
  const ctx = canvas.getContext("2d");
  
  // Card gradient background
  const gradient = ctx.createLinearGradient(0, 0, 850, 540);
  gradient.addColorStop(0, "#1e3c72");
  gradient.addColorStop(1, "#2a5298");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 850, 540);
  
  // Add some decoration circles
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.arc(700, 100, 150, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(100, 450, 100, 0, Math.PI * 2);
  ctx.fill();
  
  // Chip
  ctx.fillStyle = "#f4d03f";
  roundRect(ctx, 60, 180, 100, 75, 10);
  ctx.fill();
  
  // Chip lines
  ctx.strokeStyle = "#c0a030";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(75, 200);
  ctx.lineTo(145, 200);
  ctx.moveTo(75, 220);
  ctx.lineTo(145, 220);
  ctx.stroke();
  
  // Card number
  ctx.fillStyle = "#fff";
  ctx.font = "bold 38px Courier New";
  ctx.fillText(cardNumber, 60, 330);
  
  // Card holder
  ctx.font = "16px Arial";
  ctx.fillStyle = "#ccc";
  ctx.fillText("CARD HOLDER", 60, 380);
  
  const userName = await usersData.getName(userID);
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(userName.toUpperCase(), 60, 415);
  
  // Valid thru
  ctx.font = "16px Arial";
  ctx.fillStyle = "#ccc";
  ctx.fillText("VALID THRU", 450, 380);
  
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 5);
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`${(expiry.getMonth() + 1).toString().padStart(2, "0")}/${expiry.getFullYear().toString().slice(-2)}`, 450, 415);
  
  // MasterCard logo (circles)
  ctx.fillStyle = "rgba(235, 0, 27, 0.8)";
  ctx.beginPath();
  ctx.arc(680, 80, 35, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "rgba(255, 95, 0, 0.8)";
  ctx.beginPath();
  ctx.arc(730, 80, 35, 0, Math.PI * 2);
  ctx.fill();
  
  // MasterCard text
  ctx.font = "bold 20px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("mastercard", 640, 470);
  
  return canvas.createPNGStream();
}

async function createATMImage() {
  const canvas = createCanvas(600, 800);
  const ctx = canvas.getContext("2d");
  
  // ATM background
  ctx.fillStyle = "#2c3e50";
  ctx.fillRect(0, 0, 600, 800);
  
  // Screen area
  ctx.fillStyle = "#34495e";
  roundRect(ctx, 50, 50, 500, 300, 10);
  ctx.fill();
  
  // Screen
  ctx.fillStyle = "#1abc9c";
  roundRect(ctx, 70, 70, 460, 260, 5);
  ctx.fill();
  
  // Screen text
  ctx.fillStyle = "#fff";
  ctx.font = "bold 36px Arial";
  ctx.fillText("ENTER PIN", 180, 150);
  
  // PIN display
  ctx.fillStyle = "#ecf0f1";
  roundRect(ctx, 150, 180, 300, 60, 5);
  ctx.fill();
  
  ctx.fillStyle = "#2c3e50";
  ctx.font = "bold 40px Arial";
  ctx.fillText("● ● ● ●", 210, 225);
  
  // Number pad
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  let x = 100;
  let y = 420;
  
  for (let i = 0; i < numbers.length; i++) {
    ctx.fillStyle = "#ecf0f1";
    roundRect(ctx, x, y, 120, 80, 10);
    ctx.fill();
    
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 36px Arial";
    ctx.fillText(numbers[i], x + 45, y + 52);
    
    x += 140;
    if ((i + 1) % 3 === 0) {
      x = 100;
      y += 100;
    }
  }
  
  // Enter button
  ctx.fillStyle = "#27ae60";
  roundRect(ctx, 380, 620, 120, 80, 10);
  ctx.fill();
  
  ctx.fillStyle = "#fff";
  ctx.font = "bold 24px Arial";
  ctx.fillText("ENTER", 395, 670);
  
  // Cancel button
  ctx.fillStyle = "#e74c3c";
  roundRect(ctx, 100, 620, 120, 80, 10);
  ctx.fill();
  
  ctx.fillStyle = "#fff";
  ctx.fillText("CANCEL", 110, 670);
  
  return canvas.createPNGStream();
}

async function createATMBalanceImage(userID, balance, usersData) {
  const canvas = createCanvas(600, 800);
  const ctx = canvas.getContext("2d");
  
  // ATM background
  ctx.fillStyle = "#2c3e50";
  ctx.fillRect(0, 0, 600, 800);
  
  // Screen area
  ctx.fillStyle = "#34495e";
  roundRect(ctx, 50, 50, 500, 600, 10);
  ctx.fill();
  
  // Screen
  ctx.fillStyle = "#1abc9c";
  roundRect(ctx, 70, 70, 460, 560, 5);
  ctx.fill();
  
  // Success checkmark
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(200, 180);
  ctx.lineTo(250, 230);
  ctx.lineTo(350, 130);
  ctx.stroke();
  
  // Text
  ctx.fillStyle = "#fff";
  ctx.font = "bold 32px Arial";
  ctx.fillText("ACCESS GRANTED", 120, 300);
  
  // Balance label
  ctx.font = "24px Arial";
  ctx.fillText("Current Balance", 170, 380);
  
  // Balance
  ctx.font = "bold 56px Arial";
  ctx.fillText(`$${balance.toLocaleString()}`, 150, 460);
  
  // User name
  const userName = await usersData.getName(userID);
  ctx.font = "20px Arial";
  ctx.fillText(userName, 150, 530);
  
  // Date time
  ctx.font = "18px Arial";
  const now = new Date();
  ctx.fillText(now.toLocaleString(), 150, 580);
  
  return canvas.createPNGStream();
}

async function createHistoryImage(userID, history, usersData) {
  const canvas = createCanvas(800, Math.max(600, history.length * 80 + 200));
  const ctx = canvas.getContext("2d");
  
  // Background
  const gradient = ctx.createLinearGradient(0, 0, 800, canvas.height);
  gradient.addColorStop(0, "#667eea");
  gradient.addColorStop(1, "#764ba2");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, canvas.height);
  
  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "bold 40px Arial";
  ctx.fillText("Transaction History", 50, 70);
  
  // User name
  const userName = await usersData.getName(userID);
  ctx.font = "24px Arial";
  ctx.fillText(userName, 50, 110);
  
  // Transactions
  let y = 180;
  const lastTransactions = history.slice(-10).reverse();
  
  for (const trans of lastTransactions) {
    // Transaction card
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 10;
    roundRect(ctx, 50, y, 700, 70, 10);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Transaction type icon
    let icon = "💰";
    let color = "#27ae60";
    if (trans.type === "withdraw" || trans.type === "transfer_sent") {
      icon = "💸";
      color = "#e74c3c";
    } else if (trans.type === "transfer_received") {
      icon = "📥";
      color = "#3498db";
    }
    
    ctx.font = "40px Arial";
    ctx.fillText(icon, 70, y + 48);
    
    // Description
    ctx.fillStyle = "#333";
    ctx.font = "bold 20px Arial";
    ctx.fillText(trans.description, 140, y + 35);
    
    // Date
    ctx.fillStyle = "#999";
    ctx.font = "16px Arial";
    const date = new Date(trans.date).toLocaleString();
    ctx.fillText(date, 140, y + 58);
    
    // Amount
    ctx.fillStyle = color;
    ctx.font = "bold 24px Arial";
    const sign = trans.type === "withdraw" || trans.type === "transfer_sent" ? "-" : "+";
    ctx.fillText(`${sign}$${trans.amount}`, 620, y + 45);
    
    y += 90;
  }
  
  return canvas.createPNGStream();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}