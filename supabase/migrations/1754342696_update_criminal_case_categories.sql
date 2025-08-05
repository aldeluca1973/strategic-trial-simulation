-- Migration: update_criminal_case_categories
-- Created at: 1754342696

-- Update murder and criminal cases to have correct category
UPDATE legal_cases 
SET case_category = 'criminal'
WHERE case_name IN (
  'Stein v. New York',
  'Davis v. United States'
) 
OR case_background LIKE '%murder%'
OR case_background LIKE '%killing%'
OR case_background LIKE '%homicide%'
OR case_background LIKE '%crime%'
OR case_background LIKE '%felony%'
OR case_background LIKE '%assault%'
OR case_background LIKE '%robbery%'
OR case_background LIKE '%theft%'
OR case_background LIKE '%convicted%'
OR case_background LIKE '%criminal%';;