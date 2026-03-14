# RudeBooks — Shared Home Library Manager

A mobile-first web app to manage a shared home library: owned books with physical locations, wishlist, ISBN scanning, and multi-user support.

---

## 1. Functional & Technical Architecture

### Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | RSC, API routes, layouts |
| Database | MongoDB + Mongoose | Flexible schema, good for book data |
| Auth | NextAuth.js v4 | Session management, multi-user |
| Styling | Tailwind CSS | Utility-first, mobile-first |
| Validation | Zod | Type-safe schema validation |
| Data Fetching | SWR | Client-side caching + revalidation |
| Icons | Lucide React | Clean, consistent icon set |
| Barcode | @zxing/library | Camera-based ISBN scanning |
| URL Scraping | cheerio + node-fetch | Wishlist from product pages |
| Fonts | Space Grotesk + DM Sans | Modern editorial feel |

### Architecture Overview

```
Browser (mobile-first)
    │
    ▼
Next.js App Router
    ├── Route Groups
    │   ├── (auth)   — unauthenticated pages
    │   └── (app)    — protected pages (require session)
    │
    ├── API Routes (/api/*)
    │   ├── auth/[...nextauth]
    │   ├── books/
    │   ├── wishlist/
    │   ├── locations/
    │   ├── users/
    │   ├── isbn/[isbn]      — ISBN lookup via Open Library API
    │   └── scrape           — extract metadata from product URLs
    │
    └── lib/
        ├── db.ts            — MongoDB singleton connection
        ├── auth.ts          — NextAuth config
        └── validators/      — Zod schemas
```

### Multi-User & Auth Flow

- Registration creates a new Library and assigns user as `admin`
- Invite link / code adds members with `member` role
- Admin can manage locations, users, and library settings
- Member can add/edit books and wishlist items
- JWT sessions with library context in token payload

---

## 2. MongoDB Data Model

### `users`
```ts
{
  _id: ObjectId,
  name: string,
  email: string,          // unique
  passwordHash: string,
  avatar?: string,
  libraryId: ObjectId,    // primary library
  role: 'admin' | 'member',
  createdAt: Date
}
```

### `libraries`
```ts
{
  _id: ObjectId,
  name: string,
  members: [{ userId: ObjectId, role: 'admin' | 'member' }],
  inviteCode: string,     // unique, share to invite members
  settings: {
    defaultCurrency: string,
    timezone: string
  },
  createdAt: Date
}
```

### `locations`
```ts
{
  _id: ObjectId,
  libraryId: ObjectId,
  name: string,           // e.g. "Living Room — Left Shelf"
  description?: string,
  parentId?: ObjectId,    // optional nesting (room → shelf → row)
  createdAt: Date
}
```

### `books`
```ts
{
  _id: ObjectId,
  libraryId: ObjectId,
  title: string,
  authors: string[],
  isbn?: string,
  isbn13?: string,
  cover?: string,         // URL to cover image
  description?: string,
  publisher?: string,
  publishedYear?: number,
  pageCount?: number,
  language?: string,
  genres?: string[],
  locationId?: ObjectId,  // physical location
  locationNote?: string,  // e.g. "second row, blue spine"
  status: 'owned' | 'lent',
  lentTo?: string,
  lentAt?: Date,
  addedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### `wishlistItems`
```ts
{
  _id: ObjectId,
  libraryId: ObjectId,
  title: string,
  authors?: string[],
  isbn?: string,
  cover?: string,
  description?: string,
  sourceUrl?: string,     // original product page URL
  price?: number,
  currency?: string,
  priority: 'low' | 'medium' | 'high',
  status: 'wanted' | 'purchased',
  addedBy: ObjectId,
  notes?: string,
  createdAt: Date
}
```

### `activityLogs` (optional)
```ts
{
  _id: ObjectId,
  libraryId: ObjectId,
  userId: ObjectId,
  action: 'add_book' | 'remove_book' | 'move_book' | 'add_wishlist' | 'purchase_wishlist' | ...,
  entityType: 'book' | 'wishlistItem' | 'location' | 'user',
  entityId: ObjectId,
  metadata?: Record<string, unknown>,
  createdAt: Date
}
```

### Indexes

```js
// books — search + filter
{ libraryId: 1, createdAt: -1 }
{ libraryId: 1, locationId: 1 }
{ title: 'text', authors: 'text', isbn: 'text' }  // full-text

