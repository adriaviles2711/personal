# Monitored Server Dockerfile
FROM ubuntu:22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install SSH server and monitoring tools
RUN apt-get update && apt-get install -y \
    openssh-server \
    sudo \
    htop \
    iotop \
    net-tools \
    iputils-ping \
    curl \
    vim \
    procps \
    sysstat \
    && rm -rf /var/lib/apt/lists/*

# Create SSH directory
RUN mkdir /var/run/sshd

# Create monitoring user with sudo access
RUN useradd -m -s /bin/bash monitor && \
    echo "monitor:monitor123" | chpasswd && \
    usermod -aG sudo monitor && \
    echo "monitor ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Configure SSH
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    echo "AllowUsers monitor" >> /etc/ssh/sshd_config

# Generate SSH host keys
RUN ssh-keygen -A

# Expose SSH port
EXPOSE 22

# Copy setup script
COPY setup.sh /setup.sh
RUN chmod +x /setup.sh

# Start SSH service
CMD ["/usr/sbin/sshd", "-D"]
