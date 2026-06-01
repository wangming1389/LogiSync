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
function CurlJson {
	param(
		[string]$Url,
		[string]$Body,
		[string]$Token = ''
	)
	$tmp = New-TemporaryFile
	try {
		Set-Content -LiteralPath $tmp -Value $Body -Encoding UTF8 -NoNewline
		$args = @('-s', '-X', 'POST', '-H', 'Content-Type: application/json')
		if ($Token) { $args += @('-H', "Authorization: Bearer $Token") }
		$args += @('--data-binary', "@$tmp", $Url)
		return & curl.exe @args
	} finally {
		Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
	}
}
Write-Output '1) Login as buyer'
$loginBody = '{"email":"buyer.staff@logisync.local","password":"Buyer@123456"}'
$resp = CurlJson "$base/auth/login" $loginBody | ConvertFrom-Json
$buyerToken = AccessToken $resp
if (-not $buyerToken) { Write-Output "Login failed: $($resp | ConvertTo-Json -Depth 4)"; exit 1 }
Write-Output " buyer token length: $($buyerToken.Length)"

Write-Output '1b) Login as supplier'
$sLoginBody = '{"email":"supplier.staff@logisync.local","password":"Supplier@123456"}'
$sResp = CurlJson "$base/auth/login" $sLoginBody | ConvertFrom-Json
$supToken = AccessToken $sResp
if (-not $supToken) { Write-Output "Supplier login failed: $($sResp | ConvertTo-Json -Depth 4)"; exit 1 }
$supplierMe = ApiData (& curl.exe -s -H "Authorization: Bearer $supToken" "$base/auth/me" | ConvertFrom-Json)
$supplierWorkspaceId = $supplierMe.workspaceId
if (-not $supplierWorkspaceId) { Write-Output "Cannot read supplier workspace: $($supplierMe | ConvertTo-Json -Depth 4)"; exit 1 }
Write-Output " supplier token length: $($supToken.Length)"
Write-Output " supplier workspace id: $supplierWorkspaceId"

Write-Output '2) Search products'
$productsRaw = & curl.exe -s -H "Authorization: Bearer $buyerToken" "$base/products/search?limit=5&supplierWorkspaceIds=$supplierWorkspaceId"
$p = $productsRaw | ConvertFrom-Json
$items = ResponseItems $p
if (-not $items -or $items.Count -eq 0) { Write-Output 'No products found'; exit 1 }
$prod = $items[0]
$prodId = $prod.id
Write-Output " picked product id: $prodId"

Write-Output '3) Create RFQ (draft)'
$rfqBody = '{"note":"smoke e2e test"}'
$createRaw = CurlJson "$base/rfqs" $rfqBody $buyerToken
$created = $createRaw | ConvertFrom-Json
$rfqId = $null
if ($created.data -and $created.data.id) { $rfqId = $created.data.id } elseif ($created.id) { $rfqId = $created.id }
if (-not $rfqId) { Write-Output "Failed to create RFQ: $($created | ConvertTo-Json -Depth 3)"; exit 1 }
Write-Output " created rfq: $rfqId"

Write-Output '4) Add item to RFQ'
$addObj = @{ productId = $prodId; quantity = 1; deliveryDate = '2026-06-01' }
$addBody = $addObj | ConvertTo-Json -Depth 5
$addRaw = CurlJson "$base/rfqs/$rfqId/items" $addBody $buyerToken
$add = $addRaw | ConvertFrom-Json
Write-Output " add item response: $($add | ConvertTo-Json -Depth 3)"

Write-Output '5) Submit RFQ (split to child RFQs)'
$submitRaw = & curl.exe -s -X POST -H "Authorization: Bearer $buyerToken" "$base/rfqs/$rfqId/submit"
$submit = $submitRaw | ConvertFrom-Json
Write-Output " submit response: $($submit | ConvertTo-Json -Depth 5)"

Write-Output '6) Reuse supplier session'

Write-Output '7) List RFQs for supplier (pending_response)'
$listRaw = & curl.exe -s -H "Authorization: Bearer $supToken" "$base/rfqs?status=pending_response"
$list = $listRaw | ConvertFrom-Json
$listItems = ResponseItems $list
if (-not $listItems -or $listItems.Count -eq 0) { Write-Output 'No child RFQs visible to supplier'; exit 1 }
$child = $listItems[0]
$childId = $child.id
Write-Output " child rfq id: $childId"

Write-Output '8) Get child RFQ detail to obtain rfqItemId'
$childDetailRaw = & curl.exe -s -H "Authorization: Bearer $supToken" "$base/rfqs/$childId"
$childDetail = $childDetailRaw | ConvertFrom-Json
$rfqItems = ResponseItems $childDetail
if (-not $rfqItems -or $rfqItems.Count -eq 0) { Write-Output 'No items on child RFQ'; exit 1 }
$rfqItemId = $rfqItems[0].id
Write-Output " rfqItemId: $rfqItemId"

Write-Output '9) Supplier submit quotation'
$quoteObj = @{ mode = 'submit'; unitPrice = 12000; estimatedDeliveryDate = '2026-06-10'; deliveryTerms = 'DAP'; note = 'smoke test'; items = @(@{ rfqItemId = $rfqItemId; unitPrice = 12000; quantity = 1 }) }
$quoteJson = $quoteObj | ConvertTo-Json -Depth 6
$quoteRaw = CurlJson "$base/rfqs/$childId/quotations" $quoteJson $supToken
$quoteCreated = $quoteRaw | ConvertFrom-Json
$quoteId = $null
if ($quoteCreated.data -and $quoteCreated.data.id) { $quoteId = $quoteCreated.data.id } elseif ($quoteCreated.id) { $quoteId = $quoteCreated.id }
if (-not $quoteId) { Write-Output "Failed to create quotation: $($quoteCreated | ConvertTo-Json -Depth 3)"; exit 1 }
Write-Output " created quotation id: $quoteId"

Write-Output '10) Buyer selects the created quotation (create PO)'
$selectedQuoteId = $quoteId
if (-not $selectedQuoteId) { Write-Output 'No quotation id available to select'; exit 1 }
Write-Output " selecting quotation id: $selectedQuoteId"

Write-Output '11) Select quotation'
$selRaw = & curl.exe -s -X POST -H "Authorization: Bearer $buyerToken" "$base/quotations/$selectedQuoteId/select"
$sel = $selRaw | ConvertFrom-Json
Write-Output " select response: $($sel | ConvertTo-Json -Depth 5)"

Write-Output 'SMOKE E2E completed'
exit 0