// wishlistItems
{ libraryId: 1, status: 1, createdAt: -1 }

// activityLogs
{ libraryId: 1, createdAt: -1 }
```

---

## 3. Page Map & Component Structure

### Routes

```
/                          — redirect to /dashboard or /signin
/signin                    — sign in
/signup                    — create account + library
/dashboard                 — stats: totals, recent activity, wishlist preview
/books                     — book list: search, filter by location
/books/add                 — add book: manual form or ISBN scan tab
/books/[id]                — book detail: info, location, edit/delete
/wishlist                  — wishlist: filter by priority/status
/wishlist/add              — add wishlist item: manual or from URL
/wishlist/[id]             — wishlist item detail
/locations                 — manage locations (admin)
/settings                  — library name, invite code, members (admin)
/profile                   — user profile, change password
```

### Component Tree

```
app/
└── (app)/layout.tsx
    └── AppShell
        ├── TopBar          — library name, user menu
        ├── {children}
        └── BottomNav       — Dashboard | Books | Wishlist | Settings

components/
├── ui/
│   ├── Button
│   ├── Card
│   ├── Input / Textarea
│   ├── Badge
│   ├── Sheet (bottom drawer)
│   ├── EmptyState
│   └── Spinner
├── books/
│   ├── BookCard            — cover, title, author, location badge
│   ├── BookList
│   ├── BookForm            — add/edit form (Zod-validated)
│   ├── IsbnScanner         — camera stream + ZXing decoder
│   └── LocationPicker      — select from available locations
├── wishlist/
│   ├── WishlistCard
│   ├── WishlistList
│   ├── WishlistForm        — manual add
│   └── UrlImport           — paste URL → fetch metadata → prefill form
├── dashboard/
│   ├── StatsGrid
│   ├── RecentBooks
│   └── WishlistPreview
└── layout/
    ├── TopBar
    ├── BottomNav
    └── PageHeader
```

---

## 4. Implementation Plan

### Phase 1 — Foundation
- [x] Project scaffold (Next.js, Tailwind, TypeScript)
- [ ] MongoDB connection + Mongoose models
- [ ] NextAuth (credentials provider, JWT)
- [ ] Signup flow (creates User + Library)
- [ ] App shell: TopBar + BottomNav
- [ ] Route protection (middleware)

### Phase 2 — Books
- [ ] Books API (CRUD)
- [ ] Book list page with search
- [ ] Book add — manual form
- [ ] ISBN scanner (ZXing + Open Library API lookup)
- [ ] Book detail page
- [ ] Locations CRUD (admin)

### Phase 3 — Wishlist
- [ ] Wishlist API (CRUD)
- [ ] Wishlist list + filter page
- [ ] Add wishlist — manual form
- [ ] Add wishlist — URL import (scrape metadata)
- [ ] Mark as purchased → promote to books

### Phase 4 — Polish
- [ ] Dashboard stats
- [ ] Activity log
- [ ] Settings page (members, invite code)
- [ ] Profile page
- [ ] PWA manifest

---

## 5. UI/UX Direction

### Design Principles (uupm-inspired)

- **Mobile-first**: bottom navigation, full-width cards, large tap targets (min 44px)
- **Glass-morphism cards**: `backdrop-blur`, subtle borders, layered depth
- **Gradient accents**: blue-to-indigo primary, amber secondary (warm, book-like)
- **Fast add flow**: floating `+` button → bottom sheet → camera or form
- **Clear separation**: books and wishlist have distinct visual identities

### Color System

```css
--primary:        221 83% 53%   /* #2563EB blue    */
--primary-end:    239 84% 67%   /* #6366F1 indigo  */
--accent:          38 92% 50%   /* #F59E0B amber   */
--background:     220 14% 96%   /* off-white       */
--surface:          0  0% 100%  /* white cards     */
--border:         220 13% 91%
--text:           222 47% 11%   /* near-black      */
--muted:          215 16% 47%
```

### Typography

- Headings: **Space Grotesk** 700 — modern, editorial
- Body: **DM Sans** 400/500 — readable, clean
- Mono (ISBN): **JetBrains Mono**

---

## 6. Getting Started

```bash
cp .env.local.example .env.local
# fill in MONGODB_URI, NEXTAUTH_SECRET

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/rudebooks
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
