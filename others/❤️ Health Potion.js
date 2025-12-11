const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'fantasy_world_data.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading fantasy world data:', error);
  }
  return { users: {} };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving fantasy world data:', error);
  }
}

function getUserData(userId) {
  const data = loadData();
  if (!data.users[userId]) {
    data.users[userId] = {
      gold: 1000,
      gems: 50,
      level: 1,
      exp: 0,
      inventory: [],
      lastDaily: 0,
      dailyStreak: 0,
      completedTasks: [],
      lastTaskReset: 0
    };
    saveData(data);
  }
  return data.users[userId];
}

function saveUserData(userId, userData) {
  const data = loadData();
  data.users[userId] = userData;
  saveData(data);
}

const SHOP_ITEMS = [
  { id: 'health_potion', name: '❤️ Health Potion', price: 150, type: 'consumable', description: 'Restores 50 HP' },
  { id: 'mana_potion', name: '💙 Mana Potion', price: 120, type: 'consumable', description: 'Restores 30 MP' },
  { id: 'dragon_sword', name: '⚔️ Dragon Sword', price: 5000, type: 'weapon', description: '+50 Attack Power' },
  { id: 'phoenix_armor', name: '🛡️ Phoenix Armor', price: 4500, type: 'armor', description: '+40 Defense' },
  { id: 'unicorn_mount', name: '🦄 Unicorn Mount', price: 8000, type: 'mount', description: 'Speed +30%' },
  { id: 'fairy_wings', name: '🧚 Fairy Wings', price: 6000, type: 'accessory', description: 'Flight ability' },
  { id: 'crystal_amulet', name: '💎 Crystal Amulet', price: 3500, type: 'accessory', description: '+20 Magic Power' },
  { id: 'elven_bow', name: '🏹 Elven Bow', price: 4000, type: 'weapon', description: '+35 Range Attack' },
  { id: 'magic_staff', name: '🪄 Magic Staff', price: 5500, type: 'weapon', description: '+60 Magic Attack' },
  { id: 'legendary_pet_egg', name: '🥚 Legendary Pet Egg', price: 10000, type: 'special', description: 'Summon rare pet' }
];

const DAILY_TASKS = [
  { id: 'task1', name: '🎯 Send 10 messages', reward: { gold: 200, exp: 50 }, progress: 0, goal: 10 },
  { id: 'task2', name: '⚔️ Use 3 commands', reward: { gold: 150, exp: 30 }, progress: 0, goal: 3 },
  { id: 'task3', name: '💬 Chat in 2 different groups', reward: { gold: 250, exp: 60 }, progress: 0, goal: 2 },
  { id: 'task4', name: '🎲 Play any game', reward: { gold: 100, exp: 20 }, progress: 0, goal: 1 },
  { id: 'task5', name: '🤝 Help another player', reward: { gold: 300, exp: 80 }, progress: 0, goal: 1 }
];

