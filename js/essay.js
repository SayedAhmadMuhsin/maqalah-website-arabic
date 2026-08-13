const params = new URLSearchParams(location.search);
const essayId = params.get("id");
const container = document.getElementById("essay-container");
let currentUser = null;
let userExistingRating = 0;

auth.onAuthStateChanged((user) => { currentUser = user; });

async function loadEssay() {
  if (!essayId) {
    container.innerHTML = `<p class="form-msg error">রচনা পাওয়া যায়নি।</p>`;
    return;
  }
  try {
    const doc = await db.collection("essays").doc(essayId).get();
    if (!doc.exists) {
      container.innerHTML = `<p class="form-msg error">এই রচনাটি পাওয়া যায়নি বা মুছে ফেলা হয়েছে।</p>`;
      return;
    }
    const e = doc.data();
    const created = e.createdAt ? e.createdAt.toDate() : null;
    const rating = e.avgRating ? e.avgRating.toFixed(1) : "০";

    container.innerHTML = `
      <h1 class="essay-full-title">${escapeHtml(e.title)}</h1>
      <div class="essay-meta">
        <span>✍️ <a href="profile.html?uid=${e.authorId}">${escapeHtml(e.authorName)}</a></span>
        <span>·</span>
        <span>${timeAgo(created)}</span>
        <span>·</span>
        <span class="rating-badge">★ ${rating} (${e.ratingCount || 0} রেটিং)</span>
      </div>
      <div class="essay-full-body">${escapeHtml(e.content)}</div>

      <div class="rate-box">
        <strong>এই রচনাটি রেট করুন:</strong>
        <div class="stars" id="stars">
          ${[1,2,3,4,5].map(n => `<span data-val="${n}">★</span>`).join("")}
        </div>
        <span class="muted" id="rate-msg"></span>
      </div>

      <div class="comments-section">
        <h3>মন্তব্যসমূহ (<span id="comment-count">${e.commentCount || 0}</span>)</h3>
        <div id="comments-list"><p class="muted">লোড হচ্ছে...</p></div>
        <div class="comment-form" id="comment-form-wrap"></div>
      </div>
    `;

    setupStars();
    loadUserRating();
    loadComments();
    setupCommentForm();
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="form-msg error">রচনা লোড করা যায়নি।</p>`;
  }
}

function setupStars() {
  const starsEl = document.getElementById("stars");
  const spans = starsEl.querySelectorAll("span");
  spans.forEach((span) => {
    span.addEventListener("mouseenter", () => paintStars(spans, +span.dataset.val));
    span.addEventListener("click", () => submitRating(+span.dataset.val));
  });
  starsEl.addEventListener("mouseleave", () => paintStars(spans, userExistingRating));
}

function paintStars(spans, val) {
  spans.forEach((s) => s.classList.toggle("filled", +s.dataset.val <= val));
}

async function loadUserRating() {
  if (!currentUser) {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        const r = await db.collection("essays").doc(essayId).collection("ratings").doc(user.uid).get();
        if (r.exists) {
          userExistingRating = r.data().value;
          paintStars(document.querySelectorAll("#stars span"), userExistingRating);
        }
      }
    });
  }
}

async function submitRating(value) {
  if (!currentUser) {
    document.getElementById("rate-msg").textContent = "রেটিং দিতে লগইন করুন।";
    return;
  }
  const rateMsg = document.getElementById("rate-msg");
  rateMsg.textContent = "সংরক্ষণ হচ্ছে...";

  const essayRef = db.collection("essays").doc(essayId);
  const ratingRef = essayRef.collection("ratings").doc(currentUser.uid);

  try {
    await db.runTransaction(async (t) => {
      const essayDoc = await t.get(essayRef);
      const ratingDoc = await t.get(ratingRef);
      const data = essayDoc.data();

      let sum = data.ratingSum || 0;
      let count = data.ratingCount || 0;

      if (ratingDoc.exists) {
        sum = sum - ratingDoc.data().value + value;
      } else {
        sum += value;
        count += 1;
      }
      const avg = count > 0 ? sum / count : 0;

      t.set(ratingRef, { value, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      t.update(essayRef, { ratingSum: sum, ratingCount: count, avgRating: avg });
    });

    userExistingRating = value;
    rateMsg.textContent = "ধন্যবাদ! আপনার রেটিং সংরক্ষণ হয়েছে।";
    setTimeout(loadEssay, 800);
  } catch (err) {
    console.error(err);
    rateMsg.textContent = "রেটিং সংরক্ষণ করা যায়নি।";
  }
}

async function loadComments() {
  const listEl = document.getElementById("comments-list");
  try {
    const snap = await db.collection("essays").doc(essayId)
      .collection("comments").orderBy("createdAt", "desc").limit(50).get();

    if (snap.empty) {
      listEl.innerHTML = `<p class="muted">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি করুন।</p>`;
      return;
    }
    listEl.innerHTML = "";
    snap.forEach((doc) => {
      const c = doc.data();
      const created = c.createdAt ? c.createdAt.toDate() : null;
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <div class="comment-meta">${escapeHtml(c.authorName)} · ${timeAgo(created)}</div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      `;
      listEl.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<p class="form-msg error">মন্তব্য লোড করা যায়নি।</p>`;
  }
}

function setupCommentForm() {
  const wrap = document.getElementById("comment-form-wrap");
  auth.onAuthStateChanged((user) => {
    if (user) {
      wrap.innerHTML = `
        <textarea id="comment-text" rows="2" placeholder="আপনার মন্তব্য লিখুন..."></textarea>
        <button class="btn" id="comment-submit">মন্তব্য করুন</button>
      `;
      document.getElementById("comment-submit").addEventListener("click", async () => {
        const text = document.getElementById("comment-text").value.trim();
        if (!text) return;
        const btn = document.getElementById("comment-submit");
        btn.disabled = true;

        let authorName = user.email;
        const userDoc = await db.collection("users").doc(user.uid).get();
        if (userDoc.exists) authorName = userDoc.data().name || authorName;

        try {
          await db.collection("essays").doc(essayId).collection("comments").add({
            text, authorId: user.uid, authorName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          await db.collection("essays").doc(essayId).update({
            commentCount: firebase.firestore.FieldValue.increment(1)
          });
          document.getElementById("comment-text").value = "";
          loadComments();
          const cc = document.getElementById("comment-count");
          cc.textContent = (parseInt(cc.textContent) || 0) + 1;
        } catch (err) {
          console.error(err);
        }
        btn.disabled = false;
      });
    } else {
      wrap.innerHTML = `<p class="muted">মন্তব্য করতে <a href="login.html">লগইন</a> করুন।</p>`;
    }
  });
}

loadEssay();
