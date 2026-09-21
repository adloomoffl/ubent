$objShell = New-Object -ComObject Shell.Application
$objFolder = $objShell.Namespace((Get-Location).Path)
$objFile = $objFolder.ParseName('LOGO ANIME.mp4')
0..320 | ForEach-Object {
    $name = $objFolder.GetDetailsOf($null, $_)
    $val = $objFolder.GetDetailsOf($objFile, $_)
    if ($val) {
        Write-Output "$_ | $name : $val"
    }
}
