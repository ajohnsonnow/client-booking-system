# Render Deployment Setup

## Environment Variables (SAVE THESE!)

Copy these exactly when recreating your Render service:

```
JWT_SECRET=fd234b430cfd782303427a284210ed28a4cb53f4cecbde57d49b70f41f37a751
ENCRYPTION_KEY=fe54ebb745d7e2bee86c21e688dacedd9757b3c056f17f6886480a131e22fe26
ADMIN_PASSWORD=adacc6848de69c08678cf94652ea34c2
```

---

## Steps to Recreate Service

### 1. Delete Old Service
- Go to: https://dashboard.render.com
- Click: `ravi-sacred-healing-cms`
- Settings → Scroll to bottom → **Delete Service**
- Type service name to confirm

### 2. Create New Service
- Dashboard → **New +** → **Web Service**
- **Connect Repository:** `ajohnsonnow/client-booking-system`
- **Name:** `ravi-sacred-healing` ✅
- **Branch:** `ravi-sacred-healing`
- **Root Directory:** (leave blank)
- **Runtime:** Node
- **Build Command:** `npm install; npm run build`
- **Start Command:** `npm run start`

### 3. Add Environment Variables
Click **Add Environment Variable** for each:

| Key | Value |
|-----|-------|
| `JWT_SECRET` | `fd234b430cfd782303427a284210ed28a4cb53f4cecbde57d49b70f41f37a751` |
| `ENCRYPTION_KEY` | `fe54ebb745d7e2bee86c21e688dacedd9757b3c056f17f6886480a131e22fe26` |
| `ADMIN_PASSWORD` | `adacc6848de69c08678cf94652ea34c2` |

### 4. Deploy
- Click **Create Web Service**
- Wait 2-3 minutes for build
- Your new URL: `https://ravi-sacred-healing.onrender.com` 🎯

---

## After Deployment

**Login to Admin:**
- URL: `https://ravi-sacred-healing.onrender.com/admin.html`
- Password: `adacc6848de69c08678cf94652ea34c2`

**Update any saved bookmarks/links to the new URL!**

---

## Troubleshooting

If deployment fails:
1. Check all 3 environment variables are set correctly
2. Verify branch is `ravi-sacred-healing`
3. Check build logs in Render dashboard
