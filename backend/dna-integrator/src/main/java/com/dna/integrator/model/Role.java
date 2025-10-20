package com.dna.integrator.model;

public enum Role {
    USER,        // Regular users - can view and manage their own DNA data
    MODERATOR,   // Can moderate user content and assist with support
    ADMIN        // Full system access - can manage users, view audit logs, system config
}
