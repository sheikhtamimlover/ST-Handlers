module.exports = {
  config: {
    name: "contact",
    aliases: ["owner", "admin"],
    permission: 0,
    prefix: true,
    description: "Owner contact information"
  },

  async start({ senderId, nayan }) {
    try {
      await nayan.sendGeneric(
        senderId,
        "Name : Rana Babu 🔰 Role : Bot admin",
        "https://i.ibb.co/ymsFTGgY/image.jpg",
        "💬 Need help? Contact below 👇",
        [
          {
            type: "web_url",
            title: "✈️ Telegram",
            url: "https://t.me/ranababu_17"
          },
          {
            type: "web_url",
            title: "🟢 WhatsApp",
            url: "https://wa.me/8801997127617"
          },
          {
            type: "web_url",
            title: "💬 Messenger",
            url: "https://m.me/ranababu17"
          }
          // নোট: পেজ বটের বাটনে ৩টির বেশি বাটন দিলে অনেক সময় এরর আসে। 
          // কল বাটন দরকার হলে উপরের যেকোনো একটি সরিয়ে নিচে এটি যুক্ত করতে পারেন:
          // {
          //   type: "phone_number",
          //   title: "📞 Call Now",
          //   payload: "+8801997127617"
          // }
        ]
      );
    } catch (error) {
      console.error(error);
      await nayan.sendMessage(senderId, { text: "⚠️ Could not send contact info." });
    }
  }
};