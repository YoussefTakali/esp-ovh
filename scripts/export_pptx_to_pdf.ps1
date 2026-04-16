$ErrorActionPreference = 'Stop'

$pptxPath = "c:\Users\Youssef\OneDrive\Desktop\esprithub\EspriHub_Poster_Filled.pptx"
$pdfPath = "c:\Users\Youssef\OneDrive\Desktop\esprithub\EspriHub_Poster_Filled.pdf"

$powerpoint = New-Object -ComObject PowerPoint.Application
$powerpoint.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue

try {
    $presentation = $powerpoint.Presentations.Open($pptxPath, $false, $false, $false)
    # 32 = ppSaveAsPDF
    $presentation.SaveAs($pdfPath, 32)
    $presentation.Close()
}
finally {
    $powerpoint.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($powerpoint) | Out-Null
}

Write-Output "PDF written: $pdfPath"
