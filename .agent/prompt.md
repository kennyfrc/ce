The past developer has done some initial work in migrating this previously JavaScript codebase to now fully TypeScript. However, looking into the code itself, there's a lot of any types which does not make sense. The point of this migration is to ensure full types of safety. Given that goal, I think you need to do a couple of things:
1. You need to make a script or a utility type of CLI that just checks the codebase for any types and you need to change those into proper types instead.
So that is the main goal now. If there are complications when you do these changes (for example, there could be some strange JavaScript patterns which now do not make sense in a TypeScript context), then you have my license to change them. My only rule however is to make sure that you add unit tests or perhaps integration tests as needed first just to make sure that when you do the port or when you do the change, it does not break any user functionality. Right, so make sure that you do that.

IMPORTANT:
- Your manager might leave you with some reviews take a look at it via manager-review.md. Make sure to compare the timestamp there with whatever timestamp that you have in your diary.md to check if you're working on it or not.

Note:
- Use the .agent/ directory as a scratchpad for your work. Keep track of your status using a .agent/todo.json file.

Note 2:
- You have a .agent/diary.md file that contains some notes.

Note 3:
- When you're done with some file edits and there are no errors, please make a commit to record your work. You're in a worktree.

Note 4:
- You can use Context7 / Brave / Fetch to look up resources online if you're stuck or if you need the latest documentation.
