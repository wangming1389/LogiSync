$ErrorActionPreference = 'Stop'
$base = 'http://localhost:9751'
function ApiData { param($response) if ($response -and $response.data) { return $response.data }; return $response }
function AccessToken { param($response) $data = ApiData $response; return $data.accessToken }
function ResponseItems {
	param($response)
	$data = ApiData $response
	if ($data -and $data.PSObject.Properties.Name -contains 'items') { return @($data.items) }
	if ($response -and $response.PSObject.Properties.Name -contains 'items') { return @($response.items) }
	return @($data)
}

Write-Output '1) Login as buyer'
$bPayload = @{ email = 'buyer.staff@logisync.local'; password = 'Buyer@123456' }
$bLogin = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (ConvertTo-Json $bPayload -Depth 10)
$buyerToken = AccessToken $bLogin
if (-not $buyerToken) { Write-Output "Buyer login failed: $($bLogin | ConvertTo-Json -Depth 4)"; exit 1 }
Write-Output " buyer token length: $($buyerToken.Length)"

Write-Output '1b) Login as supplier'
$sPayload = @{ email = 'supplier.staff@logisync.local'; password = 'Supplier@123456' }
$sLogin = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (ConvertTo-Json $sPayload -Depth 10)
$supToken = AccessToken $sLogin
if (-not $supToken) { Write-Output "Supplier login failed: $($sLogin | ConvertTo-Json -Depth 4)"; exit 1 }
$supplierMe = ApiData (Invoke-RestMethod -Uri "$base/auth/me" -Headers @{ Authorization = "Bearer $supToken" })
$supplierWorkspaceId = $supplierMe.workspaceId
if (-not $supplierWorkspaceId) { Write-Output "Cannot read supplier workspace: $($supplierMe | ConvertTo-Json -Depth 4)"; exit 1 }
Write-Output " supplier token length: $($supToken.Length)"
Write-Output " supplier workspace id: $supplierWorkspaceId"

Write-Output '2) Search products'
$p = Invoke-RestMethod -Uri "$base/products/search?limit=5&supplierWorkspaceIds=$supplierWorkspaceId" -Headers @{ Authorization = "Bearer $buyerToken" }
$items = ResponseItems $p
if (-not $items -or $items.Count -eq 0) { Write-Output 'No products found'; exit 1 }
$prod = $items[0]
$prodId = $prod.id
Write-Output " picked product id: $prodId"

Write-Output '3) Create RFQ (draft)'
$rfq = Invoke-RestMethod -Method Post -Uri "$base/rfqs" -ContentType 'application/json' -Headers @{ Authorization = "Bearer $buyerToken" } -Body (ConvertTo-Json @{ note = 'smoke e2e test' } -Depth 5)
$rfqId = $null
if ($rfq -and $rfq.data -and $rfq.data.id) { $rfqId = $rfq.data.id } elseif ($rfq -and $rfq.id) { $rfqId = $rfq.id }
Write-Output " created rfq: $rfqId"

Write-Output '4) Add item to RFQ'
$add = Invoke-RestMethod -Method Post -Uri "$base/rfqs/$rfqId/items" -ContentType 'application/json' -Headers @{ Authorization = "Bearer $buyerToken" } -Body (ConvertTo-Json @{ productId = $prodId; quantity = 1; deliveryDate = '2026-06-01' } -Depth 5)
Write-Output " add item response: $($add | ConvertTo-Json -Depth 3)"

Write-Output '5) Submit RFQ (split to child RFQs)'
$submit = Invoke-RestMethod -Method Post -Uri "$base/rfqs/$rfqId/submit" -Headers @{ Authorization = "Bearer $buyerToken" }
Write-Output " submit response: $($submit | ConvertTo-Json -Depth 5)"

Write-Output '6) Reuse supplier session'

Write-Output '7) List RFQs for supplier (pending_response)'
$list = Invoke-RestMethod -Uri "$base/rfqs?status=pending_response" -Headers @{ Authorization = "Bearer $supToken" }
$listItems = ResponseItems $list
if (-not $listItems -or $listItems.Count -eq 0) { Write-Output 'No child RFQs visible to supplier'; exit 1 }
$child = $listItems[0]
$childId = $child.id
Write-Output " child rfq id: $childId"

Write-Output '8) Get child RFQ detail to obtain rfqItemId'
$childDetail = Invoke-RestMethod -Uri "$base/rfqs/$childId" -Headers @{ Authorization = "Bearer $supToken" }
$rfqItems = ResponseItems $childDetail
if (-not $rfqItems -or $rfqItems.Count -eq 0) { Write-Output 'No items on child RFQ'; exit 1 }
$rfqItemId = $rfqItems[0].id
Write-Output " rfqItemId: $rfqItemId"

Write-Output '9) Supplier submit quotation'
$quoteObj = @{ mode = 'submit'; unitPrice = 12000; estimatedDeliveryDate = '2026-06-10'; deliveryTerms = 'DAP'; note = 'smoke test'; items = @(@{ rfqItemId = $rfqItemId; unitPrice = 12000; quantity = 1 }) }
$quoteCreated = Invoke-RestMethod -Method Post -Uri "$base/rfqs/$childId/quotations" -ContentType 'application/json' -Headers @{ Authorization = "Bearer $supToken" } -Body (ConvertTo-Json $quoteObj -Depth 6)
$quoteId = $null
if ($quoteCreated -and $quoteCreated.data -and $quoteCreated.data.id) { $quoteId = $quoteCreated.data.id } elseif ($quoteCreated -and $quoteCreated.id) { $quoteId = $quoteCreated.id }
Write-Output " created quotation id: $quoteId"

Write-Output '10) Buyer selects the created quotation (create PO)'
$selectedQuoteId = $quoteId
if (-not $selectedQuoteId) { Write-Output 'No quotation id available to select'; exit 1 }
Write-Output " selecting quotation id: $selectedQuoteId"
$sel = Invoke-RestMethod -Method Post -Uri "$base/quotations/$selectedQuoteId/select" -Headers @{ Authorization = "Bearer $buyerToken" }
Write-Output " select response: $($sel | ConvertTo-Json -Depth 5)"

Write-Output 'SMOKE E2E completed'
exit 0

