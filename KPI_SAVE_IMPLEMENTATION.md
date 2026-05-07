# KPI Save to Database Implementation

## Overview
This implementation enables managers to create new KPIs through a modal form, save them to the database, and display them in the Manage KPI Page.

## Changes Made

### 1. Backend Changes

#### A. Updated Kpi Model (`backend/models/Kpi.js`)
- Added new fields to store complete KPI information:
  - `title`: String (required) - KPI title
  - `desc`: String - KPI description
  - `target`: Number (required) - Target value
  - `progress`: Number - Current progress (default 0)
  - `status`: Enum - pending, in-progress, achieved, overdue (default: pending)
  - `owner`: String - Staff member assigned (default: staff)
  - `staff`: String - Staff member name
  - `dept`: String - Department
  - `startDate`: String - Start date
  - `deadline`: String - Deadline date

#### B. Enhanced KPI Routes (`backend/routes/kpiRoutes.js`)
Added complete CRUD operations:
- **GET /api/kpis** - Fetch all KPIs
- **POST /api/kpis** - Create new KPI
- **GET /api/kpis/:id** - Get single KPI by ID
- **PUT /api/kpis/:id** - Update KPI by ID
- **DELETE /api/kpis/:id** - Delete KPI by ID

### 2. Frontend Changes

#### A. Updated KpiManagePage Component (`src/components/manager/KpiManagePage.js`)
**New Features:**
- Added axios for API calls
- Added loading state management (`isSaving` state)
- Updated `saveKPI()` function to:
  - Send POST request for new KPIs
  - Send PUT request for editing existing KPIs
  - Handle API responses and update local state
  - Show error alerts on failure
- Updated `deleteKPI()` function to:
  - Send DELETE request to backend
  - Remove from local state after successful deletion
  - Show error alerts on failure
- Updated table rendering to:
  - Use `_id` (MongoDB ID) instead of `num`
  - Calculate index dynamically for display
  - Support status: 'pending' in styling
- Added disabled state to save button during API calls
- Shows "Saving..." text during request

#### B. Updated DashboardManager (`src/pages/DashboardManager.js`)
- Modified `fetchKpis()` function to:
  - Map MongoDB IDs (`_id`) instead of generating `num`
  - Include all KPI fields (title, desc, staff, dept, target, startDate, deadline)
  - Use actual description from database instead of generating "Progress X/Y"
  - Use database status field
  - Store `progress` value in KPI object

#### C. Updated DashboardPage Component (`src/components/manager/DashboardPage.js`)
- Updated table row rendering to:
  - Use `kpi._id` as key instead of index
  - Calculate row number dynamically instead of using `kpi.num`
  - Works with new MongoDB-based KPI structure

### 3. Data Flow

```
Manager clicks "New KPI" button
    ↓
Modal form opens
    ↓
Manager fills in form (title, desc, dept, staff, target, startDate, deadline)
    ↓
Manager clicks "Create KPI" button
    ↓
Frontend validates required fields
    ↓
Frontend sends POST request to /api/kpis with form data
    ↓
Backend creates KPI in MongoDB
    ↓
Backend returns saved KPI with _id
    ↓
Frontend updates local KPI list
    ↓
KPI appears in table immediately
```

### 4. API Request/Response Examples

**Create KPI:**
```
POST /api/kpis
Content-Type: application/json

{
  "title": "Sales Target Q1",
  "desc": "Achieve 500K in Q1 sales",
  "target": 500000,
  "staff": "John Doe",
  "dept": "Sales",
  "startDate": "2026-01-01",
  "deadline": "2026-03-31",
  "status": "pending"
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Sales Target Q1",
  "desc": "Achieve 500K in Q1 sales",
  "target": 500000,
  "progress": 0,
  "status": "pending",
  "owner": "staff",
  "staff": "John Doe",
  "dept": "Sales",
  "startDate": "2026-01-01",
  "deadline": "2026-03-31",
  "createdAt": "2026-05-07T10:30:00Z",
  "updatedAt": "2026-05-07T10:30:00Z"
}
```

**Update KPI:**
```
PUT /api/kpis/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "title": "Sales Target Q1 Updated",
  "target": 600000,
  ...
}
```

**Delete KPI:**
```
DELETE /api/kpis/507f1f77bcf86cd799439011
```

## Testing Steps

1. **Create a New KPI:**
   - Navigate to Manage KPI Page
   - Click "New KPI" button
   - Fill in all required fields (Title, Department, Staff Member)
   - Click "Create KPI"
   - Verify KPI appears in table
   - Check database for saved record

2. **Edit a KPI:**
   - Click edit icon (pencil) on a KPI row
   - Modify any fields
   - Click "Save Changes"
   - Verify changes appear in table

3. **Delete a KPI:**
   - Click delete icon (trash) on a KPI row
   - Confirm deletion
   - Verify KPI is removed from table and database

4. **Dashboard Display:**
   - Navigate to Dashboard
   - Verify new KPIs appear in KPI list
   - Verify status calculations work correctly
   - Verify charts update with new KPI data

## Status Values
- `pending` - New KPI not yet started
- `in-progress` - KPI currently being worked on
- `achieved` - Progress >= Target
- `overdue` - KPI past deadline without achievement

## Error Handling
- Form validation prevents submission of incomplete data
- API errors display user-friendly alerts
- Failed requests don't modify local state
- Duplicate submissions prevented with `isSaving` flag during requests
