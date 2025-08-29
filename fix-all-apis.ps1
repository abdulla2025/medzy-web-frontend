# PowerShell script to fix all hardcoded API URLs

# List of components to fix
$components = @(
    "PaymentSuccess.jsx",
    "PaymentStatus.jsx", 
    "PaymentHistory.jsx",
    "PaymentCancelled.jsx",
    "OrderTracking.jsx",
    "OrderManagement.jsx",
    "MedicineRequestManagement.jsx",
    "MedicineReminderManager.jsx",
    "EnhancedSmartDoctor.jsx",
    "EnhancedPaymentGateway.jsx",
    "DailyUpdates.jsx",
    "CustomerPointsPopup.jsx",
    "AdminSupportManagement.jsx",
    "AdminRevenueManagement.jsx", 
    "AdminPaymentManagement.jsx"
)

foreach ($component in $components) {
    $filePath = "src\components\$component"
    
    if (Test-Path $filePath) {
        Write-Host "Fixing $component..."
        
        # Read content
        $content = Get-Content $filePath -Raw
        
        # Add API_ENDPOINTS import if not present
        if ($content -notmatch "import.*API_ENDPOINTS") {
            $content = $content -replace "(import.*from.*'../context/.*';)", "`$1`nimport { API_ENDPOINTS } from '../config/api';"
        }
        
        # Fix hardcoded URLs
        $content = $content -replace "fetch\('/api/", "fetch(`${API_ENDPOINTS.BASE_URL}/api/"
        $content = $content -replace "fetch\(`/api/", "fetch(`${API_ENDPOINTS.BASE_URL}/api/"
        
        # Write back
        Set-Content $filePath $content
        Write-Host "Fixed $component"
    }
}

Write-Host "All components fixed!"
