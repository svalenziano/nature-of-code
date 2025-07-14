# 1) Gather just the file names (and full paths for reference)
$left  = Get-ChildItem -File -Recurse "C:\Users\senor\OneDrive\Desktop\temp\105 bonner deck (to share)" |
         Select-Object Name, FullName

$right = Get-ChildItem -File -Recurse "H:\My Drive\Public\105 bonner deck (to share)" |
         Select-Object Name, FullName

# 2) Compare on the Name property
$diff = Compare-Object -ReferenceObject $left `
                       -DifferenceObject $right `
                       -Property Name `
                       -PassThru

# 3) Filter down to items only in $left
$onlyInLeft = $diff | Where-Object { $_.SideIndicator -eq '<=' }

# 4) Show in a grid
$onlyInLeft | Out-GridView -Title "ONLY ON LEFT"