#!/bin/bash
# Clean exit handler for both opencode and this script
trap 'echo "Exiting..."; kill -TERM $OPENCODE_PID 2>/dev/null; exit 0' SIGINT SIGTERM

while :; do
  echo "=== $(date) ===" | tee -a ./.agent/diary.md
  
  # Run opencode in background and capture PID
  cat ./.agent/prompt.md | opencode run --agent build | tee -a ./.agent/diary.md &
  OPENCODE_PID=$!
  
  # Wait for opencode to complete
  wait $OPENCODE_PID
  
  echo -e "===SLEEP===\n===SLEEP===\n"
  echo 'looping'
  sleep 10
done