module.exports = {
  config: {
    name: "fantasy",
    aliases: ["fw", "anime"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Fantasy anime world - daily rewards, tasks, and shop",
    category: "game",
    guide: "{pn} profile - View your profile\n{pn} daily - Claim daily reward\n{pn} tasks - View and complete daily tasks\n{pn} shop - Browse the magic shop\n{pn} buy <item_id> - Purchase an item\n{pn} inventory - View your items"
  },

  ST: async function({ message, args, event, usersData }) {
    const userId = event.senderID;
    const userData = getUserData(userId);
    const currentTime = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (!args[0] || args[0] === 'profile') {
      const userName = await usersData.getName(userId);
      const expNeeded = userData.level * 100;
      const expProgress = ((userData.exp / expNeeded) * 100).toFixed(1);

      const profileMsg = `╭─────────────────⭓
│ 🎮 Fantasy World Profile
├─────────────────⭓
│ 👤 ${userName}
│ ⭐ Level: ${userData.level}
│ 📊 EXP: ${userData.exp}/${expNeeded} (${expProgress}%)
├─────────────────⭓
│ 💰 Gold: ${userData.gold.toLocaleString()}
│ 💎 Gems: ${userData.gems}
│ 🔥 Daily Streak: ${userData.dailyStreak} days
├─────────────────⭓
│ 🎒 Inventory Items: ${userData.inventory.length}
│ ✅ Tasks Completed: ${userData.completedTasks.length}
╰─────────────────⭓

💡 Use "fantasy shop" to browse items!`;

      return message.reply(profileMsg);
    }

    if (args[0] === 'daily') {
      const timeSinceDaily = currentTime - userData.lastDaily;

      if (timeSinceDaily < oneDayMs) {
        const timeLeft = oneDayMs - timeSinceDaily;
        const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        
        return message.reply(`⏰ Daily reward already claimed!\n\n🕐 Next reward in: ${hoursLeft}h ${minutesLeft}m`);
      }

      if (timeSinceDaily < oneDayMs * 2) {
        userData.dailyStreak++;
      } else {
        userData.dailyStreak = 1;
      }

      const baseGold = 500;
      const baseGems = 10;
      const streakBonus = userData.dailyStreak * 50;
      const totalGold = baseGold + streakBonus;
      const totalGems = baseGems + Math.floor(userData.dailyStreak / 3);

      userData.gold += totalGold;
      userData.gems += totalGems;
      userData.exp += 100;
      userData.lastDaily = currentTime;

      if (userData.exp >= userData.level * 100) {
        userData.level++;
        userData.exp = 0;
        saveUserData(userId, userData);
        
        return message.reply(`🎁 Daily Reward Claimed!
╭─────────────────⭓
│ 💰 +${totalGold} Gold
│ 💎 +${totalGems} Gems
│ 📊 +100 EXP
│ 🔥 Streak: ${userData.dailyStreak} days
╰─────────────────⭓

🎊 LEVEL UP! You are now Level ${userData.level}!`);
      }

      saveUserData(userId, userData);

      return message.reply(`🎁 Daily Reward Claimed!
╭─────────────────⭓
│ 💰 +${totalGold} Gold
│ 💎 +${totalGems} Gems
│ 📊 +100 EXP
│ 🔥 Streak: ${userData.dailyStreak} days
╰─────────────────⭓

💡 Keep your streak alive! Come back tomorrow!`);
    }

    if (args[0] === 'tasks') {
      const timeSinceReset = currentTime - userData.lastTaskReset;

      if (timeSinceReset >= oneDayMs) {
        userData.completedTasks = [];
        userData.lastTaskReset = currentTime;
        saveUserData(userId, userData);
      }

      let taskList = '╭─────────────────⭓\n│ 📋 Daily Tasks\n├─────────────────⭓\n';

      DAILY_TASKS.forEach((task, index) => {
        const completed = userData.completedTasks.includes(task.id);
        const status = completed ? '✅' : '⏳';
        taskList += `│ ${index + 1}. ${status} ${task.name}\n`;
        taskList += `│    💰 ${task.reward.gold} Gold | 📊 ${task.reward.exp} EXP\n`;
      });

      const timeUntilReset = oneDayMs - timeSinceReset;
      const hoursLeft = Math.floor(timeUntilReset / (60 * 60 * 1000));

      taskList += `├─────────────────⭓\n│ 🕐 Reset in: ${hoursLeft} hours\n╰─────────────────⭓\n\n💡 Complete tasks to earn rewards!`;

      return message.reply(taskList);
    }

    if (args[0] === 'shop') {
      let shopList = '╭─────────────────⭓\n│ 🏪 Magic Shop\n├─────────────────⭓\n';

      SHOP_ITEMS.forEach((item, index) => {
        shopList += `│ ${index + 1}. ${item.name}\n`;
        shopList += `│    💰 ${item.price} Gold\n`;
        shopList += `│    📝 ${item.description}\n`;
        shopList += `│    🏷️ ID: ${item.id}\n├─────────────────⭓\n`;
      });

      shopList += `│ 💰 Your Gold: ${userData.gold.toLocaleString()}\n╰─────────────────⭓\n\n💡 Use "fantasy buy <item_id>" to purchase!`;

      return message.reply(shopList);
    }

    if (args[0] === 'buy') {
      if (!args[1]) {
        return message.reply('❌ Please specify an item ID!\n\nUsage: fantasy buy <item_id>');
      }

      const itemId = args[1].toLowerCase();
      const item = SHOP_ITEMS.find(i => i.id === itemId);

      if (!item) {
        return message.reply('❌ Item not found! Use "fantasy shop" to see available items.');
      }

      if (userData.gold < item.price) {
        return message.reply(`❌ Not enough gold!\n\n💰 Need: ${item.price} Gold\n💰 Have: ${userData.gold} Gold\n💰 Short: ${item.price - userData.gold} Gold`);
      }

      userData.gold -= item.price;
      userData.inventory.push({
        id: item.id,
        name: item.name,
        type: item.type,
        purchasedAt: currentTime
      });
      userData.exp += 50;

      saveUserData(userId, userData);

      return message.reply(`✅ Purchase Successful!
╭─────────────────⭓
│ ${item.name}
│ 💰 -${item.price} Gold
│ 📊 +50 EXP
├─────────────────⭓
│ 💰 Remaining: ${userData.gold.toLocaleString()} Gold
╰─────────────────⭓

🎒 Item added to inventory!`);
    }

    if (args[0] === 'inventory') {
      if (userData.inventory.length === 0) {
        return message.reply('🎒 Your inventory is empty!\n\n💡 Visit the shop to buy items: fantasy shop');
      }

      let inventoryMsg = '╭─────────────────⭓\n│ 🎒 Your Inventory\n├─────────────────⭓\n';

      const itemCounts = {};
      userData.inventory.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
      });

      Object.entries(itemCounts).forEach(([name, count]) => {
        inventoryMsg += `│ ${name} x${count}\n`;
      });

      inventoryMsg += `├─────────────────⭓\n│ 📦 Total Items: ${userData.inventory.length}\n╰─────────────────⭓`;

      return message.reply(inventoryMsg);
    }

    return message.reply('❌ Invalid command!\n\n📖 Available commands:\n• fantasy profile\n• fantasy daily\n• fantasy tasks\n• fantasy shop\n• fantasy buy <item_id>\n• fantasy inventory');
  }
};