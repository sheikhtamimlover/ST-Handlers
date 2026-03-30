module.exports = {
  config: {
    name: "autobio",
    aliases: ["سيرة_تلقائية", "بايو_تلقائي"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 2,
    premium: false,
    usePrefix: true,
    description: "يقوم بتغيير البايو تلقائياً كل فترة زمنية",
    category: "owner",
    guide: "{pn} on/off\n{pn} time <minutes>\n{pn} add <bio text>\n{pn} list\n{pn} remove <index>"
  },
  langs: {
    en: {
      enabled: "✅ Auto bio has been enabled!",
      disabled: "❌ Auto bio has been disabled!",
      timeSet: "⏰ Auto bio interval set to {time} minutes",
      invalidTime: "❌ Please provide a valid time in minutes (minimum 5)",
      bioAdded: "✅ Bio added successfully!\nTotal bios: {count}",
      bioRemoved: "✅ Bio removed successfully!\nRemaining bios: {count}",
      invalidIndex: "❌ Invalid bio index!",
      noBios: "❌ No bios available. Add some first!",
      bioList: "📝 Saved Bios ({count}):\n\n{list}",
      missingText: "❌ Please provide bio text!",
      bioUpdated: "✅ Bio updated: {bio}",
      error: "❌ An error occurred!",
      status: "📊 Auto Bio Status:\n• Status: {status}\n• Interval: {time} minutes\n• Total Bios: {count}"
    },
    ar: {
      enabled: "✅ تم تفعيل البايو التلقائي!",
      disabled: "❌ تم تعطيل البايو التلقائي!",
      timeSet: "⏰ تم تعيين الفاصل الزمني إلى {time} دقيقة",
      invalidTime: "❌ الرجاء إدخال وقت صحيح بالدقائق (الحد الأدنى 5)",
      bioAdded: "✅ تم إضافة البايو بنجاح!\nإجمالي البايوات: {count}",
      bioRemoved: "✅ تم حذف البايو بنجاح!\nالبايوات المتبقية: {count}",
      invalidIndex: "❌ رقم البايو غير صحيح!",
      noBios: "❌ لا توجد بايوات متاحة. أضف بعضها أولاً!",
      bioList: "📝 البايوات المحفوظة ({count}):\n\n{list}",
      missingText: "❌ الرجاء إدخال نص البايو!",
      bioUpdated: "✅ تم تحديث البايو: {bio}",
      error: "❌ حدث خطأ!",
      status: "📊 حالة البايو التلقائي:\n• الحالة: {status}\n• الفاصل الزمني: {time} دقيقة\n• إجمالي البايوات: {count}"
    }
  },
  ST: async function({ message, args, event, api, getLang, threadsData }) {
    const { getGlobalData, setGlobalData } = global.utils;
    
    let autoBioData = await getGlobalData("autobio") || {
      enabled: false,
      interval: 15,
      bios: [],
      currentIndex: 0
    };

    const subCommand = args[0]?.toLowerCase();

    switch (subCommand) {
      case "on":
      case "تشغيل":
        if (autoBioData.bios.length === 0) {
          return message.reply(getLang("noBios"));
        }
        autoBioData.enabled = true;
        await setGlobalData("autobio", autoBioData);
        this.startAutoBio(api, autoBioData);
        return message.reply(getLang("enabled"));

      case "off":
      case "ايقاف":
        autoBioData.enabled = false;
        await setGlobalData("autobio", autoBioData);
        if (global.autoBioInterval) {
          clearInterval(global.autoBioInterval);
        }
        return message.reply(getLang("disabled"));

      case "time":
      case "وقت":
        const time = parseInt(args[1]);
        if (!time || time < 5) {
          return message.reply(getLang("invalidTime"));
        }
        autoBioData.interval = time;
        await setGlobalData("autobio", autoBioData);
        if (autoBioData.enabled) {
          this.startAutoBio(api, autoBioData);
        }
        return message.reply(getLang("timeSet").replace("{time}", time));

      case "add":
      case "اضافة":
        const bioText = args.slice(1).join(" ");
        if (!bioText) {
          return message.reply(getLang("missingText"));
        }
        autoBioData.bios.push(bioText);
        await setGlobalData("autobio", autoBioData);
        return message.reply(getLang("bioAdded").replace("{count}", autoBioData.bios.length));

      case "remove":
      case "حذف":
        const index = parseInt(args[1]) - 1;
        if (isNaN(index) || index < 0 || index >= autoBioData.bios.length) {
          return message.reply(getLang("invalidIndex"));
        }
        autoBioData.bios.splice(index, 1);
        await setGlobalData("autobio", autoBioData);
        return message.reply(getLang("bioRemoved").replace("{count}", autoBioData.bios.length));

      case "list":
      case "قائمة":
        if (autoBioData.bios.length === 0) {
          return message.reply(getLang("noBios"));
        }
        const list = autoBioData.bios.map((bio, i) => `${i + 1}. ${bio}`).join("\n");
        return message.reply(getLang("bioList").replace("{count}", autoBioData.bios.length).replace("{list}", list));

      default:
        const status = autoBioData.enabled ? "✅ Active" : "❌ Inactive";
        return message.reply(
          getLang("status")
            .replace("{status}", status)
            .replace("{time}", autoBioData.interval)
            .replace("{count}", autoBioData.bios.length)
        );
    }
  },

  startAutoBio: function(api, data) {
    if (global.autoBioInterval) {
      clearInterval(global.autoBioInterval);
    }

    const updateBio = async () => {
      if (!data.enabled || data.bios.length === 0) return;

      try {
        const bio = data.bios[data.currentIndex];
        await api.changeBio(bio);
        console.log(`✅ Bio updated: ${bio}`);
        
        data.currentIndex = (data.currentIndex + 1) % data.bios.length;
        await global.utils.setGlobalData("autobio", data);
      } catch (error) {
        console.error("Auto Bio Error:", error.message);
      }
    };

    updateBio();
    global.autoBioInterval = setInterval(updateBio, data.interval * 60 * 1000);
  },

  onLoad: async function({ api }) {
    const { getGlobalData } = global.utils;
    const autoBioData = await getGlobalData("autobio");
    
    if (autoBioData?.enabled && autoBioData.bios.length > 0) {
      this.startAutoBio(api, autoBioData);
      console.log("✅ Auto Bio loaded and started");
    }
  }
};