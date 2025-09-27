#!/usr/bin/env node

/**
 * Production starter script
 * Starts both the API server and BullMQ worker
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Backend Evaluation Service in Production Mode');

// Start API server
const apiServer = spawn('node', [path.join(__dirname, 'dist/app.js')], {
  stdio: 'inherit',
  env: { ...process.env, PROCESS_TYPE: 'api' }
});

// Start BullMQ worker
const worker = spawn('node', [path.join(__dirname, 'dist/worker.js')], {
  stdio: 'inherit',
  env: { ...process.env, PROCESS_TYPE: 'worker' }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('📪 Received SIGTERM, shutting down...');
  apiServer.kill('SIGTERM');
  worker.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📪 Received SIGINT, shutting down...');
  apiServer.kill('SIGINT');
  worker.kill('SIGINT');
});

// Handle child process exits
apiServer.on('exit', (code) => {
  console.log(`🔴 API Server exited with code ${code}`);
  if (code !== 0) {
    worker.kill();
    process.exit(code);
  }
});

worker.on('exit', (code) => {
  console.log(`🔴 Worker exited with code ${code}`);
  if (code !== 0) {
    apiServer.kill();
    process.exit(code);
  }
});

console.log('✅ Both API server and worker are starting...');