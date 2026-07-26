# Bitcoin Block Party - Sponsor/Vendor Ordering Feature

## Summary
Added comprehensive sponsor and vendor management features to the admin dashboard, including custom display ordering and inline content editing.

## Changes Made

### 1. Config File Cleanup (`bitcoinBlockPartyConfig.js`)
**Removed deprecated static data:**
- ❌ Static `itinerary` array (now managed in Firestore)
- ❌ Static `screenings` array (now managed in Firestore)
- ❌ Static `djs` array (now managed in Firestore)
- ❌ Static `sponsors` array (legacy hardcoded data)
- ❌ Static `vendors` array (legacy hardcoded data)

**Added:**
- ✅ `displayOrder` field documentation in Firestore schema comments
- ✅ Clearer comments indicating all data is now managed in Firestore

### 2. Admin Dashboard (`AdminBitcoinBlockPartyView.vue`)

#### New Features:

**A. Display Order Management**
- New "Display Order" column in sponsors/vendors table
- Inline number input for direct order editing
- Up/Down arrow buttons for quick reordering
- Auto-swapping: moving an item to a position swaps it with the item currently there
- Display order only applies to confirmed sponsors/vendors
- Pending items sorted by submission date

**B. Content Editing Modal**
- Edit button for sponsors/vendors: "✏️ Edit Content"
- Modal allows editing:
  - Display Name (shown on website)
  - Short Description (shown on landing and map)
  - Website URL
- Changes update Firestore and reflect immediately on public pages

**C. Sorting Logic**
- Confirmed sponsors/vendors sorted by `displayOrder` (ascending)
- Items without displayOrder default to 999 (appear last)
- Fallback to submission date for items with same displayOrder

#### Technical Implementation:
- New reactive state: `orderSaving` to track save operations
- New reactive state: `editingContent` and `contentForm` for content modal
- Functions:
  - `updateDisplayOrder(applicant, newOrder)` - saves order to Firestore
  - `moveUp(applicant)` - decrements order, swaps with blocker
  - `moveDown(applicant)` - increments order, swaps with blocker
  - `editContent(applicant)` - opens content edit modal
  - `saveContentInfo()` - saves content changes to Firestore
- Grid layout updated from 5 columns to 6 columns to accommodate order column

#### CSS Additions:
- `.col-order` - order column styling
- `.order-controls` - container for input + buttons
- `.order-input` - number input styling
- `.order-buttons` - vertical button container
- `.btn-order-move` - up/down arrow button styling
- `.order-saving` - loading state indicator
- `.btn-edit-content` - blue edit button for content
- `.edit-textarea` - textarea styling for descriptions

### 3. Public Views

#### BitcoinBlockPartyView.vue
**Updated `loadSponsorsAndVendors()` function:**
- Added `sortByOrder()` helper function
- Sponsors and vendors now sorted by `displayOrder` (ascending)
- Items without displayOrder appear last
- Fallback to submission date for same-order items

#### BitcoinBlockPartyMapView.vue  
**Updated `loadSponsorsAndVendors()` function:**
- Same sorting logic as landing page for consistency
- Ensures map markers and popups reflect admin-defined order

## How to Use

### Setting Display Order
1. Go to `/admin/bitcoinblockparty`
2. Click "Sponsors" or "Vendors" tab
3. Filter to "Confirmed" to see only approved items
4. Use one of these methods:
   - **Direct edit:** Type a number (0-999) in the order input and press Enter
   - **Arrow buttons:** Click ▲ to move up, ▼ to move down
5. Changes save automatically to Firestore
6. Order reflects immediately on public pages

### Editing Content
1. In the same admin dashboard
2. Click "✏️ Edit Content" button for any sponsor/vendor
3. Modal opens with current content
4. Edit Display Name, Description, or URL
5. Click "Save Changes"
6. Content updates immediately on public pages

### Order Numbering Best Practices
- Start at 0 for highest priority (presenting sponsor)
- Leave gaps (0, 10, 20, 30...) to make room for insertions
- Items without displayOrder default to 999
- Lower numbers appear first on the website

## Firestore Schema

All sponsor/vendor data in `bbp_applications_2026` collection:

```javascript
{
  role: 'sponsor' | 'vendor',
  tier: 'satoshi' | 'whale' | 'bull' | 'hodler' | 'diamond_hands',
  status: 'pending' | 'confirmed',
  contact_name: string,
  email: string,
  phone: string,
  org_name: string,
  displayName: string,           // NEW: Public-facing name
  shortDescription: string,       // NEW: Public description
  url: string,                    // Website URL
  displayOrder: number,           // NEW: 0-999, controls display order
  submitted_at: timestamp,
  onboarding: {
    sent_at: timestamp,
    sent_by_email: string
  }
}
```

## Migration Notes

- No data migration required - new fields optional
- Existing sponsors/vendors will have `displayOrder = null` (treated as 999)
- Admin can assign order as needed
- Legacy static arrays removed from config - not referenced anymore
