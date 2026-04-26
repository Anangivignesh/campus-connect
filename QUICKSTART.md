# ⚡ Quick Start Guide

Get Campus Connect running in 10 minutes!

## 🎯 Choose Your Path

### Path A: Local Development (Mock Data)
**Perfect for:** Frontend development, UI testing, learning the codebase

```bash
# 1. Clone and install
git clone https://github.com/Anangivignesh/campus-connect.git
cd campus-connect
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# Visit: http://localhost:5173

# 4. Login with mock credentials
# Email: vignesh@gmail.com
# Password: vignesh12
```

✅ **Done!** You're running with mock data. No backend needed.

---

### Path B: Full Stack (Supabase + Vercel)
**Perfect for:** Production deployment, real users, full features

#### Prerequisites
- GitHub account
- Vercel account (free)
- Supabase account (free)

#### Step 1: Supabase Setup (5 minutes)

1. **Create Project**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Name: `campus-connect`
   - Save the database password!

2. **Run Database Script**
   - Open SQL Editor in Supabase
   - Copy the entire SQL script from `DEPLOYMENT.md` (Part 1, Step 3)
   - Click "Run"

3. **Get API Keys**
   - Go to Settings → API
   - Copy:
     - Project URL
     - `anon` public key

4. **Create Test User**
   - Go to Authentication → Users
   - Click "Add User"
   - Email: `vignesh@gmail.com`
   - Password: `vignesh12`
   - Check "Auto Confirm User"

#### Step 2: Deploy to Vercel (3 minutes)

1. **Push to GitHub** (if not already)
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/campus-connect.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Framework: Vite
   - Add environment variables:
     ```
     VITE_SUPABASE_URL=https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGc...
     ```
   - Click "Deploy"

3. **Update Supabase URLs**
   - Copy your Vercel URL: `https://your-app.vercel.app`
   - Go to Supabase → Authentication → URL Configuration
   - Add to Redirect URLs: `https://your-app.vercel.app/**`

#### Step 3: Connect Frontend (2 minutes)

```bash
# 1. Install Supabase client
npm install @supabase/supabase-js

# 2. Create .env.local
cp .env.example .env.local

# 3. Add your Supabase credentials to .env.local
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# 4. Follow DEPLOYMENT.md Part 3 to update auth store
```

✅ **Done!** Your app is live with real authentication!

---

## 🚀 What's Next?

### For Developers
1. Read `DEVELOPMENT.md` for architecture details
2. Explore the codebase structure
3. Check out the Zustand stores in `src/stores/`
4. Review TypeScript types in `src/types/`

### For Production
1. Follow `DEPLOYMENT.md` for complete setup
2. Migrate remaining stores to Supabase (see `PHASE2_GUIDE.md`)
3. Set up Realtime subscriptions
4. Configure email templates in Supabase
5. Add custom domain in Vercel

### For Learning
1. Try modifying the UI components
2. Add a new page or feature
3. Experiment with Zustand state management
4. Customize the Tailwind theme

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview and features |
| `QUICKSTART.md` | ⭐ You are here - Get started fast |
| `DEVELOPMENT.md` | Developer guide and architecture |
| `DEPLOYMENT.md` | Complete Vercel + Supabase setup |
| `PHASE2_GUIDE.md` | Migrate from mock data to Supabase |

---

## 🆘 Need Help?

### Common Issues

**Q: Port 5173 already in use**
```bash
# Kill the process or use a different port
npm run dev -- --port 3000
```

**Q: Module not found errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Q: Build fails**
```bash
# Check for TypeScript errors
npm run build
```

**Q: Login not working with Supabase**
- Check environment variables are set
- Verify user exists in Supabase dashboard
- Check browser console for errors

### Get Support

- 📖 Check the documentation files
- 🐛 Open an issue on GitHub
- 💬 Review existing issues for solutions

---

## ✅ Quick Checklist

### Local Development
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can login with mock credentials

### Production Deployment
- [ ] Supabase project created
- [ ] Database schema created
- [ ] Test user created
- [ ] Vercel project deployed
- [ ] Environment variables set
- [ ] Can login on production URL

---

**Happy coding! 🎉**
