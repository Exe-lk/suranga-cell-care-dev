-- Supabase Database Schema for Suranga Cell Care
-- This schema matches the fields used in the accessory-bill application

-- Customer Table
CREATE TABLE IF NOT EXISTS customer (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on contact to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_contact ON customer(contact);

-- Accessory Bill Table
CREATE TABLE IF NOT EXISTS accessorybill (
  id BIGSERIAL PRIMARY KEY,
  orders JSONB NOT NULL,                  -- Array of ordered items
  time TEXT NOT NULL,                     -- Time of bill (HH:MM format)
  date TEXT NOT NULL,                     -- Date of bill
  amount NUMERIC(10, 2) NOT NULL,         -- Total amount
  type TEXT NOT NULL,                     -- Payment type: 'cash' or 'card'
  print BOOLEAN DEFAULT true,             -- Print status
  discount NUMERIC(10, 2) DEFAULT 0,      -- Additional discount
  totalDiscount NUMERIC(10, 2) DEFAULT 0, -- Total discount including item discounts
  netValue NUMERIC(10, 2) NOT NULL,       -- Final net value after discounts
  name TEXT NOT NULL,                     -- Customer name
  contact TEXT NOT NULL,                  -- Customer contact number
  returnid TEXT,                          -- Return ID if applicable
  returnstatus BOOLEAN DEFAULT false,     -- Whether this is a return transaction
  status BOOLEAN DEFAULT true,            -- Bill status (active/inactive)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_accessorybill_contact ON accessorybill(contact);
CREATE INDEX IF NOT EXISTS idx_accessorybill_date ON accessorybill(date);
CREATE INDEX IF NOT EXISTS idx_accessorybill_status ON accessorybill(status);
CREATE INDEX IF NOT EXISTS idx_accessorybill_created_at ON accessorybill(created_at);

-- ItemManagementAcce Table (referenced in the code for stock updates)
CREATE TABLE IF NOT EXISTS "ItemManagementAcce" (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,              -- Item code (first 4 digits of barcode)
  category TEXT,
  model TEXT,
  brand TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,    -- Available stock quantity
  sellingPrice NUMERIC(10, 2),
  warranty TEXT,
  storage TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itemmanagementacce_code ON "ItemManagementAcce"(code);

-- Return Table (referenced in the code)
CREATE TABLE IF NOT EXISTS return (
  id BIGSERIAL PRIMARY KEY,
  sold_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments to tables
COMMENT ON TABLE customer IS 'Stores customer information with contact as unique identifier';
COMMENT ON TABLE accessorybill IS 'Stores all accessory bills/invoices with complete order details';
COMMENT ON TABLE "ItemManagementAcce" IS 'Inventory management for accessories';
COMMENT ON TABLE return IS 'Tracks return transactions';

-- Sample query to verify contact validation matches your code
-- SELECT * FROM accessorybill WHERE contact IS NOT NULL AND contact != '' AND contact != '0';

