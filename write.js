let currentUser = null;

requireLogin().then((user) => { currentUser = user; });

document.getElementById("essay-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("msg");
  const submitBtn = document.getElementById("submit-btn");
  msg.textContent = "";
  msg.className = "form-msg";

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) {
    msg.textContent = "শিরোনাম এবং লেখা দুটোই দিন।";
    msg.className = "form-msg error";
    return;
  }

  if (!currentUser) {
    msg.textContent = "লগইন যাচাই করা হচ্ছে, একটু অপেক্ষা করুন এবং আবার চেষ্টা করুন।";
    msg.className = "form-msg error";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "প্রকাশ হচ্ছে...";

  try {
    let authorName = currentUser.email;
    const userDoc = await db.collection("users").doc(currentUser.uid).get();
    if (userDoc.exists) authorName = userDoc.data().name || authorName;

    const docRef = await db.collection("essays").add({
      title,
      content,
      authorId: currentUser.uid,
      authorName,
      avgRating: 0,
      ratingSum: 0,
      ratingCount: 0,
      commentCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    location.href = `essay.html?id=${docRef.id}`;
  } catch (err) {
    console.error(err);
    msg.textContent = "প্রকাশ করা যায়নি। আবার চেষ্টা করুন। (" + err.message + ")";
    msg.className = "form-msg error";
    submitBtn.disabled = false;
    submitBtn.textContent = "প্রকাশ করুন";
  }
});
