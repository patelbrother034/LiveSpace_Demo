# 🏨 LiveSpace Pro — Enterprise Co-Living Management SaaS

LiveSpace Pro is a state-of-the-art co-living and hostel management SaaS platform built with **Angular 21**, **PrimeNG 21**, **Tailwind CSS v4**, and **TypeScript 5.9**. The application features an ultra-premium glassmorphism design system, dark mode, rich micro-animations, custom SVG visualizations, and interactive modules across 8 distinct user roles.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation
1. Clone the repository or navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
To start the local development server, run:
```bash
npm run dev
# or
ng serve
```
Once started, open your browser and navigate to `http://localhost:4200/`.

### Building for Production
To compile and optimize the application for production:
```bash
npm run build
```
The output will be stored in the `dist/live-space-pro/` directory.

---

## 🔑 Demo Credentials

You can log in using the credentials below. All accounts use any password (e.g., `demo`). Alternatively, use the **Quick Bypass** button on the Login page.

| Role | Email | Purpose / Core Features |
| :--- | :--- | :--- |
| **Owner** | `owner@demo.com` | Full property management, AI Insights Hub, staff assignment, analytics |
| **Super Admin** | `admin@demo.com` | Multi-tenant billing, feature flags control, system monitoring, audit logs, tickets |
| **Enterprise** | `enterprise@demo.com` | Portfolio analytics, regional breakdown, property comparison radar, brand config |
| **Accountant** | `accountant@demo.com` | GST filing, ledger balance sheets, income/expense tracking, receipt builder |
| **Warden** | `warden@demo.com` | Visitor entry check-in, curfew status violations, emergency alerts broadcast |
| **Caretaker** | `caretaker@demo.com` | Rent entry receipt collections, tenant attendance list, maintenance ticket resolution |
| **Tenant** | `tenant@demo.com` | View room details, pay rent, log maintenance tickets, announcements |
| **Parent** | `parent@demo.com` | Student academic/presence overview, invoice viewing, fee payment history |

---

## 🌟 Portals & Feature Architecture

### 1. Owner Portal (`/owner`)
- **Property Explorer & Floor Plan**: Visual grid of rooms, beds, and vacancy states.
- **AI Insights Hub**: Occupancy forecasting, pricing optimization, fraud scoring, and voice ledger entry.
- **Maintenance & Asset Registry**: Equipment tracking, assignment board (Kanban style).
- **Communication Panel**: Broadcast announcements, manage complaints and feedback.

### 2. Super Admin Portal (`/admin`)
- **Billing & SaaS Revenue**: Monthly recurring revenue (MRR), subscription trends (custom SVG line chart).
- **Feature Flags**: Dynamic toggles for enterprise features per tenant organization.
- **System Monitoring**: Live CPU and memory gauges, audit logs, and support queue.

### 3. Enterprise Portal (`/enterprise`)
- **Regional Analytics**: Multi-property KPIs, regional distribution maps.
- **Property Comparison**: SVG radar chart displaying comparison metrics (occupancy, revenue, collection).
- **Brand & White-Labeling**: Real-time color theme previews, domain config, custom logo upload.
- **KPI Builder**: Drag-and-drop widget layout customizer.

### 4. Accountant Portal (`/accountant`)
- **Ledger & Cash Flow**: Double-entry ledger sheets, inflows vs. outflows SVG bar chart.
- **GST Compliance**: Monthly filing summaries, tax collection table.
- **Receipts & Reports**: P&L, balance sheets, invoice generators.

### 5. Warden Portal (`/warden`)
- **Gate Passes & Visitors**: Digital gate pass system, visitor logs, and check-in dialogs.
- **Curfew Monitoring**: Time compliance tracking, parent notifications.
- **Emergency Management**: Instant broadcasts, protocols (Fire, Medical), and drills logs.

### 6. Caretaker Portal (`/caretaker`)
- **Quick Rent Entry**: Fast search and receipt entry for rent collection.
- **Attendance**: Daily tenant attendance lists, floor-wise summary.
- **Offline Sync & WhatsApp**: Simulated offline caching indicator and WhatsApp link triggers.

### 7. Parent Portal (`/parent`)
- **Student Overview**: Room details, attendance score, gate pass status.
- **Payments**: Invoice viewing, receipt downloads, payment history.

### 8. Tenant Portal (`/tenant`)
- **Resident Dashboard**: Personal room details, outstanding bills, service requests.

---

## 🎨 Technology Stack & Aesthetics

- **Framework**: Angular 21 (Signals, Computed, Standalone Components, `@if` / `@for` control flows)
- **Component Suite**: PrimeNG 21
- **Styling**: Tailwind CSS v4 (Sleek dark mode variables, glassmorphism card components)
- **Database**: Local Storage state management via simulated `CrudService` & seeded JSON databases
- **Aesthetics**: harmonious custom color systems, dynamic micro-animations, interactive SVG charts.
