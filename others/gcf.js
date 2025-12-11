const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'gcf_data.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading GCF data:', error);
  }
  return {
    users: 0,
    threads: 0,
    lastUpdate: Date.now()
  };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving GCF data:', error);
  }
}

function updateCounters(api) {
  const data = loadData();
  const currentTime = Date.now();
  const hourInMs = 60 * 60 * 1000;
  
  if (currentTime - data.lastUpdate >= hourInMs) {
    api.getThreadList(100, null, ['INBOX'], (err, threads) => {
      if (!err) {
        data.threads = threads.length;
      }
    });
    
    api.getFriendsList((err, friends) => {
      if (!err) {
        data.users = friends.length;
      }
    });
    
    data.lastUpdate = currentTime;
    saveData(data);
  }
  
  return data;
}

module.exports = {
  config: {
    name: "gcf",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Show user and thread counter with hourly auto-increment",
    category: "info",
    guide: "{pn}"
  },
  
  onStart: async function({ message, api, event, threadsData, usersData }) {
    try {
      const allThreads = await threadsData.getAll();
      const allUsers = await usersData.getAll();
      
      const data = loadData();
      const currentTime = Date.now();
      const hourInMs = 60 * 60 * 1000;
      const timeSinceUpdate = currentTime - data.lastUpdate;
      
      if (timeSinceUpdate >= hourInMs) {
        const hoursElapsed = Math.floor(timeSinceUpdate / hourInMs);
        data.users = allUsers.length + hoursElapsed;
        data.threads = allThreads.length + hoursElapsed;
        data.lastUpdate = currentTime;
        saveData(data);
      } else if (data.users === 0 && data.threads === 0) {
        data.users = allUsers.length;
        data.threads = allThreads.length;
        data.lastUpdate = currentTime;
        saveData(data);
      }
      
      const nextUpdate = new Date(data.lastUpdate + hourInMs);
      const timeUntilUpdate = hourInMs - timeSinceUpdate;
      const minutesLeft = Math.floor(timeUntilUpdate / (60 * 1000));
      
      const statsMessage = `╭─────────────⭓\n` +
        `│ 📊 GCF Statistics\n` +
        `├─────────────⭓\n` +
        `│ 👥 Total Users: ${data.users.toLocaleString()}\n` +
        `│ 💬 Total Threads: ${data.threads.toLocaleString()}\n` +
        `├─────────────⭓\n` +
        `│ 🕐 Last Update: ${new Date(data.lastUpdate).toLocaleString()}\n` +
        `│ ⏰ Next Update: ${minutesLeft} minutes\n` +
        `╰─────────────⭓\n\n` +
        `✨ Counters auto-increment every hour!`;
      
      await message.reply(statsMessage);
      
    } catch (error) {
      console.error('GCF Error:', error);
      await message.reply("❌ An error occurred while fetching statistics.");
    }
  }
};

setInterval(() => {
  const data = loadData();
  const currentTime = Date.now();
  const hourInMs = 60 * 60 * 1000;
  
  if (currentTime - data.lastUpdate >= hourInMs) {
    data.users += 1;
    data.threads += 1;
    data.lastUpdate = currentTime;
    saveData(data);
    console.log('GCF: Counters auto-incremented');
  }
}, 60 * 60 * 1000);