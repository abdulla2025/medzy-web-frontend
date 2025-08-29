#!/usr/bin/env python3
"""
Systematic script to replace all hardcoded /api/ calls with API_ENDPOINTS usage
"""

import os
import re

# Directory to search
FRONTEND_DIR = r"c:\Users\USER\Downloads\One last Done\deploy\project\frontend\src"

# Mapping of hardcoded URLs to API_ENDPOINTS usage
API_REPLACEMENTS = {
    # Auth endpoints
    "'/api/auth/me'": "API_ENDPOINTS.AUTH.ME",
    "'/api/auth/signin'": "API_ENDPOINTS.AUTH.SIGNIN", 
    "'/api/auth/signup'": "API_ENDPOINTS.AUTH.SIGNUP",
    "'/api/auth/logout'": "API_ENDPOINTS.AUTH.LOGOUT",
    "'/api/auth/forgot-password'": "API_ENDPOINTS.AUTH.FORGOT_PASSWORD",
    "'/api/auth/reset-password'": "API_ENDPOINTS.AUTH.RESET_PASSWORD",
    "'/api/auth/verify-email'": "API_ENDPOINTS.AUTH.VERIFY_EMAIL",
    "'/api/auth/resend-verification'": "API_ENDPOINTS.AUTH.RESEND_VERIFICATION",
    "'/api/auth/force-login'": "API_ENDPOINTS.AUTH.FORCE_LOGIN",
    
    # Medicine endpoints
    "'/api/medicine-requests'": "API_ENDPOINTS.MEDICINE_REQUESTS.BASE",
    "'/api/medicine-requests/my-requests'": "API_ENDPOINTS.MEDICINE_REQUESTS.MY_REQUESTS",
    "'/api/medicine-requests/all'": "API_ENDPOINTS.MEDICINE_REQUESTS.ALL",
    "'/api/medicine-reminders'": "API_ENDPOINTS.MEDICINE_REMINDERS.BASE",
    "'/api/medicine-reminders/today'": "API_ENDPOINTS.MEDICINE_REMINDERS.TODAY",
    
    # Smart Doctor endpoints  
    "'/api/smart-doctor/analyze-symptoms'": "API_ENDPOINTS.SMART_DOCTOR.ANALYZE_SYMPTOMS",
    "'/api/smart-doctor/extract-prescription'": "API_ENDPOINTS.SMART_DOCTOR.EXTRACT_PRESCRIPTION",
    "'/api/smart-doctor/personalized-profile'": "API_ENDPOINTS.SMART_DOCTOR.PERSONALIZED_PROFILE", 
    "'/api/smart-doctor/medicine-recommendations'": "API_ENDPOINTS.SMART_DOCTOR.MEDICINE_RECOMMENDATIONS",
    
    # Payment endpoints
    "'/api/payments/create'": "API_ENDPOINTS.PAYMENTS.CREATE",
    
    # Cart and Orders
    "'/api/cart/count'": "API_ENDPOINTS.CART.COUNT",
    "'/api/orders/my-orders'": "API_ENDPOINTS.ORDERS.MY_ORDERS",
    
    # Support and other endpoints
    "'/api/support/my-tickets'": "API_ENDPOINTS.SUPPORT.MY_TICKETS",
    "'/api/daily-updates'": "API_ENDPOINTS.DAILY_UPDATES.BASE",
    "'/api/customer-points/balance'": "API_ENDPOINTS.CUSTOMER_POINTS.BALANCE",
    "'/api/customer-points/transactions'": "API_ENDPOINTS.CUSTOMER_POINTS.TRANSACTIONS",
    "'/api/medical-profile/medical-history'": "API_ENDPOINTS.MEDICAL_PROFILE.MEDICAL_HISTORY",
}

# Files that need API_ENDPOINTS import added
IMPORT_ADDITIONS = [
    "MedicineRequestManagement.jsx",
    "MedicineRequestForm.jsx", 
    "MedicineReminderManager.jsx",
    "EnhancedSmartDoctorClean.jsx",
    "EnhancedPaymentGateway.jsx",
    "EmailVerification.jsx",
    "EnhancedSmartDoctor.jsx",
    "DailyUpdates.jsx",
    "CustomerPointsPopup.jsx",
    "CustomerDashboard.jsx"
]

def add_api_import(file_path):
    """Add API_ENDPOINTS import if not already present"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if import already exists
    if "API_ENDPOINTS" in content:
        return False
        
    # Find the last import line and add after it
    lines = content.split('\n')
    last_import_idx = -1
    
    for i, line in enumerate(lines):
        if line.strip().startswith('import '):
            last_import_idx = i
    
    if last_import_idx != -1:
        lines.insert(last_import_idx + 1, "import { API_ENDPOINTS } from '../config/api';")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        return True
    return False

def replace_apis_in_file(file_path):
    """Replace hardcoded API calls in a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    replacements_made = 0
    
    # Apply all replacements
    for old_api, new_api in API_REPLACEMENTS.items():
        if old_api in content:
            content = content.replace(old_api, new_api)
            replacements_made += 1
    
    # Special handling for query parameter endpoints
    content = re.sub(r"'/api/medicine-reminders/adherence\?period=weekly'", "API_ENDPOINTS.MEDICINE_REMINDERS.ADHERENCE + '?period=weekly'", content)
    
    # Write back if changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return replacements_made
    return 0

def main():
    total_files_processed = 0
    total_replacements = 0
    
    # Walk through all JS/JSX files
    for root, dirs, files in os.walk(FRONTEND_DIR):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                file_path = os.path.join(root, file)
                
                # Add import if needed
                if file in IMPORT_ADDITIONS:
                    if add_api_import(file_path):
                        print(f"✅ Added API_ENDPOINTS import to {file}")
                
                # Replace API calls
                replacements = replace_apis_in_file(file_path)
                if replacements > 0:
                    print(f"🔄 Fixed {replacements} API endpoints in {file}")
                    total_files_processed += 1
                    total_replacements += replacements
    
    print(f"\n🎉 Complete! Fixed {total_replacements} API endpoints across {total_files_processed} files")

if __name__ == "__main__":
    main()
