module.exports = {
  config: {
    name: "مساعدة",
    aliases: ["اوامر", "الاوامر", "قائمة"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: false,
    description: "قائمة الأوامر بالعربية",
    category: "info",
    guide: "{pn} [اسم الأمر]\n{pn} [رقم الصفحة]\n{pn} [الفئة]"
  },
  langs: {
    ar: {
      help: "『 قائمة الأوامر 』\n\n",
      commandCount: "📊 إجمالي الأوامر: {total}\n",
      page: "📄 الصفحة {current}/{total}\n",
      categories: "📑 الفئات المتاحة:\n{list}\n",
      usage: "💡 الاستخدام: {pn} [اسم الأمر] للتفاصيل",
      commandInfo: "『 معلومات الأمر 』\n\n📌 الاسم: {name}\n📝 الوصف: {description}\n🏷️ الأسماء البديلة: {aliases}\n⏱️ الانتظار: {countdown}ث\n👤 الصلاحية: {role}\n💎 مميز: {premium}\n📂 الفئة: {category}\n\n📖 الدليل:\n{guide}",
      notFound: "❌ الأمر '{name}' غير موجود!",
      categoryList: "『 أوامر فئة {category} 』\n\n{commands}\n\n📄 الصفحة {current}/{total}",
      noCommands: "❌ لا توجد أوامر في هذه الفئة!",
      prefix: "🔑 البادئة: {prefix}",
      footer: "\n━━━━━━━━━━━━━━━\n💬 استخدم: {pn} <اسم الأمر> للتفاصيل"
    }
  },
  ST: async function({ message, args, event, api, getLang, commandName, usersData }) {
    const { commands } = global.GoatBot;
    const itemsPerPage = 10;
    
    const getRoleText = (role) => {
      switch(role) {
        case 0: return "الجميع";
        case 1: return "مشرف المجموعة";
        case 2: return "المالك";
        default: return "الجميع";
      }
    };

    if (args.length === 0) {
      const categoriesMap = {};
      let totalCommands = 0;

      for (const [cmdName, cmdData] of commands) {
        const category = cmdData.config.category || "أخرى";
        if (!categoriesMap[category]) {
          categoriesMap[category] = [];
        }
        categoriesMap[category].push(cmdName);
        totalCommands++;
      }

      const categories = Object.keys(categoriesMap).sort();
      const categoryList = categories.map((cat, i) => 
        `${i + 1}. ${cat} (${categoriesMap[cat].length})`
      ).join("\n");

      let helpMsg = getLang("help");
      helpMsg += getLang("prefix").replace("{prefix}", global.GoatBot.config.prefix) + "\n";
      helpMsg += getLang("commandCount").replace("{total}", totalCommands) + "\n";
      helpMsg += getLang("categories").replace("{list}", categoryList);
      helpMsg += getLang("usage").replace("{pn}", commandName);

      return message.reply(helpMsg);
    }

    const query = args.join(" ");

    if (commands.has(query)) {
      const cmd = commands.get(query);
      const config = cmd.config;
      
      let guide = config.guide || "لا يوجد دليل متاح";
      guide = guide.replace(/{pn}/g, config.name)
                   .replace(/{prefix}/g, global.GoatBot.config.prefix);

      const info = getLang("commandInfo")
        .replace("{name}", config.name)
        .replace("{description}", config.description || "لا يوجد وصف")
        .replace("{aliases}", config.aliases?.join(", ") || "لا يوجد")
        .replace("{countdown}", config.countDown || 0)
        .replace("{role}", getRoleText(config.role))
        .replace("{premium}", config.premium ? "نعم" : "لا")
        .replace("{category}", config.category || "أخرى")
        .replace("{guide}", guide);

      return message.reply(info);
    }

    const categoriesMap = {};
    for (const [cmdName, cmdData] of commands) {
      const category = cmdData.config.category || "أخرى";
      if (!categoriesMap[category]) {
        categoriesMap[category] = [];
      }
      categoriesMap[category].push(cmdName);
    }

    const categoryNames = Object.keys(categoriesMap).map(c => c.toLowerCase());
    const matchedCategory = categoryNames.find(c => c.includes(query.toLowerCase()));

    if (matchedCategory) {
      const realCategoryName = Object.keys(categoriesMap).find(c => c.toLowerCase() === matchedCategory);
      const cmds = categoriesMap[realCategoryName];
      const totalPages = Math.ceil(cmds.length / itemsPerPage);
      
      let page = 1;
      if (!isNaN(args[1])) {
        page = Math.max(1, Math.min(parseInt(args[1]), totalPages));
      }

      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageCommands = cmds.slice(start, end);

      const commandList = pageCommands.map((cmd, i) => {
        const config = commands.get(cmd).config;
        return `${start + i + 1}. ${cmd} - ${config.description || "لا يوجد وصف"}`;
      }).join("\n");

      const categoryMsg = getLang("categoryList")
        .replace("{category}", realCategoryName)
        .replace("{commands}", commandList)
        .replace("{current}", page)
        .replace("{total}", totalPages);

      return message.reply(categoryMsg + getLang("footer").replace("{pn}", commandName));
    }

    if (!isNaN(query)) {
      const allCommands = Array.from(commands.keys());
      const totalPages = Math.ceil(allCommands.length / itemsPerPage);
      const page = Math.max(1, Math.min(parseInt(query), totalPages));

      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageCommands = allCommands.slice(start, end);

      const commandList = pageCommands.map((cmd, i) => {
        const config = commands.get(cmd).config;
        return `${start + i + 1}. ${cmd} - ${config.description || "لا يوجد وصف"}`;
      }).join("\n");

      let pageMsg = getLang("help");
      pageMsg += getLang("page").replace("{current}", page).replace("{total}", totalPages) + "\n";
      pageMsg += commandList;
      pageMsg += getLang("footer").replace("{pn}", commandName);

      return message.reply(pageMsg);
    }

    return message.reply(getLang("notFound").replace("{name}", query));
  }
};