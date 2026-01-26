#!/bin/bash
# Setup script for monitored servers

echo "====================================="
echo "  Monitored Server Setup"
echo "====================================="

echo "Server Name: ${SERVER_NAME:-UnknownServer}"
echo "Server Role: ${SERVER_ROLE:-generic}"
echo "Hostname: $(hostname)"
echo "====================================="

# Create some dummy processes to show in monitoring
if [ "$SERVER_ROLE" == "web" ]; then
    echo "Starting web server simulation..."
    # Simulate web server processes
elif [ "$SERVER_ROLE" == "database" ]; then
    echo "Starting database simulation..."
    # Simulate database processes
elif [ "$SERVER_ROLE" == "app" ]; then
    echo "Starting application simulation..."
    # Simulate app processes
fi

echo "Server setup complete"
