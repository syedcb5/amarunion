# সেটআপ গাইড (ধাপে ধাপে): GitHub → Supabase → ডোমেইন

> সময় লাগবে আনুমানিক ১–২ ঘণ্টা। ওয়েবসাইট থাকবে GitHub Pages-এ, ডেটাবেস ও অ্যাডমিন লগইন থাকবে Supabase-এ। দুটোরই বিনামূল্যের প্ল্যান দিয়ে শুরু করা যায় (সীমা বদলাতে পারে, ব্যবহারের আগে তাদের সাইটে দেখে নিন)।

## ক. GitHub অ্যাকাউন্ট খোলা
1. https://github.com এ যান → **Sign up**।
2. সংগঠনের একটি ইমেইল (যেমন amaruniondargapasha@gmail.com) দিন, পাসওয়ার্ড দিন, ইউজারনেম বাছুন (যেমন `amarunion`)। ইউজারনেম লিংকে দেখাবে: `amarunion.github.io`।
3. ইমেইলে আসা কোড দিয়ে ভেরিফাই করুন, **Free** প্ল্যান বাছুন।
4. Settings → Password and authentication → **Two-factor authentication** চালু করুন।
5. অ্যাকাউন্ট কোনো ব্যক্তির নামে না করে সংগঠনের ইমেইলে করুন, আর ডেভেলপারকে পরে Collaborator হিসেবে যোগ করুন (Repository → Settings → Collaborators → Add people)।

## খ. রিপজিটরি (প্রজেক্ট ফোল্ডার) তৈরি
1. উপরে ডানে **+ → New repository**।
2. Repository name: `amarunion-website`। **Public** বাছুন (ফ্রি প্ল্যানে GitHub Pages-এর জন্য দরকার; কোডে কোনো গোপন পাসওয়ার্ড নেই)।
3. "Add a README" ইত্যাদি **টিক দেবেন না** → **Create repository**।

## গ. প্রজেক্ট ফাইল আপলোড
**সহজ পদ্ধতি (ব্রাউজার থেকে)**
1. পাওয়া ZIP ফাইলটি কম্পিউটারে **Extract** করুন।
2. রিপজিটরির পেজে **uploading an existing file** লিংকে ক্লিক করুন।
3. Extract করা ফোল্ডারের **ভেতরের সব কিছু** (index.html, admin, js, supabase, docs, config.js, .github, README.md ইত্যাদি) টেনে এনে ছাড়ুন। ফোল্ডার সহ ছাড়ুন, যাতে `.github/workflows/pages.yml` ঠিক জায়গায় থাকে।
4. নিচে **Commit changes** চাপুন।
   - যদি `.github` ফোল্ডার না দেখায় (লুকানো ফাইল দেখার সেটিং বন্ধ থাকলে), ডেভেলপারকে নিচের কমান্ড পদ্ধতি করতে বলুন।

**কমান্ড পদ্ধতি (ডেভেলপারের জন্য)**
```
cd amarunion-project
git init
git add .
git commit -m "Initial project"
git branch -M main
git remote add origin https://github.com/ইউজারনেম/amarunion-website.git
git push -u origin main
```

## ঘ. ওয়েবসাইট চালু (GitHub Pages)
1. Repository → **Settings → Pages**।
2. **Build and deployment → Source:** `GitHub Actions` বাছুন।
3. **Actions** ট্যাবে যান, "Deploy to GitHub Pages" সবুজ টিক (✔) পেলে হয়ে গেছে (১–২ মিনিট)।
4. সাইটের লিংক: `https://ইউজারনেম.github.io/amarunion-website/` আর অ্যাডমিন প্যানেল: `.../admin/`।
5. এই অবস্থায় সাইটটি **লোকাল টেস্ট মোডে** চলে (ডেমো ডেটাসহ, ডেটা শুধু ওই ব্রাউজারে থাকে)। আসল ব্যবহারের আগে ঙ ধাপ করুন।

## ঙ. ডেটাবেস ও অ্যাডমিন লগইন (Supabase)
1. https://supabase.com → **Start your project** → GitHub বা ইমেইল দিয়ে সাইন আপ।
2. **New project:** নাম `amarunion`, একটি শক্তিশালী Database Password (সংরক্ষণ করে রাখুন), Region: Singapore বা Mumbai (বাংলাদেশের কাছাকাছি) → **Create**। ২–৩ মিনিট অপেক্ষা করুন।
3. বাঁয়ে **SQL Editor → New query**। প্রজেক্টের `supabase/schema.sql` ফাইলের পুরো লেখা কপি করে পেস্ট করুন → **Run**। "Success" দেখাতে হবে।
4. বাঁয়ে **Authentication → Users → Add user → Create new user**: আপনার ইমেইল ও পাসওয়ার্ড দিন, **Auto Confirm User** টিক দিন → Create।
5. তৈরি হওয়া ইউজারের **UUID** (User UID) কপি করুন। SQL Editor-এ নিচেরটি নিজের তথ্য দিয়ে Run করুন:
   ```
   insert into public.profiles(user_id,uid,name,role,active)
   values ('এখানে-UUID','আপনার@ইমেইল','আপনার নাম','super',true);
   ```
