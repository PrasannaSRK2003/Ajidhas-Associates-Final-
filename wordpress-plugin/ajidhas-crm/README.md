# Ajidhas & Associates — WordPress CRM & Headless Content Manager Plugin

This WordPress plugin turns any standard WordPress installation into a full-featured Headless CMS & Lead Management CRM for the Ajidhas & Associates React website.

## 🌟 Key Features

1. **Text & Copy Manager**: Manage all headlines, subheadings, text blocks, titles, email addresses, phone numbers, and location details directly in WP Admin.
2. **Background Image Manager**: Pick/Upload page background images (Home, Architecture night/day/interior slides, Art Studio background, Contact background) via native WordPress Media Library!
3. **Media & Image Picker**: Select logo images, artist profiles, team member portraits, and gallery images.
4. **Lead CRM & Inquiry Dashboard**:
   - Saves contact form submissions from the React app directly into WordPress database in real-time.
   - Built-in WP Admin CRM table to track lead statuses (`New`, `Contacted`, `In Progress`, `Closed`).
   - Automated email notification to site admin & professional auto-reply email sent to client.
   - Automatic sync with **FluentCRM** (if installed).
5. **Projects Portfolio Manager**: Custom Post Type `ajidhas_project` with custom fields for categories, client, year, location, thumbnail, and background image.
6. **Zero UI Impact / High Resilience**: If WordPress server is offline, the React website seamlessly defaults to standard local assets without breaking layout, styling, GSAP animations, or visual elements!

---

## 🛠️ Quick Installation Guide

1. **Copy Plugin Folder to WordPress**:
   Copy the `ajidhas-crm` folder into your WordPress site directory:
   ```
   wp-content/plugins/ajidhas-crm/
   ```

2. **Activate in WordPress Admin**:
   - Go to **WP Admin → Plugins → Installed Plugins**.
   - Find **Ajidhas & Associates CRM & Headless Content Manager**.
   - Click **Activate**.

3. **Configure Environment Variable in React**:
   In your React root directory, edit or create `.env`:
   ```env
   VITE_WP_API_URL=http://localhost/wp-json/ajidhas/v1
   # Or your live WordPress domain:
   # VITE_WP_API_URL=https://your-wordpress-domain.com/wp-json/ajidhas/v1
   ```

---

## 📡 REST API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/wp-json/ajidhas/v1/content` | `GET` | Returns all texts, images, and background image mapping JSON |
| `/wp-json/ajidhas/v1/content` | `POST` | Update site content (Requires WP Auth / Admin session) |
| `/wp-json/ajidhas/v1/projects` | `GET` | Returns portfolio project items |
| `/wp-json/ajidhas/v1/inquiry` | `POST` | Submits new client lead/inquiry from React form |
| `/wp-json/ajidhas/v1/inquiries` | `GET` | Fetch inquiry leads (Admin authenticated) |

---

## 📥 Lead CRM Workflow

```
React Frontend Form Submit ──POST──► /wp-json/ajidhas/v1/inquiry
                                             │
                                             ├──► Saves Lead in WP Database (ajidhas_inquiries)
                                             ├──► Sends Admin Alert Email
                                             ├──► Sends Client Auto-Reply Email
                                             └──► Syncs to FluentCRM (if active)
```
