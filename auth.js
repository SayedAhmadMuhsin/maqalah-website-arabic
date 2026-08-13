// এই ফাইলটা প্রতিটা পেইজে লোড হয় এবং হেডারের লগইন/লগআউট অংশ নিয়ন্ত্রণ করে

function renderHeaderAuthState() {
  const slot = document.getElementById("auth-slot");
  if (!slot) return;

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      let name = user.email;
      try {
        const doc = await db.collection("users").doc(user.uid).get();
        if (doc.exists) name = doc.data().name || name;
      } catch (e) {}

      slot.innerHTML = `
        <a href="write.html">লিখুন</a>
        <a href="profile.html?uid=${user.uid}">${escapeHtml(name)}</a>
        <button id="logout-btn">লগআউট</button>
      `;
      document.getElementById("logout-btn").addEventListener("click", () => {
        auth.signOut().then(() => location.href = "index.html");
      });
    } else {
      slot.innerHTML = `<a href="login.html" class="btn small">লগইন / সাইনআপ</a>`;
    }
  });
}

// XSS প্রতিরোধের জন্য সাধারণ escape ফাংশন
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((new Date() - date) / 1000);
  const map = [
    [31536000, "বছর"], [2592000, "মাস"], [86400, "দিন"],
    [3600, "ঘণ্টা"], [60, "মিনিট"]
  ];
  for (const [secs, label] of map) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val} ${label} আগে`;
  }
  return "এইমাত্র";
}

function requireLogin(redirectTo = "login.html") {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        location.href = redirectTo;
      } else {
        resolve(user);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", renderHeaderAuthState);
