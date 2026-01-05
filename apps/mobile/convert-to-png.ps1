Add-Type -AssemblyName System.Drawing

$files = @('icon.png', 'splash.png', 'adaptive-icon.png')

foreach ($file in $files) {
    $path = Join-Path 'assets' $file
    Write-Host "Converting $file..."
    
    $img = [System.Drawing.Image]::FromFile((Resolve-Path $path).Path)
    $bitmap = New-Object System.Drawing.Bitmap $img.Width, $img.Height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.DrawImage($img, 0, 0, $img.Width, $img.Height)
    $graphics.Dispose()
    $img.Dispose()
    $bitmap.Save((Resolve-Path $path).Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    
    Write-Host "Converted $file to PNG"
}

Write-Host "All images converted successfully!"
