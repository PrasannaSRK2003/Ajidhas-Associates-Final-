# WordPress CRM & Headless Content Management System

A custom WordPress plugin and React Headless integration has been built for **Ajidhas & Associates**. This system allows site owners to manage all text content, images, background images, portfolio projects, and client inquiries from WordPress while keeping the frontend UI **100% untouched and pristine**.

---

## 🏛️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   WordPress Admin Panel                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🌐 General & Branding: Logos, Title, Phone, Email     │  │
│  │ 🏠 Home: Headline, Subtitle, Hero Background Image    │  │
│  │ 🏛️ Architecture: Headers, Slideshow BGs             │  │
│  │ 🎨 Art Studio: Artist Bio, Profile Img, Subtitles     │  │
│  │ 📥 Leads CRM: Inquiry Database, Status & Emails       │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      WordPress REST API
              `/wp-json/ajidhas/v1/{endpoint}`
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    React Frontend (Vite)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ <ContentProvider>                                     │  │
│  │   ├── Dynamic Texts (Title, Bios, Contact Info)       │  │
│  │   ├── Dynamic Images & Background Images (WP Media)  │  │
│  │   └── High-Resilience Fallback to Local Assets       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 What Has Been Created & Configured

### 1. WordPress Plugin (`wordpress-plugin/ajidhas-crm/ajidhas-crm.php`)
- **Plugin Name**: `Ajidhas & Associates CRM & Headless Content Manager`
- **WP Admin Panel**: Accessible via **WP Admin → Ajidhas CRM**.
- **Media Picker**: Integrated native WordPress Media Library uploader buttons for all image and background image fields.
- **Lead CRM Table**: Custom database table (`wp_ajidhas_inquiries`) tracking lead submissions with statuses (`New`, `Contacted`, `In Progress`, `Closed`), admin notification emails, and client auto-replies.
- **FluentCRM Support**: Automatically syncs leads with FluentCRM when installed.
- **REST Endpoints**:
  - `GET /wp-json/ajidhas/v1/content`: Returns JSON with all texts, images, and background image mappings.
  - `POST /wp-json/ajidhas/v1/inquiry`: Accepts form inquiries, saves lead record in CRM, and sends emails.
  - `GET /wp-json/ajidhas/v1/projects`: Portfolio projects query.
  - `GET /wp-json/ajidhas/v1/inquiries`: Fetch CRM leads in admin.

### 2. React API Service (`src/services/api.js`)
- Interfaces with the WordPress REST API for content fetching and real-time inquiry form submissions.

### 3. React Content Provider & Hook (`src/context/ContentContext.jsx`)
- Loads dynamic text and background images from WordPress.
- Provides `getText()`, `getImage()`, and `submitInquiry()` across all pages.
- **High-Resilience Fallback**: If WordPress is not running, it automatically uses the existing local static images and text without breaking layout or animations.

### 4. Updated Page Components
- `src/pages/Home/Home.jsx`: Dynamic logo, hero copy, and hero background image.
- `src/pages/Contact/Contact.jsx`: Dynamic contact copy/address/phone, background image, and live inquiry submission to WP CRM with feedback states.
- `src/pages/ArchitectureLanding/ArchitectureInquiry.jsx`: Modal form with real-time lead submission to WP CRM.
- `src/pages/ArchitectureLanding/ArchitectureLanding.jsx`: Dynamic page header and background slideshow images from WP.

---

## 🚀 How to Activate WordPress Plugin

1. Copy `wordpress-plugin/ajidhas-crm` folder into your WordPress site's `wp-content/plugins/` directory.
2. In WordPress Admin, go to **Plugins → Installed Plugins** and click **Activate** on **Ajidhas & Associates CRM & Headless Content Manager**.
3. Open **WP Admin → Ajidhas CRM → Text & Media Manager** to edit site copy or select background images using the WordPress Media Library.
4. Ensure `.env` in the React app points to your WordPress API URL:
   ```env
   VITE_WP_API_URL=http://localhost/wp-json/ajidhas/v1
   ```
