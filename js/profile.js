const params = new URLSearchParams(location.search);
const profileUid = params.get("uid");
const container = document.getElementById("profile-container");
let viewer = null;

auth.onAuthStateChanged((user) => { viewer = user; loadProfile(); });

async function loadProfile() {
  if (!profileUid) {
    container.innerHTML = `<p class="form-msg error">প্রোফাইল পাওয়া যায়নি।</p>`;
    return;
  }
  try {
    const userDoc = await db.collection("users").doc(profileUid).get();
    if (!userDoc.exists) {
      container.innerHTML = `<p class="form-msg error">এই ব্যবহারকারী পাওয়া যায়নি।</p>`;
      return;
    }
    const u = userDoc.data();
    const isOwner = viewer && viewer.uid === profileUid;
    const initial = (u.name || "?").trim().charAt(0).toUpperCase();

    const essaysSnap = await db.collection("essays")
      .where("authorId", "==", profileUid)
      .orderBy("createdAt", "desc")
      .get();

    let totalRatingSum = 0, totalRatingCount = 0;
    essaysSnap.forEach((doc) => {
      const e = doc.data();
      totalRatingSum += e.ratingSum || 0;
      totalRatingCount += e.ratingCount || 0;
    });
    const overallAvg = totalRatingCount > 0 ? (totalRatingSum / totalRatingCount).toFixed(1) : "—";

    container.innerHTML = `
      <div class="profile-header">
        <div class="avatar">${escapeHtml(initial)}</div>
        <h2>${escapeHtml(u.name)}</h2>
        <p class="profile-bio" id="bio-display">${escapeHtml(u.bio || (isOwner ? "নিজের সম্পর্কে কিছু লিখুন..." : ""))}</p>
        ${isOwner ? `<button class="btn secondary small" id="edit-bio-btn">বায়ো এডিট করুন</button>` : ""}
        <div class="profile-stats">
          <div><b>${essaysSnap.size}</b>রচনা</div>
          <div><b>★ ${overallAvg}</b>গড় রেটিং</div>
          <div><b>${totalRatingCount}</b>মোট রেটিং</div>
        </div>
      </div>

      <h1 class="page-title">${isOwner ? "আপনার রচনাসমূহ" : escapeHtml(u.name) + "-এর রচনাসমূহ"}</h1>
      <div id="essay-list"></div>
    `;

    if (isOwner) {
      document.getElementById("edit-bio-btn").addEventListener("click", () => enableBioEdit(u.bio || ""));
    }

    const listEl = document.getElementById("essay-list");
    if (essaysSnap.empty) {
      listEl.innerHTML = `<div class="empty-state">${isOwner ? "আপনি এখনো কোনো রচনা প্রকাশ করেননি।" : "এই ব্যবহারকারী এখনো কোনো রচনা প্রকাশ করেননি।"}</div>`;
    } else {
      essaysSnap.forEach((doc) => {
        const e = doc.data();
        const created = e.createdAt ? e.createdAt.toDate() : null;
        const excerpt = (e.content || "").slice(0, 140) + ((e.content || "").length > 140 ? "…" : "");
        const rating = e.avgRating ? e.avgRating.toFixed(1) : "নতুন";
        const card = document.createElement("a");
        card.href = `essay.html?id=${doc.id}`;
        card.className = "essay-card";
        card.style.display = "block";
        card.innerHTML = `
          <h3>${escapeHtml(e.title || "শিরোনামহীন")}</h3>
          <div class="essay-meta">
            <span>${timeAgo(created)}</span>
            <span>·</span>
            <span class="rating-badge">★ ${rating} ${e.ratingCount ? `(${e.ratingCount})` : ""}</span>
          </div>
          <div class="essay-excerpt">${escapeHtml(excerpt)}</div>
        `;
        listEl.appendChild(card);
      });
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="form-msg error">প্রোফাইল লোড করা যায়নি।</p>`;
  }
}

function enableBioEdit(currentBio) {
  const display = document.getElementById("bio-display");
  display.outerHTML = `
    <div style="max-width:480px;margin:8px auto 0;">
      <textarea id="bio-input" rows="3" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;font:inherit;">${escapeHtml(currentBio)}</textarea>
      <button class="btn small" id="save-bio-btn" style="margin-top:6px;">সংরক্ষণ করুন</button>
    </div>
  `;
  document.getElementById("save-bio-btn").addEventListener("click", async () => {
    const newBio = document.getElementById("bio-input").value.trim();
    await db.collection("users").doc(profileUid).update({ bio: newBio });
    loadProfile();
  });
}
