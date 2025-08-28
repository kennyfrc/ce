#!/bin/bash
# Clean exit handler for both opencode and this script
trap 'echo "Exiting..."; kill -TERM $OPENCODE_PID 2>/dev/null; exit 0' SIGINT SIGTERM

ITERATIONS="${1:-32}"

for i in $(seq "$ITERATIONS"); do
  echo "=== $(date) ===" | tee -a ./.agent/diary.md
  
  cat port.md | opencode run --agent build-gpt | tee -a ./.agent/diary.md &
  OPENCODE_PID=$!
  
  wait $OPENCODE_PID
  
  echo -e "===SLEEP===\n===SLEEP===\n"
  echo "looping ($i/$ITERATIONS)"
  sleep 20 
done
