const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const targetDir = path.join(__dirname, 'src');
let timeout = null;
let isBuilding = false;
let isCoolingDown = false;
let queuedBuild = false;

console.log(`🚀 Auto-builder started. Watching '${path.basename(targetDir)}/' for changes...`);

function runBuild() {
  if (isBuilding || isCoolingDown) {
    if (isBuilding) queuedBuild = true;
    return;
  }

  isBuilding = true;
  console.log(`\n🔄 Change detected. Running 'npm run build'...\n`);

  const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });

  buildProcess.on('close', (code) => {
    isBuilding = false;
    
    if (code === 0) {
      console.log('\n✨ Build completed successfully. Waiting for next change...');
    } else {
      console.error(`\n❌ Build failed with exit code ${code}. Waiting for changes...`);
    }

    // 🧊 Start a brief cooldown period (1.5 seconds) to ignore file writes 
    // made by the build script itself (like version updates/meta files)
    isCoolingDown = true;
    setTimeout(() => {
      isCoolingDown = false;
      if (queuedBuild) {
        queuedBuild = false;
        runBuild();
      }
    }, 1500);
  });
}

// Watch the src directory recursively
fs.watch(targetDir, { recursive: true }, (eventType, filename) => {
  if (!filename) return;

  // Ignore if we are currently building or in the post-build cooldown window
  if (isBuilding || isCoolingDown) return;

  // Optional: Ignore build/dist folders just in case
  if (filename.includes('dist') || filename.includes('build')) return;

  // Debounce rapid file modifications
  if (timeout) clearTimeout(timeout);

  timeout = setTimeout(() => {
    runBuild();
  }, 400);
});