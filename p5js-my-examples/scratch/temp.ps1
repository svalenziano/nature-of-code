$VerbosePreference = 'Continue'

Write-Verbose "Starting!"

# 1) Gather just the file names (and full paths for reference)
$left  = Get-ChildItem -File -Recurse "E:\" |
         Select-Object Name, FullName

$right = Get-ChildItem -File -Recurse "D:\Mel_Junk\OneDrive" |
         Select-Object Name, FullName

# Sanity-check logging
Write-Verbose "Left contains $($left.Count) files"
Write-Verbose "Right contains $($right.Count) files"

# 2) Compare on the Name property
$compareParams = @{
    ReferenceObject  = $left
    DifferenceObject = $right
    Property         = 'Name'
    PassThru         = $true
}
$diff = Compare-Object @compareParams

# 3) Filter down to items only in $left
$onlyInLeft = $diff | Where-Object { $_.SideIndicator -eq '<=' }

# LOGGING
if ($onlyInLeft) {
  Write-Verbose "$($onlyInLeft.Count) Files were only found on the left side!"
} else {
  Write-Host "No differences found!  Are you sure you're using the correct LEFT directory?"
}


# OUTPUT -------------------------------------------------------------------
# Only use one of these options.  Comment the rest out.

# OPTION 0
# $onlyInLeft | Format-Table Name, FullName | Out-Host -Paging


# OPTION 1
$onlyInLeft | Out-GridView -Title "ONLY ON LEFT"

# OPTION 2
# $onlyInLeft | ConvertTo-Html -Property Name,FullName `
#                          -Title 'Only On Left' `
#                        | Out-File "C:\temp\onlyInLeft.html"
# Start-Process "C:\temp\onlyInLeft.html"


Write-Host "Done!"