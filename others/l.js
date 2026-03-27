module.exports = {
  config: {
    name: "l",
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    category: "events",
    description: "Auto unload specified commands on bot start"
  },

  onStart: async function({ api, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
    const TARGET_CMDS = ["bby3", "beb", "bby2", "bbby"];
    
    try {
      const { unloadScripts } = global.utils;
      
      for (const cmd of TARGET_CMDS) {
        try {
          await unloadScripts("cmds", cmd);
          console.log(`✅ Auto-unloaded command: ${cmd}`);
        } catch (error) {
          console.log(`⚠️ Command ${cmd} not found or already unloaded`);
        }
      }
    } catch (error) {
      console.error("Auto-unload error:", error);
    }
  }
};