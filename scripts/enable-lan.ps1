# Run as administrator. Only Node on this IP/port, from the local subnet.
$ErrorActionPreference = 'Stop'
$taskNodePath = (Get-Command node -ErrorAction Stop).Source
$taskRule = 'RedCero-Dev-LAN-3000'
if (Get-NetFirewallRule -Name $taskRule -ErrorAction SilentlyContinue) {
    Get-NetFirewallRule -Name $taskRule | Set-NetFirewallRule -Enabled True -Profile Any -Direction Inbound -Action Allow
} else {
    New-NetFirewallRule -Name $taskRule -DisplayName 'Red Cero desarrollo LAN Node 3000' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 -LocalAddress 192.168.1.150 -RemoteAddress LocalSubnet -Profile Any -Program $taskNodePath | Out-Null
}
Write-Host 'Red Cero LAN: http://192.168.1.150:3000/'
