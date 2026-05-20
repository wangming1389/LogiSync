$ErrorActionPreference = 'Stop'
$base = 'http://localhost:9751'
Write-Output '1) Login as buyer'
$loginBody = '{"email":"buyer.staff@logisync.local","password":"Buyer@123456"}'
$resp = & curl.exe -s -X POST -H "Content-Type: application/json" -d $loginBody "$base/auth/login" | ConvertFrom-Json
if (-not $resp.accessToken) { Write-Output "Login failed: $($resp | ConvertTo-Json -Depth 2)"; exit 1 }
$buyerToken = $resp.accessToken
Write-Output " buyer token length: $($buyerToken.Length)"

Write-Output '2) Search products'
$productsRaw = & curl.exe -s -H "Authorization: Bearer $buyerToken" "$base/products/search?limit=5"
$p = $productsRaw | ConvertFrom-Json
$items = $null
if ($p -and $p.data -and $p.data.items) { $items = $p.data.items } elseif ($p -and $p.data) { $items = $p.data } elseif ($p -and $p.items) { $items = $p.items } else { $items = $p }
if (-not $items -or $items.Count -eq 0) { Write-Output 'No products found'; exit 1 }
$prod = $items[0]
$prodId = $prod.id
Write-Output " picked product id: $prodId"

Write-Output '3) Create RFQ (draft)'
$rfqBody = '{"note":"smoke e2e test"}'
$createRaw = & curl.exe -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $buyerToken" -d $rfqBody "$base/rfqs"
$created = $createRaw | ConvertFrom-Json
$rfqId = $null
if ($created.data -and $created.data.id) { $rfqId = $created.data.id } elseif ($created.id) { $rfqId = $created.id }
if (-not $rfqId) { Write-Output "Failed to create RFQ: $($created | ConvertTo-Json -Depth 3)"; exit 1 }
Write-Output " created rfq: $rfqId"

Write-Output '4) Add item to RFQ'
$addObj = @{ productId = $prodId; quantity = 1; deliveryDate = '2026-06-01' }
$addBody = $addObj | ConvertTo-Json -Depth 5
$addRaw = & curl.exe -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $buyerToken" -d $addBody "$base/rfqs/$rfqId/items"
$add = $addRaw | ConvertFrom-Json
Write-Output " add item response: $($add | ConvertTo-Json -Depth 3)"

Write-Output '5) Submit RFQ (split to child RFQs)'
$submitRaw = & curl.exe -s -X POST -H "Authorization: Bearer $buyerToken" "$base/rfqs/$rfqId/submit"
$submit = $submitRaw | ConvertFrom-Json
Write-Output " submit response: $($submit | ConvertTo-Json -Depth 5)"

Write-Output '6) Login as supplier'
$sLoginBody = '{"email":"supplier.staff@logisync.local","password":"Supplier@123456"}'
$sResp = & curl.exe -s -X POST -H "Content-Type: application/json" -d $sLoginBody "$base/auth/login" | ConvertFrom-Json
if (-not $sResp.accessToken) { Write-Output "Supplier login failed: $($sResp | ConvertTo-Json -Depth 2)"; exit 1 }
$supToken = $sResp.accessToken
Write-Output " supplier token length: $($supToken.Length)"

Write-Output '7) List RFQs for supplier (pending_response)'
$listRaw = & curl.exe -s -H "Authorization: Bearer $supToken" "$base/rfqs?status=pending_response"
$list = $listRaw | ConvertFrom-Json
if ($list -and $list.data -and $list.data.items) { $listItems = $list.data.items } elseif ($list -and $list.items) { $listItems = $list.items } elseif ($list -and $list.data) { $listItems = $list.data } else { $listItems = $list }
if (-not $listItems -or $listItems.Count -eq 0) { Write-Output 'No child RFQs visible to supplier'; exit 1 }
$child = $listItems[0]
$childId = $child.id
Write-Output " child rfq id: $childId"

Write-Output '8) Get child RFQ detail to obtain rfqItemId'
$childDetailRaw = & curl.exe -s -H "Authorization: Bearer $supToken" "$base/rfqs/$childId"
$childDetail = $childDetailRaw | ConvertFrom-Json
if ($childDetail -and $childDetail.items) { $rfqItems = $childDetail.items } elseif ($childDetail -and $childDetail.data -and $childDetail.data.items) { $rfqItems = $childDetail.data.items } elseif ($childDetail -and $childDetail.data) { $rfqItems = $childDetail.data } else { $rfqItems = $childDetail }
if (-not $rfqItems -or $rfqItems.Count -eq 0) { Write-Output 'No items on child RFQ'; exit 1 }
$rfqItemId = $rfqItems[0].id
Write-Output " rfqItemId: $rfqItemId"

Write-Output '9) Supplier submit quotation'
$quoteObj = @{ mode = 'submit'; unitPrice = 12000; estimatedDeliveryDate = '2026-06-10'; deliveryTerms = 'DAP'; note = 'smoke test'; items = @(@{ rfqItemId = $rfqItemId; unitPrice = 12000; quantity = 1 }) }
$quoteJson = $quoteObj | ConvertTo-Json -Depth 6
$quoteRaw = & curl.exe -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $supToken" -d $quoteJson "$base/rfqs/$childId/quotations"
$quoteCreated = $quoteRaw | ConvertFrom-Json
$quoteId = $null
if ($quoteCreated.data -and $quoteCreated.data.id) { $quoteId = $quoteCreated.data.id } elseif ($quoteCreated.id) { $quoteId = $quoteCreated.id }
if (-not $quoteId) { Write-Output "Failed to create quotation: $($quoteCreated | ConvertTo-Json -Depth 3)"; exit 1 }
Write-Output " created quotation id: $quoteId"

Write-Output '10) Buyer: list quotations for parent RFQ'
$buyerQuosRaw = & curl.exe -s -H "Authorization: Bearer $buyerToken" "$base/rfqs/$rfqId/quotations"
$buyerQuos = $buyerQuosRaw | ConvertFrom-Json
if ($buyerQuos -and $buyerQuos.data -and $buyerQuos.data.items) { $qList = $buyerQuos.data.items } elseif ($buyerQuos -and $buyerQuos.items) { $qList = $buyerQuos.items } elseif ($buyerQuos -and $buyerQuos.data) { $qList = $buyerQuos.data } else { $qList = $buyerQuos }
if (-not $qList -or $qList.Count -eq 0) { Write-Output 'No quotations found for RFQ'; exit 1 }
$selectedQuoteId = $qList[0].id
Write-Output " selected quotation id: $selectedQuoteId"

Write-Output '11) Buyer selects quotation (create PO)'
$selRaw = & curl.exe -s -X POST -H "Authorization: Bearer $buyerToken" "$base/quotations/$selectedQuoteId/select"
$sel = $selRaw | ConvertFrom-Json
Write-Output " select response: $($sel | ConvertTo-Json -Depth 5)"

Write-Output 'SMOKE E2E completed'
exit 0
