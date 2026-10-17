#!/usr/bin/env python3
"""Network scanner"""

import socket
import time
import subprocess
import platform
import ipaddress
import concurrent.futures
from datetime import datetime
import json
import requests
from typing import Dict, List, Any, Optional

class NetworkScanner:
    def __init__(self):
        self.timeout = 1
        self.max_threads = 50

    def scan_network(self, network_range: str = None) -> Dict[str, Any]:
        """
        Full network scan with device discovery
        """
        start_time = time.time()
        try:
            if not network_range:
                network_range = self._get_local_network()
            
            print(f"Scanning network: {network_range}")
            
            active_devices = self._discover_devices(network_range)
            
            detailed_devices = []
            for device in active_devices:
                device_info = self._get_device_details(device)
                detailed_devices.append(device_info)
            
            # Network statistics
            stats = {
                "total_devices": len(detailed_devices),
                "secure_devices": len([d for d in detailed_devices if d.get('is_secure', True)]),
                "unknown_devices": len([d for d in detailed_devices if d.get('device_type') == 'Unknown']),
                "scan_timestamp": datetime.now().isoformat()
            }
            
            return {
                "network_range": network_range,
                "devices": detailed_devices,
                "statistics": stats,
                "scan_duration": f"{time.time() - start_time:.2f} seconds"
            }
            
        except Exception as e:
            return {
                "error": f"Network scan failed: {str(e)}",
                "devices": [],
                "statistics": {},
                "scan_timestamp": datetime.now().isoformat()
            }

    def _get_local_network(self) -> str:
        """
        Determine the local network range
        """
        try:
            # Get default gateway
            if platform.system() == "Windows":
                result = subprocess.run(['ipconfig'], capture_output=True, text=True)
                # Parse Windows ipconfig output
                return "192.168.1.0/24"  # Default assumption
            else:
                result = subprocess.run(['ip', 'route'], capture_output=True, text=True)
                # Parse Linux ip route output
                return "192.168.1.0/24"  # Default assumption
        except:
            return "192.168.1.0/24"  # Fallback

    def _discover_devices(self, network_range: str) -> List[str]:
        """
        Discover active devices on the network
        """
        network = ipaddress.IPv4Network(network_range, strict=False)
        active_ips = []
        
        def ping_host(ip):
            try:
                if platform.system() == "Windows":
                    result = subprocess.run(['ping', '-n', '1', '-w', '1000', str(ip)], 
                                          capture_output=True, text=True)
                else:
                    result = subprocess.run(['ping', '-c', '1', '-W', '1', str(ip)], 
                                          capture_output=True, text=True)
                
                if result.returncode == 0:
                    return str(ip)
            except:
                pass
            return None
        
        # Use threading for faster scanning
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_threads) as executor:
            futures = [executor.submit(ping_host, ip) for ip in network.hosts()]
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                if result:
                    active_ips.append(result)
        
        return active_ips

    def _get_device_details(self, ip: str) -> Dict[str, Any]:
        """
        Get detailed information about a network device
        """
        device_info = {
            "ip": ip,
            "hostname": "Unknown",
            "device_type": "Unknown",
            "mac_address": None,
            "vendor": None,
            "open_ports": [],
            "is_secure": True,
            "last_seen": datetime.now().isoformat(),
            "geolocation": None
        }
        
        try:
            # Try to resolve hostname
            try:
                hostname = socket.gethostbyaddr(ip)[0]
                device_info["hostname"] = hostname
                
                # Guess device type from hostname
                if any(term in hostname.lower() for term in ['router', 'gateway']):
                    device_info["device_type"] = "Router"
                elif any(term in hostname.lower() for term in ['phone', 'iphone', 'android']):
                    device_info["device_type"] = "Mobile"
                elif any(term in hostname.lower() for term in ['pc', 'desktop', 'laptop']):
                    device_info["device_type"] = "Computer"
                else:
                    device_info["device_type"] = "Unknown"
                    device_info["is_secure"] = False  # Unknown devices are flagged
                    
            except socket.herror:
                device_info["hostname"] = f"Device-{ip.split('.')[-1]}"
                device_info["is_secure"] = False
            
            # Check common ports
            common_ports = [22, 23, 53, 80, 135, 139, 443, 445, 993, 995]
            open_ports = []
            
            for port in common_ports:
                if self._check_port(ip, port):
                    open_ports.append(port)
            
            device_info["open_ports"] = open_ports
            
            # Security assessment
            if 23 in open_ports:  # Telnet
                device_info["is_secure"] = False
            if len(open_ports) > 5:  # Many open ports
                device_info["is_secure"] = False
            
            # Try to get geolocation for external IPs
            if not ipaddress.ip_address(ip).is_private:
                geo_info = self._get_geolocation(ip)
                device_info["geolocation"] = geo_info
            
        except Exception as e:
            device_info["error"] = str(e)
        
        return device_info

    def _check_port(self, ip: str, port: int) -> bool:
        """
        Check if a port is open on the target IP
        """
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            result = sock.connect_ex((ip, port))
            sock.close()
            return result == 0
        except:
            return False

    def _get_geolocation(self, ip: str) -> Optional[Dict[str, Any]]:
        """
        Get geolocation information for an IP address
        """
        try:
            # Using a free IP geolocation service
            response = requests.get(f"https://ip-api.com/json/{ip}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    return {
                        "country": data.get('country'),
                        "region": data.get('regionName'),
                        "city": data.get('city'),
                        "isp": data.get('isp'),
                        "lat": data.get('lat'),
                        "lon": data.get('lon')
                    }
        except:
            pass
        return None

def handler(request):
    """Python Function Handler for HTTP requests (Vercel references removed)"""
    try:
        if isinstance(request, dict):  # dict format
            body = request.get('body', {})
            if isinstance(body, str):
                body = json.loads(body)
        else:
            body = request
        
        network_range = body.get('network_range')
        
        scanner = NetworkScanner()
        result = scanner.scan_network(network_range)
        
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

# Example usage
if __name__ == "__main__":
    scanner = NetworkScanner()
    result = scanner.scan_network()
    
    print(f"Network Scan Results:")
    print(f"Devices found: {result['statistics']['total_devices']}")
    print(f"Secure devices: {result['statistics']['secure_devices']}")
    print(f"Unknown devices: {result['statistics']['unknown_devices']}")
    
    for device in result['devices']:
        print(f"\nDevice: {device['hostname']} ({device['ip']})")
        print(f"Type: {device['device_type']}")
        print(f"Secure: {device['is_secure']}")
        if device['open_ports']:
            print(f"Open ports: {device['open_ports']}")
