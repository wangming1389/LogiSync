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
function JsonPost { param($url,$body,$token) $h = @{ 'Content-Type' = 'application/json' }; if ($token) { $h['Authorization'] = 'Bearer ' + $token }; Write-Host "JSON POST -> $url"; return Invoke-RestMethod -Method Post -Uri $url -Body (ConvertTo-Json $body -Depth 10) -Headers $h }
function JsonGet { param($url,$token) $h = @{}; if ($token) { $h['Authorization'] = 'Bearer ' + $token }; Write-Host "JSON GET  -> $url"; return Invoke-RestMethod -Uri $url -Headers $h }

Write-Output '1) Login as buyer'
$testUrl = $base + '/auth/login'
Write-Output " BASE: $base"
Write-Output " TEST URL: $testUrl"
$bLogin = JsonPost $testUrl @{ email = 'buyer.staff@logisync.local'; password = 'Buyer@123456' } $null
$buyerToken = AccessToken $bLogin
if (-not $buyerToken) { Write-Output "Buyer login failed: $($bLogin | ConvertTo-Json -Depth 4)"; exit 1 }
Write-Output " buyer token length: $($buyerToken.Length)"

Write-Output '1b) Login as supplier'
$sLogin = JsonPost "$base/auth/login" @{ email = 'supplier.staff@logisync.local'; password = 'Supplier@123456' } $null
$supToken = AccessToken $sLogin
if (-not $supToken) { Write-Output "Supplier login failed: $($sLogin | ConvertTo-Json -Depth 4)"; exit 1 }
$supplierMe = ApiData (JsonGet "$base/auth/me" $supToken)
$supplierWorkspaceId = $supplierMe.workspaceId
if (-not $supplierWorkspaceId) { Write-Output "Cannot read supplier workspace: $($supplierMe | ConvertTo-Json -Depth 4)"; exit 1 }
Write-Output " supplier token length: $($supToken.Length)"
Write-Output " supplier workspace id: $supplierWorkspaceId"

Write-Output '2) Search products'
$p = JsonGet "$base/products/search?limit=5&supplierWorkspaceIds=$supplierWorkspaceId" $buyerToken
$items = ResponseItems $p
if (-not $items -or $items.Count -eq 0) { Write-Output 'No products found'; exit 1 }
$prod = $items[0]
$prodId = $prod.id
Write-Output " picked product id: $prodId"

Write-Output '3) Create RFQ (draft)'
$created = JsonPost "$base/rfqs" @{ note = 'smoke e2e test' } $buyerToken
$rfqId = if ($created.data -and $created.data.id) { $created.data.id } elseif ($created.id) { $created.id } else { $null }
if (-not $rfqId) { Write-Output "Failed to create RFQ: $($created | ConvertTo-Json -Depth 3)"; exit 1 }
Write-Output " created rfq: $rfqId"

Write-Output '4) Add item to RFQ'
$add = JsonPost "$base/rfqs/$rfqId/items" @{ productId = $prodId; quantity = 1; deliveryDate = '2026-06-01' } $buyerToken
Write-Output " add item response: $($add | ConvertTo-Json -Depth 3)"

Write-Output '5) Submit RFQ (split to child RFQs)'
$submit = JsonPost "$base/rfqs/$rfqId/submit" @{} $buyerToken
Write-Output " submit response: $($submit | ConvertTo-Json -Depth 5)"

Write-Output '6) Reuse supplier session'

Write-Output '7) List RFQs for supplier (pending_response)'
$list = JsonGet "$base/rfqs?status=pending_response" $supToken
$listItems = ResponseItems $list
if (-not $listItems -or $listItems.Count -eq 0) { Write-Output 'No child RFQs visible to supplier'; exit 1 }
$child = $listItems[0]
$childId = $child.id
Write-Output " child rfq id: $childId"

Write-Output '8) Get child RFQ detail to obtain rfqItemId'
$childDetail = JsonGet "$base/rfqs/$childId" $supToken
$rfqItems = ResponseItems $childDetail
if (-not $rfqItems -or $rfqItems.Count -eq 0) { Write-Output 'No items on child RFQ'; exit 1 }
$rfqItemId = $rfqItems[0].id
Write-Output " rfqItemId: $rfqItemId"

Write-Output '9) Supplier submit quotation'
$quoteBody = @{ mode = 'submit'; unitPrice = 12000; estimatedDeliveryDate = '2026-06-10'; deliveryTerms = 'DAP'; note = 'smoke test'; items = @( @{ rfqItemId = $rfqItemId; unitPrice = 12000; quantity = 1 } ) }
$quoteCreated = JsonPost "$base/rfqs/$childId/quotations" $quoteBody $supToken
$quoteId = if ($quoteCreated.data -and $quoteCreated.data.id) { $quoteCreated.data.id } elseif ($quoteCreated.id) { $quoteCreated.id } else { $null }
if (-not $quoteId) { Write-Output "Failed to create quotation: $($quoteCreated | ConvertTo-Json -Depth 3)"; exit 1 }
Write-Output " created quotation id: $quoteId"

Write-Output '10) Buyer selects the created quotation (create PO)'
$selectedQuoteId = $quoteId
if (-not $selectedQuoteId) { Write-Output 'No quotation id available to select'; exit 1 }
Write-Output " selecting quotation id: $selectedQuoteId"

Write-Output '11) Select quotation'
$sel = JsonPost "$base/quotations/$selectedQuoteId/select" @{} $buyerToken
Write-Output " select response: $($sel | ConvertTo-Json -Depth 5)"

Write-Output 'SMOKE E2E completed'
exit 0

