const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({ input: fs.createReadStream('C:/Users/harik/.gemini/antigravity-ide/brain/190e2b2e-db0f-4973-81ff-c4d076c6e270/.system_generated/logs/transcript.jsonl') });
rl.on('line', l => {
  if (l.includes('"step_index":154')) {
    const obj = JSON.parse(l);
    console.log(obj.tool_calls[0].args.CommandLine);
  }
});