6. **Authentication → Sign In / Providers → Email:** "Confirm email" **বন্ধ** করুন (প্যানেল থেকে নতুন অ্যাডমিন বানানোর জন্য)।
7. **Project Settings → API:** `Project URL` ও `anon public` key কপি করুন।
8. GitHub-এ `config.js` ফাইল খুলে পেন্সিল ✏️ চাপুন এবং এভাবে বসান:
   ```
   window.AU_CONFIG={supabaseUrl:'https://xxxx.supabase.co',supabaseKey:'eyJ...anon key...',siteUrl:''};
   ```
   → **Commit changes**। ১–২ মিনিটে সাইট নিজে আপডেট হবে। (`anon` key গোপন নয়, ডেটাবেসের নিরাপত্তা Row Level Security দেয়। **`service_role` key কখনো এখানে বসাবেন না।**)

## চ. প্রথমবার ব্যবহার
1. `.../admin/` এ গিয়ে আপনার ইমেইল ও পাসওয়ার্ডে লগইন করুন (উপরে ☁️ ক্লাউড লেখা দেখাবে)।
2. **ডেটা ও ব্যাকআপ → ডিফল্ট কনটেন্ট লোড** চাপুন (প্রকল্প, বোর্ড, সংবাদ, স্পনসর আসবে)।
3. নমুনা নাম, ছবি, ফোন, লোগো, পরীক্ষার তারিখ ও কেন্দ্র আসল তথ্য দিয়ে বদলান।
4. **ব্যবহারকারী** মেনু থেকে এডিটর/পরীক্ষা কর্মকর্তা অ্যাডমিন যোগ করুন, **ভূমিকা ও অনুমতি** থেকে কে কী করতে পারবে ঠিক করুন।
5. পাবলিক সাইট খুলে নিজে একটি টেস্ট রেজিস্ট্রেশন করে দেখুন: নিশ্চিতকরণ পত্র → অ্যাডমিনে অনুমোদন → রোল → অ্যাডমিট কার্ড → নম্বর → ফলাফল।

## ছ. নিজের ডোমেইন (amarunion.org) যুক্ত করা
আগে `new.amarunion.org` দিয়ে পরীক্ষা করা ভালো।
1. Repository → **Settings → Pages → Custom domain:** `new.amarunion.org` লিখে Save।
2. ডোমেইন যেখান থেকে কেনা (রেজিস্ট্রার), সেখানকার DNS সেটিংসে একটি **CNAME** রেকর্ড যোগ করুন: Host/Name = `new`, Value = `ইউজারনেম.github.io`।
3. **Enforce HTTPS** টিক দিন (কয়েক মিনিট লাগতে পারে)।
4. মূল ডোমেইন (`amarunion.org`, www ছাড়া) ব্যবহার করলে DNS-এ চারটি **A** রেকর্ড দিন: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (GitHub-এর ডকুমেন্টেশনে নিশ্চিত করে নিন), আর `www`-এর জন্য CNAME।
5. `config.js`-এ `siteUrl:'https://new.amarunion.org/'` বসান, যাতে অ্যাডমিট কার্ডের QR কোডে সঠিক লিংক যায়।
6. বর্তমান সাইটের ডিজাইনার (S-Tech) বা যিনি ডোমেইন পরিচালনা করেন, তাঁর সহায়তা লাগতে পারে। পুরনো সাইট বন্ধ করার আগে নতুনটি পুরো পরীক্ষা করে নিন।

## জ. পরে কোনো পরিবর্তন করতে
- GitHub-এ ফাইল খুলে ✏️ → Commit করলেই সাইট নিজে আপডেট হয়।
- তথ্য (প্রকল্প, মানুষ, সেটিংস) বদলাতে কোড লাগে না, শুধু অ্যাডমিন প্যানেল ব্যবহার করুন।

## ঝ. চালুর আগে শেষ পরীক্ষা
- [ ] আসল সুপার অ্যাডমিনের পাসওয়ার্ড শক্তিশালী, ডেমো অ্যাকাউন্ট ক্লাউডে নেই।
- [ ] Supabase-এ ডেটাবেস ব্যাকআপের ব্যবস্থা দেখে নিন (প্ল্যান অনুযায়ী আলাদা)।
- [ ] মোবাইল ফোনে (কম দামি Android সহ) রেজিস্ট্রেশন, অ্যাডমিট কার্ড ও ফলাফল পরীক্ষা করুন।
- [ ] A4 কাগজে অ্যাডমিট কার্ড ও নিশ্চিতকরণ পত্র প্রিন্ট দিয়ে দেখুন (Background graphics চালু রেখে)।
- [ ] শিশুদের ছবি ও জন্মসনদ সুরক্ষিত থাকছে, শুধু অনুমোদিত অ্যাডমিন দেখতে পারছে, তা যাচাই করুন।
- [ ] অতিরিক্ত স্প্যাম ঠেকাতে ভবিষ্যতে CAPTCHA (যেমন Cloudflare Turnstile) যোগ করার পরিকল্পনা রাখুন।
