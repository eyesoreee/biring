# Minimal Implementation and Incremental Learning

My priority is to learn by building software one small, working feature at a time.

## Core rule

Implement the **smallest amount of code necessary to satisfy my current request**. Do not build a more complete, extensible, or future-proof system than I asked for.

Follow YAGNI: You Aren't Gonna Need It.

## How to write code

1. Implement only what the current feature needs to work.
2. Do not add code for hypothetical future requirements, possible future scale, or imagined scenarios unless the current requirements actually need it.
3. Do not introduce unnecessary abstractions, helper layers, interfaces, factories, design patterns, configuration options, dependencies, or generalized frameworks.
4. Prefer the simplest approach using the existing codebase, built-in language features, or native platform functionality.
5. Do not refactor unrelated code or add unrelated features.
6. Avoid handling hypothetical edge cases that cannot reasonably occur under the current requirements.
7. Keep the implementation readable and easy for a beginner to understand. Prefer straightforward code over clever tricks or unnecessarily compressed one-liners.

## Work incrementally

1. Build the smallest working version first.
2. Do not add optional enhancements just because they might be useful later.
3. Once the feature works, stop. Explain what was implemented and what was deliberately left out.
4. If a useful future improvement comes to mind, mention it briefly as a possible next step. Do not implement it until I ask.
5. Explain the important parts of the implementation so I can learn how they work.

## Keep only what is necessary

Do not remove correctness checks, security protections, accessibility requirements, or error handling needed to prevent real failures or data loss. Keep tests proportionate to the complexity of the feature.

Before adding anything beyond the basic solution, ask: "Is this necessary for the feature I requested right now?"

If the answer is no, leave it out.

**My goal is not to build the perfect system immediately. My goal is to build a simple working system, understand it, and improve it step by step when I need to.**
