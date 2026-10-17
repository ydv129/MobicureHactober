#!/usr/bin/env python3
"""Dev start"""

import subprocess
import sys
import os
import time
import signal
import atexit
from pathlib import Path

processes = []
is_shutting_down = False

def cleanup_processes():
    """Clean up all child processes"""
    global is_shutting_down
    if is_shutting_down:
        return
    
    is_shutting_down = True
    print("\n\nShutting down all services...")
    
    for proc in processes:
        try:
            if proc.poll() is None:  # Process is still running
                if sys.platform == "win32":
                    # On Windows, use taskkill to properly terminate process tree
                    subprocess.run(
                        ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                else:
                    proc.terminate()
        except Exception as e:
            pass
    
    # Wait a moment for graceful shutdown
    time.sleep(0.5)
    
    # Force kill any remaining processes
    for proc in processes:
        try:
            if proc.poll() is None:
                proc.kill()
        except:
            pass
    
    print("All services stopped.")

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully by terminating all child processes"""
    cleanup_processes()
    sys.exit(0)

atexit.register(cleanup_processes)

def get_project_root():
    """Get the project root directory"""
    # Script is in scripts/ folder, so parent is project root
    return Path(__file__).parent.parent

def install_dependencies():
    """Install Python dependencies from requirements.txt"""
    print("Installing Python dependencies...")
    project_root = get_project_root()
    requirements_file = project_root / "requirements.txt"
    
    if not requirements_file.exists():
        print(f"Warning: requirements.txt not found at {requirements_file}")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", str(requirements_file)],
            cwd=str(project_root),
            check=True,
            capture_output=True,
            text=True
        )
        print("Dependencies installed successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return False

def start_microservice(service_script, args=None):
    """Start a Python microservice in the background"""
    project_root = get_project_root()
    script_path = project_root / "scripts" / service_script
    
    if not script_path.exists():
        print(f"Warning: Service script not found: {script_path}")
        return None
    
    cmd = [sys.executable, str(script_path)]
    if args:
        cmd.extend(args)
    
    try:
        # Start process without creating a new window on Windows
        creation_flags = 0
        if sys.platform == "win32":
            # CREATE_NO_WINDOW prevents console window, CREATE_NEW_PROCESS_GROUP allows clean termination
            creation_flags = subprocess.CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP
            proc = subprocess.Popen(
                cmd,
                cwd=str(project_root),
                creationflags=creation_flags
            )
        else:
            proc = subprocess.Popen(
                cmd,
                cwd=str(project_root)
            )
        
        processes.append(proc)
        print(f"Started: {service_script} (PID: {proc.pid})")
        return proc
    except Exception as e:
        print(f"Error starting {service_script}: {e}")
        return None

def start_nextjs_dev():
    """Start Next.js development server in the foreground"""
    print("\nStarting Next.js dev server...")
    project_root = get_project_root()
    
    # Determine which package manager command to use for running next
    if (project_root / "package-lock.json").exists():
        base_cmd = "npx"
        next_args = ["next", "dev"]
    elif (project_root / "yarn.lock").exists():
        base_cmd = "yarn"
        next_args = ["next", "dev"]
    elif (project_root / "pnpm-lock.yaml").exists():
        base_cmd = "pnpm"
        next_args = ["next", "dev"]
    else:
        base_cmd = "npx"
        next_args = ["next", "dev"]
    
    try:
        # Build command based on platform
        if sys.platform == "win32":
            # On Windows, add .cmd extension to find the batch file
            cmd = [f"{base_cmd}.cmd"] + next_args
            # Use CREATE_NEW_PROCESS_GROUP to allow clean Ctrl+C handling
            proc = subprocess.Popen(
                cmd,
                cwd=str(project_root),
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
            )
        else:
            cmd = [base_cmd] + next_args
            proc = subprocess.Popen(
                cmd,
                cwd=str(project_root)
            )
        
        processes.append(proc)
        
        # Wait for the Next.js process to complete
        proc.wait()
    except KeyboardInterrupt:
        print("\nReceived interrupt signal...")
    except Exception as e:
        print(f"Error starting Next.js dev server: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup all processes when Next.js exits
        cleanup_processes()

def main():
    """Main function to orchestrate service startup"""
    print("=" * 60)
    print("TY PROJECT - Service Startup Script")
    print("=" * 60)
    print()
    
    # Register signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    if hasattr(signal, 'SIGTERM'):
        signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Change to project root directory
        project_root = get_project_root()
        os.chdir(project_root)
        print(f"Project root: {project_root}\n")
        
        # Step 1: Install Python dependencies
        if not install_dependencies():
            print("\nFailed to install dependencies. Continuing anyway...")
        
        print("\n" + "-" * 60)
        print("Starting microservices...")
        print("-" * 60 + "\n")
        
        # Step 2: Start all microservices in the background
        microservices = [
            ("../services/bridge_server.py", None),
            ("../services/image_metadata_scanner_service.py", ["--start"]),
            ("../services/apk_analyzer_service.py", None),
            ("../services/email_phishing_service.py", None),
            ("../services/network_scanner_service.py", None),
            ("../services/url_threat_scanner_service.py", None),
        ]
        
        for service_script, args in microservices:
            start_microservice(service_script, args)
            # Small delay between service starts
            time.sleep(0.2)
        
        # Step 3: Wait for services to initialize
        print("\nWaiting for services to initialize...")
        time.sleep(2)
        
        print("\n" + "-" * 60)
        print("All microservices started successfully!")
        print("-" * 60 + "\n")
        
        # Step 4: Start Next.js dev server (foreground)
        start_nextjs_dev()
    except KeyboardInterrupt:
        print("\nShutdown requested...")
        cleanup_processes()
    except Exception as e:
        print(f"\nError in main: {e}")
        import traceback
        traceback.print_exc()
        cleanup_processes()

if __name__ == "__main__":
    main()
