# মাকালাহ (مقالة) — আরবি রচনা প্রকাশের প্ল্যাটফর্ম

এটা একটা ফুল-ফিচার্ড ওয়েবসাইট যেখানে ইউজাররা লগইন/সাইনআপ করে নিজেদের প্রোফাইলে আরবি
রচনা/মাকালাহ প্রকাশ করতে পারবে, অন্যরা তা পড়তে, রেটিং দিতে এবং কমেন্ট করতে পারবে।
রেটিং অনুযায়ী হোমপেজে রচনাগুলো র‍্যাংক করা হয়।

**কোনো টাকা খরচ হবে না** — পুরো সাইট চলবে GitHub Pages (ফ্রি হোস্টিং) + Firebase
(ফ্রি প্ল্যান) দিয়ে।

---

## ধাপ ১: Firebase প্রজেক্ট তৈরি করুন

1. [console.firebase.google.com](https://console.firebase.google.com) এ যান, Google
   অ্যাকাউন্ট দিয়ে লগইন করুন।
2. **Add project** → একটা নাম দিন (যেমন `maqalah-app`) → পরবর্তী ধাপগুলো ডিফল্ট রেখে
   **Create project** ক্লিক করুন।
3. বাম পাশের মেনু থেকে **Build → Authentication** এ যান → **Get started** ক্লিক করুন
   → **Sign-in method** ট্যাবে **Email/Password** সিলেক্ট করে **Enable** করুন → Save করুন।
4. বাম পাশের মেনু থেকে **Build → Firestore Database** এ যান → **Create database** ক্লিক
   করুন → **Start in production mode** সিলেক্ট করে আপনার কাছের একটা location বেছে নিন
   → Enable করুন।
5. প্রজেক্ট ওভারভিউ পেইজে যান (⚙️ আইকন → Project settings) → নিচে **Your apps**
   সেকশনে **</>** (Web) আইকনে ক্লিক করুন → একটা নিকনেম দিন (যেমন `web`) →
   **Register app**।
6. এখন যে `firebaseConfig` অবজেক্টটা দেখাবে (apiKey, authDomain, projectId ইত্যাদি),
   সেটা পুরোপুরি কপি করুন।

## ধাপ ২: কনফিগ বসান

এই প্রজেক্টের `js/firebase-config.js` ফাইলটা খুলুন এবং `firebaseConfig` অবজেক্টের
মানগুলো আপনার Firebase কনসোল থেকে পাওয়া মান দিয়ে প্রতিস্থাপন করুন।

## ধাপ ৩: Firestore সিকিউরিটি রুলস বসান

1. Firebase কনসোলে **Firestore Database → Rules** ট্যাবে যান।
2. এই প্রজেক্টের `firestore.rules` ফাইলের পুরো কনটেন্ট কপি করে রুলস এডিটরে পেস্ট করুন
   (আগের ডিফল্ট রুলস মুছে দিয়ে)।
3. **Publish** ক্লিক করুন।

এই রুলস ছাড়া সাইট চলবে, কিন্তু ডেটাবেস অরক্ষিত/লক থাকবে — তাই এই ধাপটা বাদ দেবেন না।

## ধাপ ৪: Firestore ইনডেক্স

হোমপেজে "সর্বোচ্চ রেটিং" ট্যাব প্রথমবার খুললে Firestore একটা এরর দেখাতে পারে যাতে একটা
লিংক থাকবে ("The query requires an index... Click here to create it")। ব্রাউজারের
Developer Console (F12) খুলে সেই লিংকে ক্লিক করলে Firebase নিজে থেকেই দরকারি ইনডেক্স
তৈরি করার অপশন দেখাবে — শুধু **Create index** ক্লিক করুন, ১-২ মিনিটে রেডি হয়ে যাবে।

## ধাপ ৫: GitHub-এ আপলোড করুন

1. GitHub-এ একটা নতুন রিপোজিটরি তৈরি করুন (যেমন `maqalah-website`)।
2. এই পুরো ফোল্ডারের সব ফাইল সেই রিপোতে পুশ করুন:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: maqalah website"
   git branch -M main
   git remote add origin https://github.com/আপনার-ইউজারনেম/maqalah-website.git
   git push -u origin main
   ```

## ধাপ ৬: GitHub Pages চালু করুন

1. রিপোজিটরির **Settings → Pages** এ যান।
2. **Source** এ **Deploy from a branch** সিলেক্ট করুন।
3. **Branch**: `main`, ফোল্ডার: `/ (root)` সিলেক্ট করে **Save** করুন।
4. কিছুক্ষণ পর একটা লিংক দেখাবে (যেমন `https://আপনার-ইউজারনেম.github.io/maqalah-website/`)
   — এটাই আপনার লাইভ ওয়েবসাইট।

## ধাপ ৭: Firebase-কে আপনার ডোমেইনের অনুমতি দিন

1. Firebase কনসোল → **Authentication → Settings → Authorized domains** এ যান।
2. **Add domain** ক্লিক করে আপনার GitHub Pages ডোমেইন যোগ করুন
   (যেমন `আপনার-ইউজারনেম.github.io`)। এটা না করলে লগইন কাজ করবে না।

---

## সাইটের কাঠামো

```
index.html      → হোমপেজ (রেটিং/নতুন অনুযায়ী রচনার ফিড)
login.html      → লগইন ও সাইনআপ
write.html      → নতুন রচনা লেখা ও প্রকাশ করা
essay.html      → একক রচনা পড়া, রেটিং দেওয়া, কমেন্ট করা
profile.html    → ইউজার প্রোফাইল ও তার সব রচনার তালিকা
css/style.css   → পুরো সাইটের স্টাইল (আরবি লেখার জন্য RTL সাপোর্ট সহ)
js/*.js         → প্রতিটা পেইজের লজিক + Firebase সংযোগ
firestore.rules → ডেটাবেস সিকিউরিটি রুলস
```

## ডেটা মডেল (Firestore)

- `users/{uid}` → `{ name, bio, createdAt }`
- `essays/{essayId}` → `{ title, content, authorId, authorName, avgRating, ratingSum, ratingCount, commentCount, createdAt }`
- `essays/{essayId}/ratings/{uid}` → `{ value: 1-5 }`
- `essays/{essayId}/comments/{commentId}` → `{ text, authorId, authorName, createdAt }`

## ভবিষ্যতে যা যোগ করা যায়

- সার্চ/ফিল্টার (বিষয়/ট্যাগ অনুযায়ী)
- ছবি/প্রোফাইল পিকচার আপলোড (Firebase Storage দিয়ে)
- রচনা এডিট/ডিলিট বাটন (লেখকের জন্য)
- ইমেইল ভেরিফিকেশন
- রিপোর্ট/মডারেশন সিস্টেম

কোনো ধাপে আটকে গেলে বা নতুন ফিচার যোগ করতে চাইলে বলবেন।
