const feedEl = document.getElementById("feed");
const tabTop = document.getElementById("tab-top");
const tabNew = document.getElementById("tab-new");

tabTop.addEventListener("click", () => loadFeed("rating"));
tabNew.addEventListener("click", () => loadFeed("new"));

async function loadFeed(mode) {
  tabTop.classList.toggle("active", mode === "rating");
  tabNew.classList.toggle("active", mode === "new");
  feedEl.innerHTML = `<p class="muted">লোড হচ্ছে...</p>`;

  try {
    let query = db.collection("essays");
    query = mode === "rating"
      ? query.orderBy("avgRating", "desc").orderBy("ratingCount", "desc")
      : query.orderBy("createdAt", "desc");

    const snap = await query.limit(30).get();

    if (snap.empty) {
      feedEl.innerHTML = `<div class="empty-state">এখনো কোনো রচনা প্রকাশিত হয়নি। প্রথম রচনাটি আপনিই লিখুন!</div>`;
      return;
    }

    feedEl.innerHTML = "";
    snap.forEach((doc) => {
      const e = doc.data();
      const created = e.createdAt ? e.createdAt.toDate() : null;
      const excerpt = (e.content || "").slice(0, 160) + ((e.content || "").length > 160 ? "…" : "");
      const rating = e.avgRating ? e.avgRating.toFixed(1) : "নতুন";
      const card = document.createElement("a");
      card.href = `essay.html?id=${doc.id}`;
      card.className = "essay-card";
      card.style.display = "block";
      card.innerHTML = `
        <h3>${escapeHtml(e.title || "শিরোনামহীন")}</h3>
        <div class="essay-meta">
          <span>✍️ ${escapeHtml(e.authorName || "অজানা লেখক")}</span>
          <span>·</span>
          <span>${timeAgo(created)}</span>
          <span>·</span>
          <span class="rating-badge">★ ${rating} ${e.ratingCount ? `(${e.ratingCount})` : ""}</span>
        </div>
        <div class="essay-excerpt">${escapeHtml(excerpt)}</div>
      `;
      feedEl.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    feedEl.innerHTML = `<p class="form-msg error">ডেটা লোড করা যায়নি। Firebase কনফিগ ঠিকভাবে বসানো হয়েছে কিনা এবং Firestore ইনডেক্স তৈরি হয়েছে কিনা দেখুন। (কনসোলে বিস্তারিত এরর দেখা যাবে।)</p>`;
  }
}

loadFeed("rating");
